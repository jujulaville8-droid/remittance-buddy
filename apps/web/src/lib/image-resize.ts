/**
 * Client-side image resize → JPEG data URL.
 *
 * We persist family-member photos in localStorage, so we need to keep each
 * image small (~15–25 KB at 200×200 quality 0.7). This helper downscales
 * with a canvas, center-crops to square, and returns a data URL the caller
 * can store directly on the recipient record.
 */

export interface ResizeOptions {
  readonly maxDim?: number // bounding box in px for the longest side (default 240)
  readonly quality?: number // JPEG quality 0–1 (default 0.75)
}

export async function resizeImageToDataUrl(
  file: File,
  { maxDim = 240, quality = 0.75 }: ResizeOptions = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please pick an image file.')
  }
  const bitmap = await createImageBitmap(file)
  const srcW = bitmap.width
  const srcH = bitmap.height
  const side = Math.min(srcW, srcH)
  // Center-crop to square
  const sx = Math.floor((srcW - side) / 2)
  const sy = Math.floor((srcH - side) / 2)

  // Downscale to maxDim if the square is larger
  const outDim = Math.min(side, maxDim)

  const canvas = document.createElement('canvas')
  canvas.width = outDim
  canvas.height = outDim
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser does not support canvas rendering.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, outDim, outDim)

  // Free the bitmap immediately — these can be large
  bitmap.close()

  return canvas.toDataURL('image/jpeg', quality)
}
