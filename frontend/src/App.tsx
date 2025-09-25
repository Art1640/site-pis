import { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import DataManager from './components/DataManager'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AllRecordsPage from './pages/AllRecordsPage'
import PhotoGalleryPage from './pages/PhotoGalleryPage'

function App() {
  const [dataVersion, setDataVersion] = useState(0)

  const handleDataChange = useCallback(() => {
    setDataVersion(prev => prev + 1)
  }, [])

  return (
    <Router basename={import.meta.env.PROD ? '/site-pis' : ''}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage key={dataVersion} />} />
            <Route path="/classement" element={<LeaderboardPage key={dataVersion} />} />
            <Route path="/activites" element={<ActivitiesPage key={dataVersion} />} />
            <Route path="/collectes" element={<AllRecordsPage key={dataVersion} />} />
            <Route path="/photos" element={<PhotoGalleryPage />} />
          </Routes>
        </main>
        <Footer />
        <DataManager onDataChange={handleDataChange} />
      </div>
    </Router>
  )
}

export default App
