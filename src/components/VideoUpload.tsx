'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

type VideoUploadProps = {
  onVideoUploaded: (url: string) => void
  currentVideoUrl?: string
  label?: string
  required?: boolean
  bucketPath?: string
}

export function VideoUpload({
  onVideoUploaded,
  currentVideoUrl,
  label = 'Vidéo du produit',
  required = false,
  bucketPath = 'b2b-videos',
}: VideoUploadProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      setError('Format vidéo non valide. Utilisez MP4, WebM, OGG ou MOV.')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      setError('La vidéo est trop volumineuse. Taille maximale : 50MB.')
      return
    }

    setError(null)

    // Upload to Supabase Storage
    await uploadVideo(file)
  }

  const uploadVideo = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${bucketPath}/${fileName}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(filePath)

      setVideoUrl(publicUrl)
      onVideoUploaded(publicUrl)
      setUploadProgress(100)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du téléchargement de la vidéo.'
      setError(errorMessage)
      setVideoUrl(currentVideoUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveVideo = () => {
    setVideoUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onVideoUploaded('')
    setUploadProgress(0)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Video Preview */}
      {videoUrl ? (
        <div className="relative w-full rounded-lg border-2 border-gray-300 bg-black overflow-hidden">
          <video src={videoUrl} controls className="w-full h-64 object-contain">
            Votre navigateur ne supporte pas la balise vidéo.
          </video>
          <button
            type="button"
            onClick={handleRemoveVideo}
            disabled={isUploading}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-sm">Téléchargement... {uploadProgress}%</div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="w-full h-64 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-1">Cliquez pour sélectionner une vidéo</p>
          <p className="text-xs text-gray-500">MP4, WebM, OGG ou MOV (max. 50MB)</p>
          {isUploading && (
            <div className="mt-4 w-48 bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Upload Button */}
      {!videoUrl && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-brand-dark text-brand-primary rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Téléchargement...' : 'Choisir une vidéo'}
        </button>
      )}
    </div>
  )
}
