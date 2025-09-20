import React, { useState, useMemo } from 'react'
import { useRecords } from '../hooks/useData'
import { formatCurrency, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { FundraisingRecord } from '../types'

type SortField = keyof FundraisingRecord
type SortDirection = 'asc' | 'desc'

const AllRecordsPage: React.FC = () => {
  const { records, loading, error } = useRecords()
  const [sortField, setSortField] = useState<SortField>('Date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterActivity, setFilterActivity] = useState<string>('')
  const [filterPerson, setFilterPerson] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedRecords = useMemo(() => {
    if (!records) return []

    let filtered = records.filter(record => {
      const matchesActivity = !filterActivity || record.Activité === filterActivity
      const matchesPerson = !filterPerson || record.Nom === filterPerson
      const matchesSearch = !searchTerm ||
        Object.values(record).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )

      return matchesActivity && matchesPerson && matchesSearch
    })

    return filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'Date') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [records, sortField, sortDirection, filterActivity, filterPerson, searchTerm])

  if (loading) {
    return <LoadingSpinner message="Chargement des collectes..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!records) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

  const uniqueActivities = [...new Set(records.map(r => r.Activité))].sort()
  const uniquePersons = [...new Set(records.map(r => r.Nom))].sort()

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-scouts-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-scouts-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          Liste des collectes
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          Consultez toutes les contributions des Pissenlits
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activité
            </label>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
            >
              <option value="">Toutes les activités</option>
              {uniqueActivities.map(activity => (
                <option key={activity} value={activity}>{activity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contributeur
            </label>
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scouts-blue focus:border-transparent"
            >
              <option value="">Tous les contributeurs</option>
              {uniquePersons.map(person => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterActivity('')
                setFilterPerson('')
                setSearchTerm('')
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredAndSortedRecords.length} collecte(s) trouvée(s) sur {records.length} au total
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-scouts-blue text-white">
                {[
                  { key: 'Date' as SortField, label: 'Date' },
                  { key: 'Nom' as SortField, label: 'Nom' },
                  { key: 'Activité' as SortField, label: 'Activité' },
                  { key: 'Détails' as SortField, label: 'Détails' },
                  { key: 'Montant' as SortField, label: 'Montant' },
                  { key: 'Qui' as SortField, label: 'Responsable' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider cursor-pointer hover:bg-scouts-blue-dark transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {getSortIcon(key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedRecords.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.Date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.Nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.Activité}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {record.Détails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-scouts-blue">
                    {formatCurrency(record.Montant)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.Qui}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucune collecte ne correspond aux critères de recherche.
          </div>
        )}
      </div>
    </div>
  )
}

export default AllRecordsPage
