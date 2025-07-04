// src/api/v1/controllers/recipe.controller.js
import crypto from 'crypto'
import RecipeCache from '../models/recipeCache.model.js'
import * as geminiService from '../services/gemini.service.js'
import * as imagenService from '../services/imagen.service.js'

/**
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns
 */
export const generateRecipes = async (req, res) => {
  const { ingredients, mealType, persons, diet } = req.body

  // 1. Validación de entrada
  if (!ingredients || ingredients.length === 0 || !mealType || !diet) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos.' })
  }

  // 2. Crear un hash para la caché
  const sortedIngredients = [...ingredients].sort()
  const requestString = JSON.stringify({
    ingredients: sortedIngredients,
    mealType,
    persons,
    diet
  })
  const requestHash = crypto
    .createHash('sha256')
    .update(requestString)
    .digest('hex')

  try {
    // 3. Revisar la caché primero
    const cachedResult = await RecipeCache.findOne({ requestHash })
    if (cachedResult) {
      console.log('Respuesta encontrada en caché.')
      return res.status(200).json(cachedResult.response)
    }

    console.log('No hay caché. Llamando a Gemini...')
    // 4. Si no hay caché, llamar al servicio de Gemini
    console.log('Paso 1: Obteniendo plan de comidas...')
    const mealPlanResponse = await geminiService.createMealPlan({
      ingredients,
      mealType,
      persons
    })

    // Si la IA no encontró ningún plan viable, devolvemos un array vacío.
    if (
      !mealPlanResponse ||
      !mealPlanResponse.mealPlan ||
      mealPlanResponse.mealPlan.length === 0
    ) {
      console.log('La IA no encontró planes de comida viables.')
      return res.status(200).json({ generatedRecipes: [] })
    }

    const mealConcepts = mealPlanResponse.mealPlan
    console.log(
      `Paso 1 completado. Se encontraron ${mealConcepts.length} conceptos de recetas.`
    )

    // Developing recipes
    console.log('Paso 2: Desarrollando cada receta en paralelo...')
    const recipeDevelopmentPromises = mealConcepts.map(async (concept) => {
      const recipeDetailsInSpanish =
        // Get recipe
        await geminiService.createRecipeDevelopment(concept, persons, {
          diet
        })
      // Translate to English
      const translatedTexts = await imagenService.translateTextForImagePrompt(
        recipeDetailsInSpanish.name,
        recipeDetailsInSpanish.description
      )
      // Creates image
      const imageUrl = await imagenService.createRecipeImage(translatedTexts)
      // Return statement
      return {
        ...recipeDetailsInSpanish,
        imageUrl: imageUrl
      }
    })
    const settledResults = await Promise.allSettled(recipeDevelopmentPromises)

    const successfulRecipes = []
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulRecipes.push(result.value)
      } else {
        console.error(
          `Falló el desarrollo de la receta para el concepto '${mealConcepts[index].mealTitle}':`,
          result.reason
        )
      }
    })

    console.log(
      `Paso 2 completado. Se desarrollaron con éxito ${successfulRecipes.length} recetas.`
    )

    // 6. Formatear la respuesta final
    const finalResponse = { generatedRecipes: successfulRecipes }

    // 7. Guardar el resultado final agregado en la caché
    if (successfulRecipes && successfulRecipes.length > 0) {
      const newCacheEntry = new RecipeCache({
        requestHash,
        response: finalResponse
      })
      await newCacheEntry.save()
      console.log(
        `Respuesta con ${successfulRecipes.length} recetas guardada en caché.`
      )
    } else {
      console.log('Respuesta vacía o fallida, no se guardará en caché.')
    }

    return res.status(200).json(finalResponse)
  } catch (error) {
    console.error('Error en el controlador de recetas:', error)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}
