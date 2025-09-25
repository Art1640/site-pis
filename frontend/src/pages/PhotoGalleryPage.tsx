import React, { useState, useEffect } from 'react'

const PhotoGalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-detect photos in the photos folder
    const loadPhotos = async () => {
      try {
        // Dynamic base path detection based on hosting environment
        const getBasePath = () => {
          // For development
          if (window.location.hostname === 'localhost') return ''

          // For GitHub Pages subdirectory
          if (window.location.hostname.includes('github.io')) return '/site-pis'

          // For custom domains (like moulah-pi.fr)
          return ''
        }

        const basePath = getBasePath()

        // Common image file names to try
        const commonPhotoNames = [
          'IMG_0044.jpg', 'IMG_0047.jpg', 'IMG_0059.JPG'
        ]

        const existingPhotos: string[] = []

        // Test each potential photo
        for (const photoName of commonPhotoNames) {
          try {
            const photoUrl = `${basePath}/photos/${photoName}`
            console.log(`Testing photo URL: ${photoUrl}`)
            const response = await fetch(photoUrl, { method: 'HEAD' })
            if (response.ok) {
              existingPhotos.push(photoUrl)
              console.log(`✅ Found photo: ${photoUrl}`)
            } else {
              console.log(`❌ Photo not found: ${photoUrl} (${response.status})`)
            }
          } catch (error) {
            console.log(`❌ Error testing photo ${photoName}:`, error)
          }
        }

        console.log(`Found ${existingPhotos.length} photos:`, existingPhotos)
        setPhotos(existingPhotos)
      } catch (error) {
        console.error('Error loading photos:', error)
        setPhotos([])
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Gallery */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Photo Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="relative">
            <img
              src={photos[currentIndex]}
              alt={`Photo ${currentIndex + 1}`}
              className="w-full h-96 md:h-[500px] object-cover"
              onError={(e) => {
                // If image fails to load, remove it from the list
                const target = e.target as HTMLImageElement
                console.error('Failed to load image:', target.src)
              }}
            />
            
            {/* Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  aria-label="Photo précédente"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                  aria-label="Photo suivante"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {photos.length > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Toutes les photos</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-scouts-blue ring-2 ring-scouts-blue ring-opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-scouts-blue bg-opacity-20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhotoGalleryPage
