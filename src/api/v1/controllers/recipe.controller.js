// src/api/v1/controllers/recipe.controller.js
import crypto from 'crypto'
import RecipeCache from '../models/recipeCache.model.js'
import { generateRecipesWithGemini } from '../services/gemini.service.js'

/**
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns
 */
export const generateRecipes = async (req, res) => {
  const { ingredients, mealType, diet } = req.body

  // 1. Validación de entrada
  if (!ingredients || ingredients.length === 0 || !mealType || !diet) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos.' })
  }

  // 2. Crear un hash para la caché
  const sortedIngredients = [...ingredients].sort()
  const requestString = JSON.stringify({
    ingredients: sortedIngredients,
    mealType,
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
    const recipesData = await generateRecipesWithGemini({
      ingredients,
      mealType,
      diet
    })

    // 5. Guardar el nuevo resultado en la caché
    const newCacheEntry = new RecipeCache({
      requestHash,
      response: recipesData
    })
    await newCacheEntry.save()
    console.log('Resultado guardado en caché.')

    // 6. Enviar la respuesta al cliente
    return res.status(200).json(recipesData)
  } catch (error) {
    console.error('Error en el controlador de recetas:', error)
    return res.status(500).json({ message: 'Error interno del servidor.' })
  }
}
