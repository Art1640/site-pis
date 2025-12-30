import React, { useState, useEffect } from 'react'

const PhotoGalleryPage: React.FC = () => {
  const [photos, setPhotos] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dynamically discover photos in the /photos folder
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
        console.log(`🌼 Photo base path: "${basePath}"`)

        // Fetch the list of photos from the manifest file
        try {
          console.log(`📸 Fetching photos from manifest...`)
          const manifestResponse = await fetch(`${basePath}/photos/photos.json`)

          if (manifestResponse.ok) {
            const photoFilenames = await manifestResponse.json()
            console.log('📸 Found photos in manifest:', photoFilenames)

            // Build photo URLs from the filenames
            const photoUrls = photoFilenames.map((filename: string) => `${basePath}/photos/${filename}`)
            console.log(`📸 Photo URLs:`, photoUrls)

            setPhotos(photoUrls)
          } else {
            console.error('❌ Failed to fetch photos manifest')
            setPhotos([])
          }
        } catch (error) {
          console.error('❌ Error loading photos:', error)
          setPhotos([])
        }
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

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucune photo trouvée</h2>
          <p className="text-gray-600 mb-4">Les photos seront bientôt disponibles!</p>
          <div className="text-sm text-gray-500">
            <p>Debug info (check console for details):</p>
            <p>Hostname: {window.location.hostname}</p>
            <p>Recherche automatique dans le dossier /photos/</p>
          </div>
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
                const target = e.target as HTMLImageElement
                console.error('❌ Failed to load image:', target.src)
                // Show a placeholder or error message
                target.style.display = 'none'
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement
                console.log('✅ Successfully loaded image:', target.src)
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
