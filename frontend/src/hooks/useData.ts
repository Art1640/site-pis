import { useState, useEffect } from 'react'
import { FundraisingRecord, SummaryData } from '../types'
import { apiService } from '../services/api'

// Helper type for individual records (always have number Montant)
type IndividualRecord = Omit<FundraisingRecord, 'Montant'> & { Montant: number }

export const useRecords = (refreshTrigger?: number) => {
  const [records, setRecords] = useState<FundraisingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const data = await apiService.getRecords()
        setRecords(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [refreshTrigger])

  return { records, loading, error }
}

export const useIndividualRecords = (refreshTrigger?: number) => {
  const [records, setRecords] = useState<IndividualRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const data = await apiService.getIndividualRecords()
        setRecords(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [refreshTrigger])

  return { records, loading, error }
}

export const useSummary = (refreshTrigger?: number) => {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const data = await apiService.getSummary()
        setSummary(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [refreshTrigger])

  return { summary, loading, error }
}
