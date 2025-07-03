import mongoose from 'mongoose'

const RecipeCacheSchema = new mongoose.Schema(
  {
    requestHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    response: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const RecipeCache = mongoose.model('RecipeCache', RecipeCacheSchema)

export default RecipeCache
