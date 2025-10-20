import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import ObjectifsMensuelsPage from './pages/ObjectifsMensuelsPage'
import AllRecordsPage from './pages/AllRecordsPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { RefreshProvider } from './contexts/RefreshContext'
import LoginScreen from './components/LoginScreen'

// Protected App Component
const ProtectedApp: React.FC = () => {
  const { isAuthenticated } = useAuth()

  // Dynamic basename detection based on hosting environment
  const getBasename = () => {
    // For development, no basename needed
    if (import.meta.env.DEV) return ''

    // Check if we're on GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      return '/site-pis'
    }

    // For custom domains (like moulah-pi.fr), use root
    return ''
  }

  const basename = getBasename()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <RefreshProvider>
      <Router basename={basename}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/classement" element={<LeaderboardPage />} />
              <Route path="/objectifs-mensuels" element={<ObjectifsMensuelsPage />} />
              <Route path="/activites" element={<ActivitiesPage />} />
              <Route path="/details" element={<AllRecordsPage />} />
              <Route path="/photos" element={<PhotoGalleryPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </RefreshProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  )
}

export default App
