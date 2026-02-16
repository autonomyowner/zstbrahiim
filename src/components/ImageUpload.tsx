'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type ImageUploadProps = {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  label?: string
  required?: boolean
  showPreview?: boolean
}

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
  label = 'Image du produit',
  required = false,
  showPreview = true,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Format d\'image non valide. Utilisez JPG, PNG, WebP ou GIF.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('L\'image est trop volumineuse. Taille maximale : 5MB.')
      return
    }

    setError(null)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to R2 Storage
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'products')
      formData.append('entityId', 'images')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      onImageUploaded(url)
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Erreur lors du téléchargement de l\'image.')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageUploaded('')
  }

  const shouldShowPreviewImage = showPreview && Boolean(previewUrl)

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-kitchen-lux-dark-green-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Preview Area */}
      {shouldShowPreviewImage ? (
        <div className="relative w-full h-64 rounded-lg border-2 border-kitchen-lux-dark-green-300 bg-white overflow-hidden">
          <Image
            src={previewUrl ?? '/perfums/placeholder.jpg'}
            alt="Preview"
            fill
            className="object-contain p-4"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
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
              <div className="text-white text-sm">Téléchargement...</div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="w-full h-64 rounded-lg border-2 border-dashed border-kitchen-lux-dark-green-300 bg-kitchen-lux-dark-green-50 flex flex-col items-center justify-center cursor-pointer hover:border-kitchen-lux-dark-green-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-kitchen-lux-dark-green-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-kitchen-lux-dark-green-600 mb-1">
            Cliquez pour sélectionner une image
          </p>
          <p className="text-xs text-kitchen-lux-dark-green-500">
            JPG, PNG, WebP ou GIF (max. 5MB)
          </p>
          {!showPreview && previewUrl && (
            <p className="mt-3 text-xs font-semibold text-kitchen-lux-dark-green-600">
              Image sélectionnée – cliquez pour changer
            </p>
          )}
        </div>
      )}

      {!showPreview && previewUrl && (
        <div className="flex items-center justify-between rounded-lg border border-kitchen-lux-dark-green-200 bg-white px-4 py-2 text-xs text-kitchen-lux-dark-green-600">
          <span>Image prête à être utilisée</span>
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Supprimer
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* Upload Button (Alternative) */}
      {(!previewUrl || !showPreview) && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-kitchen-lux-dark-green-600 text-white rounded-lg hover:bg-kitchen-lux-dark-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Téléchargement...' : 'Choisir une image'}
        </button>
      )}
    </div>
  )
}

