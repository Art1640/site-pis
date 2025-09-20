import React from 'react'

interface LoadingSpinnerProps {
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Chargement...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scouts-green"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}

export default LoadingSpinner
