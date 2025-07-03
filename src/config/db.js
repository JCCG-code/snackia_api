import 'dotenv/config'
import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB conectado con exito')
  } catch (err) {
    console.error('Error de conexión a MongoDB:', err.message)
    process.exit(1)
  }
}

export default connectDB
