export interface FundraisingRecord {
  Date: string
  Nom: string
  Activité: string
  Détails: string
  Montant: number
  Qui: string
}

export interface SummaryData {
  total_funds: number
  person_totals: { [key: string]: number }
  activity_totals: { [key: string]: number }
  activity_counts: { [key: string]: number }
  cumulative_data: Array<{
    date: string
    total: number
  }>
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
