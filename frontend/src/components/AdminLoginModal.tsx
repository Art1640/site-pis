import React, { useState } from 'react'

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (password: string) => Promise<boolean>
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setIsSubmitting(true)

    const success = await onLogin(password)
    
    if (success) {
      setPassword('')
      onClose()
    } else {
      setError(true)
      setPassword('')
    }
    
    setIsSubmitting(false)
  }

  const handleClose = () => {
    setPassword('')
    setError(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue text-center`}
              placeholder="••••••"
              autoFocus
              disabled={isSubmitting}
            />
            
            {error && (
              <p className="text-red-500 text-sm text-center">Nope bitch</p>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-scouts-blue text-white rounded-md hover:bg-scouts-blue-dark transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '...' : 'OK'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginModal

