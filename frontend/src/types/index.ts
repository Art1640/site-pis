export interface FundraisingRecord {
  Date: string
  Qui: string
  Type: string
  Activité: string
  Détails: string
  Montant: number
}

export interface SummaryData {
  total_funds: number
  person_totals: { [key: string]: number }
  activity_totals: { [key: string]: number }
  activity_counts: { [key: string]: number }
  type_totals: { [key: string]: number }
  type_counts: { [key: string]: number }
  cumulative_data: Array<{
    date: string
    total: number
  }>
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
