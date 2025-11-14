import { MAX_PRODUCT_VIDEO_DURATION_SECONDS } from '@/constants/media'

export type VideoMetadata = {
  durationSeconds: number
  thumbnailBlob: Blob
  thumbnailDataUrl: string
}

export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    const cleanup = (): void => {
      URL.revokeObjectURL(objectUrl)
    }

    video.preload = 'metadata'
    video.src = objectUrl
    video.muted = true

    video.onloadedmetadata = () => {
      if (!video.duration || video.duration === Infinity) {
        video.currentTime = 1
        return
      }

      if (video.duration > MAX_PRODUCT_VIDEO_DURATION_SECONDS) {
        cleanup()
        reject(
          new Error(
            `La vidéo dépasse la durée maximale autorisée (${MAX_PRODUCT_VIDEO_DURATION_SECONDS}s).`
          )
        )
        return
      }

      captureThumbnail()
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Impossible de lire cette vidéo. Veuillez choisir un autre fichier.'))
    }

    const captureThumbnail = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 720
      canvas.height = video.videoHeight || 1280
      const context = canvas.getContext('2d')

      if (!context) {
        cleanup()
        reject(new Error('Impossible de générer la miniature de la vidéo.'))
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          cleanup()
          if (!blob) {
            reject(new Error('Impossible de créer la miniature (thumbnail).'))
            return
          }
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({
              durationSeconds: Math.ceil(video.duration),
              thumbnailBlob: blob,
              thumbnailDataUrl: String(reader.result),
            })
          }
          reader.onerror = () => reject(new Error('Erreur lors de la lecture de la miniature.'))
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.8
      )
    }
  })
}

