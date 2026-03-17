import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSounds } from '../utils/soundUtils'
import { useAdmin } from '../contexts/AdminContext'
import AdminLoginModal from './AdminLoginModal'

const Navbar: React.FC = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const { playNavigation } = useSounds()
  const { isAdmin, login, logout } = useAdmin()

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

            {/* Admin Button */}
            {isAdmin ? (
              <button
                onClick={logout}
                className="p-2 rounded-md text-white hover:bg-red-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="p-2 rounded-md text-white hover:bg-scouts-blue-dark transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
            )}
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

            {/* Mobile Admin Button */}
            {isAdmin ? (
              <button
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-red-600 transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminModal(true)}
                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-scouts-blue-dark transition-colors text-left"
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLogin={login}
      />
    </nav>
  )
}

export default Navbar
