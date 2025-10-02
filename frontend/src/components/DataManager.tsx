import React, { useState } from 'react'
import { apiService } from '../services/api'

interface DataManagerProps {
  onDataChange: () => void
}

const DataManager: React.FC<DataManagerProps> = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    Date: new Date().toISOString().split('T')[0],
    Qui: '',
    Type: '',
    Activité: '',
    Détails: '',
    Montant: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Parse Montant - handle both single number and array formats
      let parsedMontant: number | number[]
      const montantStr = formData.Montant.trim()

      if (montantStr.startsWith('[') && montantStr.endsWith(']')) {
        // Array format: [100, 100, 75, 25]
        try {
          parsedMontant = JSON.parse(montantStr)
          if (!Array.isArray(parsedMontant) || !parsedMontant.every(n => typeof n === 'number')) {
            throw new Error('Invalid array format')
          }
        } catch {
          alert('Format de tableau invalide. Utilisez [100, 100, 75, 25]')
          return
        }
      } else {
        // Single number format
        parsedMontant = parseFloat(montantStr)
        if (isNaN(parsedMontant)) {
          alert('Montant invalide. Utilisez un nombre ou [100, 100, 75, 25]')
          return
        }
      }

      await apiService.addRecord({
        ...formData,
        Montant: parsedMontant
      })
      
      // Reset form
      setFormData({
        Date: new Date().toISOString().split('T')[0],
        Qui: '',
        Type: '',
        Activité: '',
        Détails: '',
        Montant: ''
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



  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-scouts-blue text-white p-4 rounded-full shadow-lg hover:bg-scouts-blue-dark transition-colors"
          title="Ajouter une collecte"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Qui (personne/groupe)</label>
              <input
                type="text"
                value={formData.Qui}
                onChange={(e) => setFormData({ ...formData, Qui: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                placeholder="Ex: Dorcopsis ou Dorcopsis, Sika, Merionne pour plusieurs personnes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                type="text"
                value={formData.Type}
                onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                placeholder="Ex: Bar Pi, Début d'année, etc."
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
                <option value="Début d'année">Début d'année</option>
                <option value="Bar Pi #1">Bar Pi #1</option>
                <option value="Bar Pi #2">Bar Pi #2</option>
                <option value="Bar Pi #3">Bar Pi #3</option>
                <option value="Vente de gâteaux">Vente de gâteaux</option>
                <option value="Tombola">Tombola</option>
                <option value="Collecte de dons">Collecte de dons</option>
                <option value="Brocante">Brocante</option>
                <option value="Autre">Autre</option>
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
                type="text"
                value={formData.Montant}
                onChange={(e) => setFormData({ ...formData, Montant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
                placeholder="Ex: 300 (partage égal) ou [100, 100, 75, 25] (montants individuels)"
                title="Entrez un montant unique pour partage égal ou [montant1, montant2, ...] pour montants individuels"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Pour plusieurs personnes: montant unique (partage égal) ou [100, 100, 75, 25] (montants individuels)
              </p>
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
