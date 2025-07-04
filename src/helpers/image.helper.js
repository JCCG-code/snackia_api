// Packages
import sharp from 'sharp'

/**
 *
 * @param {*} inputBuffer
 * @param {*} param1
 * @returns
 */
export const optimizeImageBuffer = async (
  inputBuffer,
  { width = 800, quality = 80 } = {}
) => {
  try {
    const optimizedBuffer = await sharp(inputBuffer)
      .resize({
        width: width,
        withoutEnlargement: true
      })
      .webp({
        quality: quality
      })
      .toBuffer()

    console.log(
      `Imagen optimizada. Tamaño original: ${inputBuffer.length / 1024} KB, Tamaño nuevo: ${optimizedBuffer.length / 1024} KB.`
    )

    return {
      buffer: optimizedBuffer,
      contentType: 'image/webp'
    }
  } catch (error) {
    console.error('Error optimizando la imagen con Sharp:', error)
    throw new Error('No se pudo procesar la imagen.')
  }
}
