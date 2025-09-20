import axios from 'axios'
import { FundraisingRecord, SummaryData } from '../types'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const apiService = {
  async getRecords(): Promise<FundraisingRecord[]> {
    try {
      const response = await api.get<FundraisingRecord[]>('/records')
      return response.data
    } catch (error) {
      console.error('Error fetching records:', error)
      throw new Error('Impossible de charger les données, veuillez réessayer')
    }
  },

  async getSummary(): Promise<SummaryData> {
    try {
      const response = await api.get<SummaryData>('/summary')
      return response.data
    } catch (error) {
      console.error('Error fetching summary:', error)
      throw new Error('Impossible de charger les données, veuillez réessayer')
    }
  }
}

export default apiService
