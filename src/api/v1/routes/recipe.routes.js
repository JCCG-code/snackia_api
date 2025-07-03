import express from 'express'
import { generateRecipes } from '../controllers/recipe.controller.js'

const router = express.Router()

// Definimos la ruta POST
router.post('/generate', generateRecipes)

export default router
