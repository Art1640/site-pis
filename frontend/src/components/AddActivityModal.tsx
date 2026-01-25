import React, { useState, useEffect } from 'react'
import { FundraisingRecord } from '../types'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: Omit<FundraisingRecord, 'id'>) => Promise<void>
  existingRecords: FundraisingRecord[]
  editRecord?: FundraisingRecord | null
}

const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onSubmit, existingRecords, editRecord }) => {
  const today = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD

  const [formData, setFormData] = useState({
    Date: today,
    Qui: '',
    Type: '',
    Activité: '',
    Détails: '',
    Montant: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (editRecord) {
      // Convert Montant to string format
      const montantStr = Array.isArray(editRecord.Montant)
        ? editRecord.Montant.join(', ')
        : editRecord.Montant.toString()

      setFormData({
        Date: editRecord.Date,
        Qui: editRecord.Qui,
        Type: editRecord.Type,
        Activité: editRecord.Activité,
        Détails: editRecord.Détails || '',
        Montant: montantStr
      })
    } else {
      // Reset form for new record
      setFormData({
        Date: today,
        Qui: '',
        Type: '',
        Activité: '',
        Détails: '',
        Montant: ''
      })
    }
    setError(null)
  }, [editRecord, isOpen, today])

  // Get unique values from existing records for dropdowns
  const uniqueQui = Array.from(new Set(
    existingRecords.flatMap(r => r.Qui.split(',').map(name => name.trim()))
  )).sort()
  
  const uniqueTypes = Array.from(new Set(existingRecords.map(r => r.Type))).sort()
  const uniqueActivites = Array.from(new Set(existingRecords.map(r => r.Activité))).sort()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.Date || !formData.Qui || !formData.Type || !formData.Activité || !formData.Montant) {
      setError('Tous les champs sont obligatoires (sauf Détails)')
      return
    }

    // Parse Montant
    let montant: number | number[]
    const montantStr = formData.Montant.trim()
    
    if (montantStr.includes(',')) {
      // Multiple amounts: "33, 21, 60, 48, 111" -> [33, 21, 60, 48, 111]
      montant = montantStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
      if (montant.length === 0) {
        setError('Format de montant invalide')
        return
      }
    } else {
      // Single amount: "161.5" -> 161.5
      montant = parseFloat(montantStr)
      if (isNaN(montant)) {
        setError('Format de montant invalide')
        return
      }
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        Date: formData.Date,
        Qui: formData.Qui,
        Type: formData.Type,
        Activité: formData.Activité,
        Détails: formData.Détails,
        Montant: montant
      })

      // Reset form and close modal
      setFormData({
        Date: today,
        Qui: '',
        Type: '',
        Activité: '',
        Détails: '',
        Montant: ''
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-scouts-blue mb-6">
              {editRecord ? 'Modifier l\'activité' : 'Ajouter une activité'}
            </h2>
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.Date}
                onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                required
              />
            </div>

            {/* Qui */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qui <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="qui-list"
                value={formData.Qui}
                onChange={(e) => setFormData({ ...formData, Qui: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                placeholder=""
                required
              />
              <datalist id="qui-list">
                {uniqueQui.map(qui => (
                  <option key={qui} value={qui} />
                ))}
              </datalist>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="type-list"
                value={formData.Type}
                onChange={(e) => setFormData({ ...formData, Type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                placeholder=""
                required
              />
              <datalist id="type-list">
                {uniqueTypes.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            {/* Activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activité <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="activite-list"
                value={formData.Activité}
                onChange={(e) => setFormData({ ...formData, Activité: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                placeholder=""
                required
              />
              <datalist id="activite-list">
                {uniqueActivites.map(activite => (
                  <option key={activite} value={activite} />
                ))}
              </datalist>
            </div>

            {/* Détails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Détails
              </label>
              <textarea
                value={formData.Détails}
                onChange={(e) => setFormData({ ...formData, Détails: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                placeholder=""
                rows={3}
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.Montant}
                onChange={(e) => setFormData({ ...formData, Montant: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue"
                placeholder=""
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-scouts-blue text-white rounded-md hover:bg-scouts-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (editRecord ? 'Modification...' : 'Ajout...')
                  : (editRecord ? 'Modifier' : 'Ajouter')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddActivityModal

