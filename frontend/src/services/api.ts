import { FundraisingRecord, SummaryData } from '../types'

const STORAGE_KEY = 'pissenlits-fundraising-data'

// Sample data for initial setup
const INITIAL_DATA: FundraisingRecord[] = [
  {
    "Date": "2025-09-01",
    "Nom": "Jean Dupont",
    "Activité": "Vente de gâteaux",
    "Détails": "Vente lors du marché local",
    "Montant": 85.50,
    "Qui": "Marie Martin"
  },
  {
    "Date": "2025-09-03",
    "Nom": "Sophie Moreau",
    "Activité": "Lavage de voitures",
    "Détails": "Lavage dans le parking du supermarché",
    "Montant": 120.00,
    "Qui": "Pierre Dubois"
  },
  {
    "Date": "2025-09-05",
    "Nom": "Lucas Bernard",
    "Activité": "Vente de calendriers",
    "Détails": "Vente porte-à-porte dans le quartier",
    "Montant": 45.75,
    "Qui": "Anne Leroy"
  }
]

// Helper functions for localStorage
const loadFromStorage = (): FundraisingRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      // First time - initialize with sample data
      saveToStorage(INITIAL_DATA)
      return INITIAL_DATA
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return INITIAL_DATA
  }
}

const saveToStorage = (data: FundraisingRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    throw new Error('Erreur lors de la sauvegarde des données')
  }
}

// Calculate summary data from records
const calculateSummary = (records: FundraisingRecord[]): SummaryData => {
  // Calculate total funds
  const total_funds = records.reduce((sum, record) => sum + record.Montant, 0)

  // Group by person for leaderboard
  const person_totals: { [key: string]: number } = {}
  records.forEach(record => {
    person_totals[record.Nom] = (person_totals[record.Nom] || 0) + record.Montant
  })

  // Group by activity
  const activity_totals: { [key: string]: number } = {}
  const activity_counts: { [key: string]: number } = {}
  records.forEach(record => {
    activity_totals[record.Activité] = (activity_totals[record.Activité] || 0) + record.Montant
    activity_counts[record.Activité] = (activity_counts[record.Activité] || 0) + 1
  })

  // Create cumulative data
  const sortedRecords = [...records].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
  const cumulative_data: { date: string; total: number }[] = []
  let runningTotal = 0

  sortedRecords.forEach(record => {
    runningTotal += record.Montant
    cumulative_data.push({
      date: record.Date,
      total: runningTotal
    })
  })

  return {
    total_funds,
    person_totals,
    activity_totals,
    activity_counts,
    cumulative_data
  }
}

export const apiService = {
  async getRecords(): Promise<FundraisingRecord[]> {
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      return loadFromStorage()
    } catch (error) {
      console.error('Error fetching records:', error)
      throw new Error('Impossible de charger les données, veuillez réessayer')
    }
  },

  async getSummary(): Promise<SummaryData> {
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      const records = loadFromStorage()
      return calculateSummary(records)
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw new Error('Impossible de charger les données, veuillez réessayer')
    }
  },

  async addRecord(record: Omit<FundraisingRecord, 'id'>): Promise<FundraisingRecord> {
    try {
      const records = loadFromStorage()
      const newRecord = { ...record }
      records.push(newRecord)
      saveToStorage(records)
      return newRecord
    } catch (error) {
      console.error('Error adding record:', error)
      throw new Error('Erreur lors de l\'ajout de l\'enregistrement')
    }
  },

  async updateRecord(updatedRecord: FundraisingRecord): Promise<FundraisingRecord> {
    try {
      const records = loadFromStorage()
      const index = records.findIndex(r =>
        r.Date === updatedRecord.Date &&
        r.Nom === updatedRecord.Nom &&
        r.Activité === updatedRecord.Activité
      )
      if (index !== -1) {
        records[index] = updatedRecord
        saveToStorage(records)
      }
      return updatedRecord
    } catch (error) {
      console.error('Error updating record:', error)
      throw new Error('Erreur lors de la mise à jour de l\'enregistrement')
    }
  },

  async deleteRecord(record: FundraisingRecord): Promise<void> {
    try {
      const records = loadFromStorage()
      const filteredRecords = records.filter(r =>
        !(r.Date === record.Date &&
          r.Nom === record.Nom &&
          r.Activité === record.Activité)
      )
      saveToStorage(filteredRecords)
    } catch (error) {
      console.error('Error deleting record:', error)
      throw new Error('Erreur lors de la suppression de l\'enregistrement')
    }
  },

  // Data management functions
  exportData(): string {
    const records = loadFromStorage()
    return JSON.stringify(records, null, 2)
  },

  async importData(jsonData: string): Promise<void> {
    try {
      const records = JSON.parse(jsonData) as FundraisingRecord[]
      // Validate data structure
      if (!Array.isArray(records)) {
        throw new Error('Format de données invalide')
      }
      saveToStorage(records)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Erreur lors de l\'importation des données')
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export default apiService
