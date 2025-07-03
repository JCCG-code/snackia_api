// Packages
import express from 'express'
import cors from 'cors'
// Local files
import recipeRoutesV1 from './api/v1/routes/recipe.routes.js'

// Initializacions
const app = express()
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/api/v1/recipes', recipeRoutesV1)

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app
