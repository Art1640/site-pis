import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSounds } from '../utils/soundUtils'
import { useRefresh } from '../contexts/RefreshContext'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { playNavigation } = useSounds()
  const { refreshData, isRefreshing } = useRefresh()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/classement', label: 'Classement' },
    { path: '/objectifs-mensuels', label: 'Objectifs Mensuels' },
    { path: '/activites', label: 'Activités' },
    { path: '/details', label: 'Détails' },
    { path: '/photos', label: 'Ne pas clicker' }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = () => {
    playNavigation()
    closeMobileMenu()
  }

  const handleLogoClick = () => {
    playNavigation()
    closeMobileMenu()
  }

  const handleRefresh = async () => {
    playNavigation()
    await refreshData()
  }

  return (
    <nav className="bg-scouts-blue shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2" onClick={handleLogoClick}>
            <div className="text-white text-xl font-bold">
              🌼 Pissenlits 2025-2026 🌼
            </div>
          </Link>

          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-scouts-blue-dark text-white'
                    : 'text-white hover:bg-scouts-blue-dark hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isRefreshing
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'text-white hover:bg-scouts-blue-dark hover:text-white'
              }`}
              title="Actualiser les données"
            >
              {isRefreshing ? (
                <div className="flex items-center space-x-1">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Actualisation...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualiser</span>
                </div>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-scouts-blue-light transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-80 opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-scouts-blue-dark text-white'
                    : 'text-white hover:bg-scouts-blue-dark hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                isRefreshing
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'text-white hover:bg-scouts-blue-dark hover:text-white'
              }`}
            >
              {isRefreshing ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Actualisation...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualiser</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
