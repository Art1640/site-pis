import { FundraisingRecord, SummaryData } from '../types'

// Get API URL from environment variable or use default for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

console.log('🔗 API Base URL:', API_BASE_URL)

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('pissenlits_auth_token')
}

// Dispatch a custom event so AuthContext can react and log the user out
const handleUnauthorized = (): void => {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
}

// Helper function to create headers with auth token
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

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
      // Single person - handle array or number
      const montant = Array.isArray(record.Montant)
        ? record.Montant.reduce((sum, amount) => sum + amount, 0)
        : record.Montant

      individualRecords.push({
        ...record,
        Montant: montant
      })
    }
  })

  return individualRecords
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

  // Group by activity type
  const activity_totals: { [key: string]: number } = {}
  const activity_counts: { [key: string]: number } = {}
  individualRecords.forEach(record => {
    const activity = record.Activité
    activity_totals[activity] = (activity_totals[activity] || 0) + record.Montant
    activity_counts[activity] = (activity_counts[activity] || 0) + 1
  })

  // Group by type
  const type_totals: { [key: string]: number } = {}
  const type_counts: { [key: string]: number } = {}
  individualRecords.forEach(record => {
    const type = record.Type
    type_totals[type] = (type_totals[type] || 0) + record.Montant
    type_counts[type] = (type_counts[type] || 0) + 1
  })

  // Calculate cumulative data by date
  const sortedRecords = [...records].sort((a, b) => a.Date.localeCompare(b.Date))
  const cumulative_data: { date: string; total: number }[] = []
  let running_total = 0

  sortedRecords.forEach(record => {
    const amount = Array.isArray(record.Montant)
      ? record.Montant.reduce((a, b) => a + b, 0)
      : record.Montant
    running_total += amount
    cumulative_data.push({
      date: record.Date,
      total: running_total
    })
  })

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

export const backendApiService = {
  async getRecords(): Promise<FundraisingRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/records`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          throw new Error('Session expirée, veuillez vous reconnecter')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching records:', error)
      throw error instanceof Error ? error : new Error('Impossible de charger les données, veuillez réessayer')
    }
  },

  async getIndividualRecords(): Promise<IndividualRecord[]> {
    try {
      const records = await this.getRecords()
      return splitRecordsForIndividuals(records)
    } catch (error) {
      console.error('Error fetching individual records:', error)
      throw new Error('Impossible de charger les données individuelles, veuillez réessayer')
    }
  },

  async getSummary(): Promise<SummaryData> {
    try {
      const records = await this.getRecords()
      return calculateSummary(records)
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw new Error('Impossible de charger les données, veuillez réessayer')
    }
  },

  async addRecord(record: Omit<FundraisingRecord, 'id'>): Promise<FundraisingRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/records`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      })
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          throw new Error('Session expirée, veuillez vous reconnecter')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error adding record:', error)
      throw error instanceof Error ? error : new Error('Erreur lors de l\'ajout de l\'enregistrement')
    }
  },

  async updateRecord(record: FundraisingRecord): Promise<FundraisingRecord> {
    try {
      if (!record.id) {
        throw new Error('Record ID is required for update')
      }
      const response = await fetch(`${API_BASE_URL}/api/records/${record.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(record),
      })
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          throw new Error('Session expirée, veuillez vous reconnecter')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating record:', error)
      throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour de l\'enregistrement')
    }
  },

  async deleteRecord(record: FundraisingRecord): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/records/delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          Date: record.Date,
          Qui: record.Qui,
          Activité: record.Activité,
        }),
      })
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized()
          throw new Error('Session expirée, veuillez vous reconnecter')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      throw error instanceof Error ? error : new Error('Erreur lors de la suppression de l\'enregistrement')
    }
  },

  async resetData(): Promise<void> {
    // Not implemented for backend - would need admin endpoint
    throw new Error('Reset data not available with backend API')
  },

  exportData(): string {
    // For backend mode, we need to fetch the data first
    throw new Error('Use getRecords() to fetch data, then export manually')
  },

  importData(_jsonString: string): void {
    // Not implemented for backend - would need admin endpoint
    throw new Error('Import data not available with backend API')
  },

  clearAllData(): void {
    // Not implemented for backend - data is always fresh from server
    // This is a no-op in backend mode
    console.log('clearAllData() is not needed in backend mode - data is always fresh')
  }
}

