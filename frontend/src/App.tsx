import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import AllRecordsPage from './pages/AllRecordsPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/classement" element={<LeaderboardPage />} />
            <Route path="/activites" element={<ActivitiesPage />} />
            <Route path="/collectes" element={<AllRecordsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
