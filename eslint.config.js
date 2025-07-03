import globals from 'globals'
import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },

  // 2. Reglas recomendadas de ESLint
  // Esto activa las reglas clave como:
  // - no-unused-vars: para variables declaradas pero no usadas
  // - no-undef: para variables usadas pero no declaradas
  // - no-redeclare: para variables declaradas múltiples veces
  js.configs.recommended,

  // 3. Configuración para desactivar reglas conflictivas con Prettier
  // ¡Debe ser la ÚLTIMA configuración en el array!
  prettierConfig
]
