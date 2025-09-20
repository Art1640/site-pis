import { useState, useEffect } from 'react'
import { FundraisingRecord, SummaryData } from '../types'
import { apiService } from '../services/api'

export const useRecords = () => {
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
  }, [])

  return { records, loading, error }
}

export const useSummary = () => {
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
  }, [])

  return { summary, loading, error }
}
