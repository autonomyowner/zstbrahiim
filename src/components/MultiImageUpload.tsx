'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type MultiImageUploadProps = {
  onImagesUploaded: (urls: string[]) => void
  currentImages?: string[]
  label?: string
  maxImages?: number
  required?: boolean
}

export function MultiImageUpload({
  onImagesUploaded,
  currentImages = [],
  label = 'Images du produit',
  maxImages = 5,
  required = false,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      setError(`Vous pouvez télécharger au maximum ${maxImages} images`)
      return
    }

    setError(null)
    setIsUploading(true)

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setError(`${file.name}: Format non valide. Utilisez JPG, PNG, WebP ou GIF.`)
        continue
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError(`${file.name}: Trop volumineux. Taille maximale : 5MB.`)
        continue
      }

      try {
        const url = await uploadImage(file)
        if (url) {
          uploadedUrls.push(url)
        }
      } catch (err) {
        console.error('Error uploading image:', err)
      }
    }

    const newImages = [...images, ...uploadedUrls]
    setImages(newImages)
    onImagesUploaded(newImages)
    setIsUploading(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'b2b-offers')
      formData.append('entityId', 'images')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      return url
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Erreur lors du téléchargement de l\'image.')
      return null
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesUploaded(newImages)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="ml-2 text-xs text-gray-500">
          ({images.length}/{maxImages})
        </span>
      </label>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border-2 border-gray-300 bg-white overflow-hidden"
            >
              <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={isUploading}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onClick={handleButtonClick}
          className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary transition-colors"
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-1">Cliquez pour ajouter des images</p>
          <p className="text-xs text-gray-500">JPG, PNG, WebP ou GIF (max. 5MB chacune)</p>
          {isUploading && (
            <p className="mt-3 text-sm font-semibold text-brand-primary">Téléchargement...</p>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        multiple
        className="hidden"
        disabled={isUploading}
      />

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Upload Button */}
      {images.length < maxImages && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-brand-dark text-brand-primary rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Téléchargement...' : 'Ajouter des images'}
        </button>
      )}
    </div>
  )
}
