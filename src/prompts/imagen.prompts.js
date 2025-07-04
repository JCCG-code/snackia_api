export const createTranslationPrompt = (recipeName, recipeDescription) => {
  return `
    Translate the following recipe name and description to English.
    Your response MUST be ONLY a valid JSON object with a "name" key and a "description" key.
    Do not include any introductory text or markdown formatting like \`\`\`json.

    Input:
    {
      "name": "${recipeName}",
      "description": "${recipeDescription}"
    }

    JSON Output:
      `.trim()
}

/**
 * Allows to build a prompt fo imagen 3
 * @param {object} translatedRecipe recipe translated
 * @returns A prompt to imagen-3
 */
export const createImagePromptForRecipe = (translatedRecipe) => {
  const mainSubject = translatedRecipe.name

  const styles = [
    'professional food photography',
    'gastronomic magazine style',
    'culinary product shot',
    'modern food still life'
  ]
  const angles = [
    'top-down view',
    '45-degree angle shot',
    'detailed macro shot',
    'low angle shot'
  ]
  const lightings = [
    'soft and diffuse studio lighting',
    'bright natural light from a window',
    'warm and cozy lighting',
    'dramatic lighting with soft shadows'
  ]
  const backgrounds = [
    'on a rustic wooden table',
    'on a white ceramic plate with a minimalist background',
    'with a blurred kitchen background',
    'on a dark marble cutting board'
  ]
  const qualityModifiers =
    'photorealistic, 4K, HDR, high quality, delicious, appetizing, sharp focus'

  const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const prompt = `
    ${getRandomElement(styles)}, 
    ${qualityModifiers}. 
    Main subject: "${mainSubject}". 
    Composition: ${getRandomElement(angles)}. 
    Lighting: ${getRandomElement(lightings)}. 
    Context: ${getRandomElement(backgrounds)}. 
    Key details from the recipe to show: ${translatedRecipe.description}
  `
    .replace(/\s+/g, ' ')
    .trim()

  return prompt
}
