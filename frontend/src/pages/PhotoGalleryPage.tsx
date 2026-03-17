import React, { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { backendApiService, PhotoRecord } from '../services/backendApi'

const PhotoGalleryPage: React.FC = () => {
  const { isAdmin } = useAdmin()
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadPhotos = async () => {
    try {
      const data = await backendApiService.getPhotos()
      setPhotos(data)
    } catch (error) {
      console.error('Error loading photos:', error)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPhotos() }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    try {
      await backendApiService.uploadPhoto(file, '')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadPhotos()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors du téléversement')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId: number) => {
    if (!confirm('Supprimer cette photo ?')) return
    try {
      await backendApiService.deletePhoto(photoId)
      setPhotos(prev => {
        const next = prev.filter(p => p.id !== photoId)
        setCurrentIndex(i => Math.min(i, Math.max(0, next.length - 1)))
        return next
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    }
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const goToPhoto = (index: number) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scouts-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des photos...</p>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Admin: hidden file input + floating + button */}
        {isAdmin && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Ajouter une photo"
              className="fixed top-20 right-6 z-40 w-12 h-12 rounded-full bg-scouts-blue text-white text-2xl shadow-lg hover:bg-scouts-blue-dark disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {uploading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : '+'}
            </button>
            {uploadError && (
              <div className="fixed top-36 right-6 z-40 bg-red-100 border border-red-300 text-red-700 text-xs px-3 py-2 rounded shadow max-w-xs">
                {uploadError}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {photos.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nada amigo</h2>
          </div>
        )}

        {/* Main Photo Display */}
        {photos.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              <div className="relative flex items-center justify-center bg-black min-h-48">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || `Photo ${currentIndex + 1}`}
                  className="max-h-[75vh] max-w-full w-auto object-contain"
                />

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all" aria-label="Photo précédente">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all" aria-label="Photo suivante">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}

                {/* Counter + admin delete */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {photos.length}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDelete(currentPhoto.id)} className="bg-red-600/80 hover:bg-red-700 text-white px-3 py-1 rounded-full text-sm" title="Supprimer">
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Caption */}
              {currentPhoto.caption && (
                <div className="px-4 py-2 text-sm text-gray-600 text-center">{currentPhoto.caption}</div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {photos.length > 1 && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => goToPhoto(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentIndex ? 'border-scouts-blue ring-2 ring-scouts-blue ring-opacity-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={photo.url} alt={photo.caption || `Miniature ${index + 1}`} className="w-full h-full object-cover" />
                      {index === currentIndex && <div className="absolute inset-0 bg-scouts-blue bg-opacity-20" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PhotoGalleryPage
