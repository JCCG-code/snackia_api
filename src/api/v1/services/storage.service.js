import { Storage } from '@google-cloud/storage'
import { v4 as uuidv4 } from 'uuid'

// Initializations
const storage = new Storage()
const bucketName = process.env.GCS_BUCKET_NAME
if (!bucketName) {
  throw new Error('La variable de entorno GCS_BUCKET_NAME no está definida.')
}
const bucket = storage.bucket(bucketName)

/**
 *
 * @param {*} buffer
 * @param {*} param1
 * @returns
 */
export const uploadBufferToGCS = async (buffer, { path, contentType }) => {
  const fileName = `${uuidv4()}`
  const destinationPath = `${path}/${fileName}`

  const file = bucket.file(destinationPath)

  try {
    await file.save(buffer, {
      metadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=31536000'
      }
    })
    const publicUrl = file.publicUrl()
    // Return statemet
    console.log(`Archivo subido con éxito. URL pública: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error(`Error al subir el archivo a GCS: ${error.message}`, error)
    throw new Error('No se pudo subir el archivo al almacenamiento en la nube.')
  }
}
