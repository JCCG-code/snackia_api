/**
 * Genera el prompt para crear un plan de comidas que incluye una "Receta Estrella" y alternativas.
 * @param {object} filters - Los filtros del usuario.
 * @returns {string} El prompt para la primera llamada a Gemini.
 */
export const createMealPlanPrompt = (filters) => {
  const { ingredients, mealType, persons, diet } = filters

  const dietRule =
    diet && diet !== 'ninguna'
      ? `- **Dieta Estricta:** Todos los platos propuestos deben ser 100% compatibles con una dieta **${diet}**.`
      : ''

  return `
    [CONTEXTO]
    Actúas como un Chef experto, pragmático y creativo. Tu misión es diseñar un menú de platos principales a partir de una lista de ingredientes. Te centras en combinaciones de sabores que sean deliciosas y reconocibles.

    [TAREA]
    Diseña un plan de comidas para un/una "${mealType}" para ${persons} persona(s). Sigue esta jerarquía:
    1.  **"Receta Estrella":** Identifica la receta más completa y sofisticada posible que use la mayor cantidad de ingredientes disponibles de forma coherente.
    2.  **"Alternativas Completas":** Identifica TODAS las demás combinaciones que también formen platos principales completos.

    [REGLAS FUNDAMENTALES]
    - **Definición de Plato Completo:** Un plato es completo si tiene una base de proteína (carne, pescado, legumbres) o carbohidrato (arroz, patatas). No generes conceptos para guarniciones o entrantes ligeros como un plato principal.
    - **Manejo de Ingredientes Insuficientes:** Si es imposible crear un plato principal completo, genera conceptos para platos más ligeros (cremas, revueltos) pero indícalo en su descripción.
    - **Variedad y Coherencia:** Propón variedad en las técnicas de cocina (asado, estofado, salteado) si es posible. Evita combinaciones de sabores extrañas o experimentales.
    - **Contexto de Comida:** Asegúrate de que las descripciones de los platos mencionen que son ideales para un/una "${mealType}".
    ${dietRule}
    - **Cantidades:** Sugiere una cantidad aproximada por persona para cada ingrediente de un plato.
    - **Formato:** Tu única salida debe ser el objeto JSON.

    [INGREDIENTES DISPONIBLES]
    - ${ingredients.join('\n- ')}
      `.trim()
}

/**
 *
 * @param {*} mealConcept
 * @param {*} persons
 * @returns
 */
export const createRecipeDevelopmentPrompt = (
  mealConcept,
  persons,
  generalFilters
) => {
  const { diet } = generalFilters
  const baseIngredientNames = mealConcept.mainIngredients
    .map((ing) => ing.name)
    .join(', ')
  const ingredientsList = mealConcept.mainIngredients
    .map(
      (ing) => `- ${ing.name} (cantidad sugerida por persona: ${ing.quantity})`
    )
    .join('\n')

  const dietRule =
    diet && diet !== 'ninguna'
      ? `5.  **CUMPLIMIENTO ESTRICTO DE DIETA (${diet}):** La receta final, incluyendo los ingredientes en "needed" y cualquier sugerencia en las instrucciones (ej. acompañamientos), DEBE ser estrictamente compatible con la dieta **${diet}**. NO sugieras acompañamientos que contengan gluten si la dieta es "sin gluten".`
      : ''

  return `
    [CONTEXTO]
    Actúas como un "Chef Ejecutivo" que debe ejecutar una receta siguiendo órdenes precisas. Tu creatividad está limitada a la técnica y presentación, no a los ingredientes.

    [TAREA: DESARROLLO DE RECETA BAJO REGLAS ESTRICTAS]
    Desarrolla UNA ÚNICA receta completa basada en el siguiente concepto y, sobre todo, en la lista cerrada de ingredientes.

    [LISTA CERRADA DE INGREDIENTES PERMITIDOS]
    Solo puedes usar los siguientes ingredientes principales para construir la receta: **${baseIngredientNames}**.

    [CONCEPTO GUÍA]
    - Título: ${mealConcept.mealTitle}
    - Ingredientes Base con Cantidades Sugeridas:
    ${ingredientsList}

    [REGLAS INQUEBRANTABLES]
    1.  **PROHIBICIÓN DE ALUCINACIÓN:** Está terminantemente prohibido usar, mencionar o asumir cualquier ingrediente principal que no esté en la [LISTA CERRADA DE INGREDIENTES PERMITIDOS]. Si un plato clásico necesita un ingrediente que no está en la lista (ej: huevos para un revuelto, pan para una tostada), DEBES ABANDONAR LA IDEA Y PENSAR EN OTRA RECETA que sí se pueda hacer con la lista cerrada. No puedes añadirlo a "needed".
    2.  **SECCIÓN "needed":** La sección "needed" es EXCLUSIVAMENTE para condimentos básicos (aceite, sal, pimienta, vinagre) o especias comunes. Nunca para ingredientes estructurales (harina, huevos, pan, pasta, etc.).
    3.  **CANTIDADES TOTALES:** Calcula las cantidades totales para ${persons} personas basándote en las sugerencias.
    4.  **INSTRUCCIONES PROFESIONALES:** Escribe instrucciones claras y detalladas.
    ${dietRule}
    -   **Formato:** Tu única salida debe ser el objeto JSON.
      `.trim()
}
