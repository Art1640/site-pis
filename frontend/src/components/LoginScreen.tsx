import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const success = login(password)
    if (!success) {
      setError('Code incorrect')
      setPassword('')
      setIsShaking(true)
      
      // Remove shake animation after it completes
      setTimeout(() => setIsShaking(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <div className="text-6xl mb-8">🌼</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Pissenlits 2025-2026
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Code d'accès"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg focus:ring-2 focus:ring-scouts-blue focus:border-transparent outline-none transition-all ${
                isShaking ? 'animate-pulse border-red-500' : ''
              }`}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-scouts-blue hover:bg-scouts-blue-dark text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-scouts-blue focus:ring-offset-2 outline-none"
          >
            Entrer
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen
