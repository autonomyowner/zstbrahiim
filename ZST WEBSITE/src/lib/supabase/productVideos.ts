import { PRODUCT_THUMBNAIL_BUCKET, PRODUCT_VIDEO_BUCKET, MAX_PRODUCT_VIDEO_SIZE_BYTES } from '@/constants/media'
import { supabase } from './client'
import type { ProductVideo } from './types'

export type ProductVideoUploadPayload = {
  productId: string
  file: File
  durationSeconds: number
  thumbnailBlob: Blob
}

const buildStoragePath = (productId: string, prefix: string, extension: string): string => {
  const safeExtension = extension.replace('.', '')
  return `${productId}/${prefix}-${Date.now()}.${safeExtension}`
}

const getExtensionFromMime = (mimeType: string): string => {
  const parts = mimeType.split('/')
  return parts.length === 2 ? parts[1] : 'mp4'
}

export async function upsertProductVideo({
  productId,
  file,
  durationSeconds,
  thumbnailBlob,
}: ProductVideoUploadPayload): Promise<ProductVideo | null> {
  if (file.size > MAX_PRODUCT_VIDEO_SIZE_BYTES) {
    throw new Error('La vidéo dépasse la taille maximale autorisée (10 MB).')
  }

  // Fetch existing video to clean up assets if needed
  const { data: existingVideo } = await supabase
    .from('product_videos')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle()

  const videoExtension = getExtensionFromMime(file.type || 'video/mp4')
  const videoPath = buildStoragePath(productId, 'video', videoExtension)

  const { error: videoUploadError } = await supabase.storage
    .from(PRODUCT_VIDEO_BUCKET)
    .upload(videoPath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'video/mp4',
    })

  if (videoUploadError) {
    console.error('Error uploading product video:', videoUploadError.message)
    throw new Error('Impossible de téléverser la vidéo. Veuillez réessayer.')
  }

  const thumbnailPath = buildStoragePath(productId, 'thumb', 'jpg')

  const { error: thumbnailUploadError } = await supabase.storage
    .from(PRODUCT_THUMBNAIL_BUCKET)
    .upload(thumbnailPath, thumbnailBlob, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/jpeg',
    })

  if (thumbnailUploadError) {
    console.error('Error uploading product thumbnail:', thumbnailUploadError.message)
    // Cleanup uploaded video
    await supabase.storage.from(PRODUCT_VIDEO_BUCKET).remove([videoPath])
    throw new Error('Impossible de générer la miniature de la vidéo.')
  }

  const {
    data: { publicUrl: videoUrl },
  } = supabase.storage.from(PRODUCT_VIDEO_BUCKET).getPublicUrl(videoPath)

  const {
    data: { publicUrl: thumbnailUrl },
  } = supabase.storage.from(PRODUCT_THUMBNAIL_BUCKET).getPublicUrl(thumbnailPath)

  const { data, error } = await supabase
    .from('product_videos')
    .upsert(
      [
        {
          product_id: productId,
          video_url: videoUrl,
          video_storage_path: videoPath,
          thumbnail_url: thumbnailUrl,
          thumbnail_storage_path: thumbnailPath,
          duration_seconds: durationSeconds,
          file_size_bytes: file.size,
        },
      ],
      { onConflict: 'product_id' }
    )
    .select()
    .maybeSingle()

  if (error) {
    console.error('Error saving product video metadata:', error.message)
    await supabase.storage.from(PRODUCT_VIDEO_BUCKET).remove([videoPath])
    await supabase.storage.from(PRODUCT_THUMBNAIL_BUCKET).remove([thumbnailPath])
    throw new Error('Impossible d’enregistrer la vidéo du produit.')
  }

  if (existingVideo) {
    await deleteProductVideoAssets(existingVideo)
  }

  return data ?? null
}

export async function deleteProductVideo(productId: string): Promise<void> {
  const { data, error } = await supabase
    .from('product_videos')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching product video for deletion:', error.message)
    throw new Error("Impossible de récupérer la vidéo à supprimer.")
  }

  if (!data) return

  await deleteProductVideoAssets(data)

  const { error: deleteError } = await supabase
    .from('product_videos')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    console.error('Error deleting product video entry:', deleteError.message)
    throw new Error("Impossible de supprimer l'entrée vidéo.")
  }
}

const deleteProductVideoAssets = async (video: ProductVideo): Promise<void> => {
  await supabase.storage.from(PRODUCT_VIDEO_BUCKET).remove([video.video_storage_path])
  await supabase.storage.from(PRODUCT_THUMBNAIL_BUCKET).remove([video.thumbnail_storage_path])
}

