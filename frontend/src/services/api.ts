import { FundraisingRecord, SummaryData } from '../types'
import initialData from '../data/fundraising-data.json'

const STORAGE_KEY = 'pissenlits-fundraising-data'

// Import data from JSON file - easier to maintain
const INITIAL_DATA: FundraisingRecord[] = initialData

// Helper type for individual records (always have number Montant)
type IndividualRecord = Omit<FundraisingRecord, 'Montant'> & { Montant: number }

// Utility function to split records with multiple people into individual records
const splitRecordsForIndividuals = (records: FundraisingRecord[]): IndividualRecord[] => {
  const individualRecords: IndividualRecord[] = []

  records.forEach(record => {
    // Check if the "Qui" field contains multiple people (comma-separated)
    const people = record.Qui.split(',').map(name => name.trim()).filter(name => name.length > 0)

    if (people.length > 1) {
      // Handle both formats: equal split (number) or individual amounts (array)
      if (Array.isArray(record.Montant)) {
        // Individual amounts format: [100, 100, 75, 25]
        if (record.Montant.length !== people.length) {
          console.warn(`Mismatch between number of people (${people.length}) and amounts (${record.Montant.length}) for record:`, record)
          // Fall back to equal split if array length doesn't match
          const individualAmount = Math.round((record.Montant.reduce((sum, amount) => sum + amount, 0) / people.length) * 100) / 100
          people.forEach(person => {
            individualRecords.push({
              ...record,
              Qui: person,
              Montant: individualAmount
            })
          })
        } else {
          // Create individual records with corresponding amounts
          people.forEach((person, index) => {
            individualRecords.push({
              ...record,
              Qui: person,
              Montant: (record.Montant as number[])[index]
            })
          })
        }
      } else {
        // Equal split format: 300
        const individualAmount = Math.round((record.Montant / people.length) * 100) / 100

        // Create individual records for each person
        people.forEach(person => {
          individualRecords.push({
            ...record,
            Qui: person,
            Montant: individualAmount
          })
        })
      }
    } else {
      // Single person or group activity - keep as is, but ensure Montant is a number
      const montant = Array.isArray(record.Montant) ? record.Montant[0] || 0 : record.Montant
      individualRecords.push({
        ...record,
        Montant: montant
      })
    }
  })

  return individualRecords
}

// Helper functions for sessionStorage (always fresh data on new browser sessions)
const loadFromStorage = (): FundraisingRecord[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      // First time in this session - initialize with fresh data from JSON
      saveToStorage(INITIAL_DATA)
      return INITIAL_DATA
    }
  } catch (error) {
    console.error('Error loading from sessionStorage:', error)
    return INITIAL_DATA
  }
}

const saveToStorage = (data: FundraisingRecord[]): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to sessionStorage:', error)
    throw new Error('Erreur lors de la sauvegarde des données')
  }
}

// Calculate summary data from records
const calculateSummary = (records: FundraisingRecord[]): SummaryData => {
  // Get individual records for person calculations
  const individualRecords = splitRecordsForIndividuals(records)

  // Calculate total funds (use original records to avoid double counting)
  const total_funds = records.reduce((sum, record) => {
    const amount = Array.isArray(record.Montant)
      ? record.Montant.reduce((a, b) => a + b, 0)
      : record.Montant
    return sum + amount
  }, 0)

  // Group by person for leaderboard (use individual records)
  const person_totals: { [key: string]: number } = {}
  individualRecords.forEach(record => {
    person_totals[record.Qui] = (person_totals[record.Qui] || 0) + record.Montant
  })

  // Group by activity (use original records)
  const activity_totals: { [key: string]: number } = {}
  const activity_counts: { [key: string]: number } = {}
  records.forEach(record => {
    const amount = Array.isArray(record.Montant)
      ? record.Montant.reduce((a, b) => a + b, 0)
      : record.Montant
    activity_totals[record.Activité] = (activity_totals[record.Activité] || 0) + amount
    activity_counts[record.Activité] = (activity_counts[record.Activité] || 0) + 1
  })

  // Group by type
  const type_totals: { [key: string]: number } = {}
  const type_counts: { [key: string]: number } = {}
  records.forEach(record => {
    const amount = Array.isArray(record.Montant)
      ? record.Montant.reduce((a, b) => a + b, 0)
      : record.Montant
    type_totals[record.Type] = (type_totals[record.Type] || 0) + amount
    type_counts[record.Type] = (type_counts[record.Type] || 0) + 1
  })

  // Create cumulative data for all dates from Sept 1, 2025 to June 30, 2026
  const startDate = new Date('2025-09-01')
  const endDate = new Date('2026-06-30')
  const currentDate = new Date()
  const sortedRecords = [...records].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
  const cumulative_data: { date: string; total: number }[] = []

  let runningTotal = 0
  const currentDateObj = new Date(startDate)

  while (currentDateObj <= endDate && currentDateObj <= currentDate) {
    const dateKey = currentDateObj.toISOString().split('T')[0]

    // Check if there are any transactions on this date
    const dayRecords = sortedRecords.filter(record => record.Date === dateKey)

    // Add all transactions for this day
    dayRecords.forEach(record => {
      const amount = Array.isArray(record.Montant)
        ? record.Montant.reduce((a, b) => a + b, 0)
        : record.Montant
      runningTotal += amount
    })

    // Add data point for this date
    cumulative_data.push({
      date: dateKey,
      total: runningTotal
    })

    // Move to next day
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }

  return {
    total_funds,
    person_totals,
    activity_totals,
    activity_counts,
    type_totals,
    type_counts,
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

  async getIndividualRecords(): Promise<IndividualRecord[]> {
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100))
      const records = loadFromStorage()
      return splitRecordsForIndividuals(records)
    } catch (error) {
      console.error('Error fetching individual records:', error)
      throw new Error('Impossible de charger les données individuelles, veuillez réessayer')
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
        r.Qui === updatedRecord.Qui &&
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
          r.Qui === record.Qui &&
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
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export default apiService
