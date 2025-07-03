// Packages
import { GoogleGenAI, Type } from '@google/genai'
import 'dotenv/config'
// Local files
import * as recipePrompts from '../../../prompts/recipes.prompts.js'

// Gen AI initialization
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)

/**
 *
 * @param {*} filters
 * @returns
 */
export const createMealPlan = async (filters) => {
  // Get prompt
  const prompt = recipePrompts.createMealPlanPrompt(filters)
  try {
    const responseData = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealPlan: {
              type: Type.ARRAY,
              description:
                'Una lista de platos conceptuales que forman un menú coherente.',
              items: {
                type: Type.OBJECT,
                properties: {
                  mealTitle: {
                    type: Type.STRING,
                    description:
                      'Un nombre conceptual y atractivo para el plato.'
                  },
                  mealDescription: {
                    type: Type.STRING,
                    description:
                      'Una breve descripción que justifica por qué este plato es una buena idea con los ingredientes dados.'
                  },
                  course: {
                    type: Type.STRING,
                    description:
                      'Clasificación del plato. Debe ser "receta_estrella" para la opción principal, o "alternativa_completa" para las demás.',
                    enum: ['receta_estrella', 'alternativa_completa']
                  },
                  mainIngredients: {
                    type: Type.ARRAY,
                    description:
                      'La lista de ingredientes principales seleccionados para este plato con sus cantidades sugeridas.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: {
                          type: Type.STRING,
                          description: 'Nombre del ingrediente.'
                        },
                        quantity: {
                          type: Type.STRING,
                          description:
                            'Cantidad sugerida por persona (ej: "100g", "1 unidad").'
                        }
                      },
                      propertyOrdering: ['name', 'quantity']
                    }
                  }
                },
                propertyOrdering: [
                  'mealTitle',
                  'mealDescription',
                  'course',
                  'mainIngredients'
                ]
              }
            }
          },
          propertyOrdering: ['mealPlan']
        }
      }
    })
    const output = JSON.parse(responseData.text)
    // Return statement
    return output
  } catch (error) {
    console.error('Error en el servicio de Gemini:', error)
    throw new Error('No se pudieron generar las recetas desde la IA.')
  }
}

/**
 *
 * @param {*} mealConcept
 * @param {*} persons
 * @returns
 */
export const createRecipeDevelopment = async (
  mealConcept,
  persons,
  filters
) => {
  // Get prompt
  const prompt = recipePrompts.createRecipeDevelopmentPrompt(
    mealConcept,
    persons,
    filters
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
              type: Type.STRING,
              description: 'El nombre final, pulido y atractivo de la receta.'
            },
            description: {
              type: Type.STRING,
              description:
                'La descripción final y apetitosa para el usuario, enfocada en los sabores y texturas.'
            },
            ingredients: {
              type: Type.OBJECT,
              properties: {
                provided: {
                  type: Type.ARRAY,
                  description:
                    'Lista de ingredientes proporcionados con sus CANTIDADES TOTALES calculadas para todos los comensales.',
                  items: { type: Type.STRING }
                },
                needed: {
                  type: Type.ARRAY,
                  description:
                    'Lista de ingredientes esenciales adicionales (aceite, sal, especias, etc.) que el usuario podría necesitar.',
                  items: { type: Type.STRING }
                }
              },
              propertyOrdering: ['provided', 'needed']
            },
            instructions: {
              type: Type.ARRAY,
              description:
                'Una lista detallada de pasos a seguir. Cada paso debe ser claro y conciso. Puede incluir un "Consejo del Chef:" como último elemento.',
              items: { type: Type.STRING }
            },
            estimatedTime: {
              type: Type.NUMBER,
              description: 'Tiempo total estimado en minutos.'
            },
            difficulty: {
              type: Type.STRING,
              enum: ['fácil', 'media', 'difícil']
            }
          },
          propertyOrdering: [
            'name',
            'description',
            'ingredients',
            'instructions',
            'estimatedTime',
            'difficulty'
          ]
        }
      }
    })
    const output = JSON.parse(responseData.text)
    // Return statement
    return output
  } catch (error) {
    console.error('Error en el servicio de Gemini:', error)
    throw new Error('No se pudieron generar las recetas desde la IA.')
  }
}
