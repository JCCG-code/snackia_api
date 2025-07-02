// Packages
import express from 'express';
// Local files
import recipeRoutesV1 from './api/v1/routes/recipe.routes.js';

const app = express();

app.use(express.json());

app.use('/api/v1/recipes', recipeRoutesV1);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

export default app;
