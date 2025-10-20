import React, { useState, useMemo, useEffect } from 'react'
import { useRecords } from '../hooks/useData'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getTotalAmount, getAmountTooltip, isArrayAmount, getTruncatedText } from '../utils/amountUtils'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { FundraisingRecord } from '../types'
import { useRefresh } from '../contexts/RefreshContext'

type SortField = keyof FundraisingRecord
type SortDirection = 'asc' | 'desc'

const AllRecordsPage: React.FC = () => {
  const { refreshTrigger } = useRefresh()
  const { records, loading, error } = useRecords(refreshTrigger)
  const [sortField, setSortField] = useState<SortField>('Date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterQui, setFilterQui] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [showQuiDropdown, setShowQuiDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

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

    // Apply filters
    let filtered = records.filter(record => {
      let matchesQui = false

      if (filterQui === '') {
        // Show all records
        matchesQui = true
      } else if (filterQui === 'Groupe') {
        // Show only records where Qui exactly equals "Groupe"
        matchesQui = record.Qui === 'Groupe'
      } else {
        // Check if the selected person is involved in this record (either individually or as part of a group)
        matchesQui = record.Qui.split(',').map(name => name.trim()).includes(filterQui)
      }

      const matchesType = filterType === '' || record.Type === filterType
      return matchesQui && matchesType
    })

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === 'Date') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else if (sortField === 'Montant') {
        // Handle array amounts for sorting
        aValue = getTotalAmount(aValue as number | number[])
        bValue = getTotalAmount(bValue as number | number[])
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [records, sortField, sortDirection, filterQui, filterType])

  // Get unique values for filters
  const uniqueQui = useMemo(() => {
    if (!records) return []
    // Extract individual names from comma-separated lists, excluding "Groupe"
    const allNames = records.flatMap(r =>
      r.Qui.split(',').map(name => name.trim())
    ).filter(name => name !== 'Groupe')
    return [...new Set(allNames)].sort()
  }, [records])

  const uniqueTypes = useMemo(() => {
    if (!records) return []
    return [...new Set(records.map(r => r.Type))].sort()
  }, [records])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowQuiDropdown(false)
      setShowTypeDropdown(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const getFilterIcon = (hasFilter: boolean) => {
    return (
      <svg
        className={`w-4 h-4 ${hasFilter ? 'text-yellow-300' : 'text-gray-300'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
    )
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des collectes..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!records) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

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
          Liste des activités
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[700px] overflow-hidden">
        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ scrollBehavior: 'smooth', maxHeight: '620px' }}>
          <table className="w-full table-fixed min-w-[800px] md:min-w-[1200px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-scouts-blue text-white">
                {/* Date - Sortable */}
                <th
                  onClick={() => handleSort('Date')}
                  className="w-24 md:w-32 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider cursor-pointer hover:bg-scouts-blue-dark transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {getSortIcon('Date')}
                  </div>
                </th>

                {/* Qui - Filterable */}
                <th className="w-32 md:w-48 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider relative group">
                  <div className="flex items-center space-x-1">
                    <span>Qui</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (filterQui) {
                            setFilterQui('')
                          } else {
                            setShowQuiDropdown(!showQuiDropdown)
                            setShowTypeDropdown(false)
                          }
                        }}
                        className="flex items-center space-x-1 hover:bg-scouts-blue-dark rounded px-1 transition-colors"
                      >
                        {getFilterIcon(!!filterQui)}
                      </button>
                      {showQuiDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto whitespace-nowrap">
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setFilterQui('')
                              setShowQuiDropdown(false)
                            }}
                            className="px-3 py-1 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                          >
                            Tous
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setFilterQui('Groupe')
                              setShowQuiDropdown(false)
                            }}
                            className="px-3 py-1 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                          >
                            Groupe
                          </div>
                          {uniqueQui.map(qui => (
                            <div
                              key={qui}
                              onClick={(e) => {
                                e.stopPropagation()
                                setFilterQui(qui)
                                setShowQuiDropdown(false)
                              }}
                              className="px-3 py-1 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                            >
                              {qui}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>

                {/* Type - Filterable */}
                <th className="w-24 md:w-36 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider relative group">
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (filterType) {
                            setFilterType('')
                          } else {
                            setShowTypeDropdown(!showTypeDropdown)
                            setShowQuiDropdown(false)
                          }
                        }}
                        className="flex items-center space-x-1 hover:bg-scouts-blue-dark rounded px-1 transition-colors"
                      >
                        {getFilterIcon(!!filterType)}
                      </button>
                      {showTypeDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto whitespace-nowrap">
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setFilterType('')
                              setShowTypeDropdown(false)
                            }}
                            className="px-3 py-1 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                          >
                            Tous
                          </div>
                          {uniqueTypes.map(type => (
                            <div
                              key={type}
                              onClick={(e) => {
                                e.stopPropagation()
                                setFilterType(type)
                                setShowTypeDropdown(false)
                              }}
                              className="px-3 py-1 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </th>

                {/* Activité - Not sortable */}
                <th className="w-32 md:w-44 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                  Activité
                </th>

                {/* Détails - Not sortable */}
                <th className="w-48 md:w-96 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                  Détails
                </th>

                {/* Montant - Sortable */}
                <th
                  onClick={() => handleSort('Montant')}
                  className="w-24 md:w-36 px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider cursor-pointer hover:bg-scouts-blue-dark transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Montant</span>
                    {getSortIcon('Montant')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedRecords.map((record, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    {formatDate(record.Date)}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                    {(() => {
                      const { truncated, needsTooltip, original } = getTruncatedText(record.Qui, 25)

                      if (needsTooltip) {
                        return (
                          <div className="relative group">
                            {truncated}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10 min-w-max">
                              {original}
                            </div>
                          </div>
                        )
                      }

                      return truncated
                    })()}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    {record.Type}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                    {record.Activité}
                  </td>
                  <td className="px-3 md:px-6 py-4 text-xs md:text-sm text-gray-900 max-w-xs truncate">
                    {record.Détails}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-semibold text-scouts-blue">
                    {isArrayAmount(record.Montant) ? (
                      <div className="relative group">
                        {formatCurrency(getTotalAmount(record.Montant))}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-pre-line z-10 min-w-max">
                          {getAmountTooltip(record.Montant, record.Qui.split(',').map(name => name.trim()))}
                        </div>
                      </div>
                    ) : (
                      formatCurrency(record.Montant as number)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Filtre mieux, boufonne.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllRecordsPage
