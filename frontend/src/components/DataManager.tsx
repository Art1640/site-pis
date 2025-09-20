import React, { useState } from 'react'
import { apiService } from '../services/api'

interface DataManagerProps {
  onDataChange: () => void
}

const DataManager: React.FC<DataManagerProps> = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    Date: new Date().toISOString().split('T')[0],
    Nom: '',
    Activité: '',
    Détails: '',
    Montant: '',
    Qui: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await apiService.addRecord({
        ...formData,
        Montant: parseFloat(formData.Montant)
      })
      
      // Reset form
      setFormData({
        Date: new Date().toISOString().split('T')[0],
        Nom: '',
        Activité: '',
        Détails: '',
        Montant: '',
        Qui: ''
      })
      
      setIsOpen(false)
      onDataChange() // Refresh the data
    } catch (error) {
      console.error('Error adding record:', error)
      alert('Erreur lors de l\'ajout de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => {
    const data = apiService.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pissenlits-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string
        await apiService.importData(jsonData)
        onDataChange() // Refresh the data
        alert('Données importées avec succès!')
      } catch (error) {
        console.error('Error importing data:', error)
        alert('Erreur lors de l\'importation des données')
      }
    }
    reader.readAsText(file)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-scouts-blue text-white p-4 rounded-full shadow-lg hover:bg-scouts-blue-dark transition-colors"
          title="Ajouter une collecte"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleExport}
            className="bg-scouts-blue-light text-white p-3 rounded-full shadow-lg hover:bg-scouts-blue transition-colors"
            title="Exporter les données"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <label className="bg-scouts-blue-light text-white p-3 rounded-full shadow-lg hover:bg-scouts-blue transition-colors cursor-pointer" title="Importer les données">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-scouts-blue">Ajouter une collecte</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.Date}
                onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contributeur</label>
              <input
                type="text"
                value={formData.Nom}
                onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activité</label>
              <select
                value={formData.Activité}
                onChange={(e) => setFormData({ ...formData, Activité: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                required
              >
                <option value="">Sélectionner une activité</option>
                <option value="Vente de gâteaux">Vente de gâteaux</option>
                <option value="Lavage de voitures">Lavage de voitures</option>
                <option value="Vente de calendriers">Vente de calendriers</option>
                <option value="Tombola">Tombola</option>
                <option value="Collecte de dons">Collecte de dons</option>
                <option value="Brocante">Brocante</option>
                <option value="Vente de chocolats">Vente de chocolats</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Détails</label>
              <textarea
                value={formData.Détails}
                onChange={(e) => setFormData({ ...formData, Détails: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.Montant}
                onChange={(e) => setFormData({ ...formData, Montant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable de l'enregistrement</label>
              <input
                type="text"
                value={formData.Qui}
                onChange={(e) => setFormData({ ...formData, Qui: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-scouts-blue text-white rounded-md hover:bg-scouts-blue-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DataManager
