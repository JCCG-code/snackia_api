// Packages
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';
// Local files
import * as prompts from '../../../prompts/index.js';

// Gen AI initialization
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

/**
 * Allows to create recipes from ingredients
 * @param {object} filters - filter to custom prompt
 * @returns Gemini AI response
 */
export const generateRecipesWithGemini = async (filters) => {
  // Get prompt
  const prompt = prompts.generateRecipePrompt(filters);

  try {
    const responseData = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generatedRecipes: {
              type: Type.ARRAY,
              description:
                'Una lista de 3 recetas generadas, ordenadas por relevancia.',
              items: {
                type: Type.OBJECT,
                properties: {
                  relevanceScore: {
                    type: Type.NUMBER,
                    description:
                      'Puntuación de 0 a 100 indicando la adecuación a los criterios del usuario.',
                  },
                  name: {
                    type: Type.STRING,
                    description: 'Nombre creativo y apetitoso de la receta.',
                  },
                  description: {
                    type: Type.STRING,
                    description:
                      'Una breve descripción que invite a cocinar la receta.',
                  },
                  ingredients: {
                    type: Type.OBJECT,
                    description: 'Listado de ingredientes necesarios.',
                    properties: {
                      provided: {
                        type: Type.ARRAY,
                        description: 'Ingredientes que el usuario ya tiene.',
                        items: { type: Type.STRING },
                      },
                      needed: {
                        type: Type.ARRAY,
                        description:
                          'Ingredientes comunes de despensa que el usuario podría necesitar.',
                        items: { type: Type.STRING },
                      },
                    },
                    propertyOrdering: ['provided', 'needed'],
                  },
                  instructions: {
                    type: Type.ARRAY,
                    description:
                      'Pasos claros y concisos para preparar la receta.',
                    items: { type: Type.STRING },
                  },
                  estimatedTime: {
                    type: Type.NUMBER,
                    description:
                      'Tiempo total estimado en minutos para completar la receta.',
                  },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Nivel de dificultad de la receta.',
                    enum: ['fácil', 'media', 'difícil'],
                  },
                },
                propertyOrdering: [
                  'relevanceScore',
                  'name',
                  'description',
                  'ingredients',
                  'instructions',
                  'estimatedTime',
                  'difficulty',
                ],
              },
            },
          },
          propertyOrdering: ['generatedRecipes'],
        },
      },
    });
    const output = JSON.parse(responseData.text);
    // Return statement
    return output;
  } catch (error) {
    console.error('Error en el servicio de Gemini:', error);
    throw new Error('No se pudieron generar las recetas desde la IA.');
  }
};
