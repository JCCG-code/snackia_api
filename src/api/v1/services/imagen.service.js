// Packages
import { GoogleGenAI, Type } from '@google/genai'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'
// Local files
import * as imagenPrompts from '../../../prompts/imagen.prompts.js'
import * as storageService from './storage.service.js'
import * as imageHelper from '../../../helpers/image.helper.js'

// Gen AI initialization
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)

/**
 * Allows to translate a name and description from a recipe to English
 * @param {string} recipeName Recipe name received
 * @param {string} recipeDescription Recipe description received
 * @returns An objecto with name and description translated to English
 */
export const translateTextForImagePrompt = async (
  recipeName,
  recipeDescription
) => {
  // Get prompt
  const prompt = imagenPrompts.createTranslationPrompt(
    recipeName,
    recipeDescription
  )
  try {
    const responseData = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING
            },
            description: {
              type: Type.STRING
            }
          },
          propertyOrdering: ['name', 'description']
        }
      }
    })
    const output = JSON.parse(responseData.text)
    // Return statement
    return output
  } catch (error) {
    console.error('Error en el servicio de Gemini:', error)
    throw new Error('No se pudo traducir el texto desde la IA.')
  }
}

/**
 * Allows to build a prompt fo imagen 3
 * @param {object} translatedRecipe recipe translated
 * @returns A prompt to imagen-3
 */
export const createRecipeImage = async (translatedRecipe) => {
  // Get prompt
  const prompt = imagenPrompts.createImagePromptForRecipe(translatedRecipe)
  try {
    const responseData = await genAI.models.generateImages({
      model: process.env.GEMINI_MODEL_IMAGE,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1'
      }
    })
    // Extracts imageBytes and mimeType
    const { imageBytes, mimeType } = responseData.generatedImages[0].image
    // Checks possible errors
    if (!imageBytes || !mimeType) {
      throw new Error('imageBytes o mimeType no han sido detectados.')
    }
    // Transform to buffer
    const originalImageBuffer = Buffer.from(imageBytes, 'base64')
    // Optimized buffer
    const { buffer: optimizedBuffer, contentType: optimizedContentType } =
      await imageHelper.optimizeImageBuffer(originalImageBuffer)
    // Uploads to GCS
    const publicUrl = await storageService.uploadBufferToGCS(optimizedBuffer, {
      path: 'recipes',
      contentType: optimizedContentType
    })
    // Return statement
    return publicUrl
  } catch (error) {
    console.error('Error en el servicio de Imagen 3:', error)
    throw new Error('No se puedo generar la imagen desde la IA.')
  }
}
