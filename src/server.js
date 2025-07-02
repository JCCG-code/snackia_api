// Packages
import 'dotenv/config';
// Local files
import app from './app.js';
import connectDB from './config/db.js';

// Port initialization
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Starts API
app.listen(PORT, () => {
  console.log(`SnakIA API escuchando en el puerto ${PORT}`);
});
