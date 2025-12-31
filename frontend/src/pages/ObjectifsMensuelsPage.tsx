import React, { useMemo } from 'react'
import { useRecords, useIndividualRecords } from '../hooks/useData'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useRefresh } from '../contexts/RefreshContext'

const ObjectifsMensuelsPage: React.FC = () => {
  const { refreshTrigger } = useRefresh()
  const { records, loading: recordsLoading, error: recordsError } = useRecords(refreshTrigger)
  const { records: individualRecords, loading: individualLoading, error: individualError } = useIndividualRecords(refreshTrigger)

  const loading = recordsLoading || individualLoading
  const error = recordsError || individualError

	// Extract individual names (same logic as AllRecordsPage)
	const individualNames = useMemo(() => {
		if (!records) return []
		// Extract individual names from comma-separated lists, excluding "Groupe"
		const allNames = records.flatMap(r =>
		  r.Qui.split(',').map(name => name.trim())
		).filter(name => name !== 'Groupe')
		return [...new Set(allNames)].sort()
	}, [records])

	// Order names so that Charlotte & Nathan always appear at the bottom of the
	// table (they left, but we still show their historical contributions)
	const orderedIndividualNames = useMemo(() => {
		const retired = ['Charlotte', 'Nathan']
		const active = individualNames.filter(name => !retired.includes(name))
		const retiredPresent = retired.filter(name => individualNames.includes(name))
		return [...active, ...retiredPresent]
	}, [individualNames])

	// Generate months from September 2025 to June 2026 (full academic year)
  const months = useMemo(() => {
    const startDate = new Date('2025-09-01')
    const endDate = new Date('2026-06-30')
    const monthsList = []

    const current = new Date(startDate)
    while (current <= endDate) {
      monthsList.push({
        date: new Date(current),
        label: current.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      })
      current.setMonth(current.getMonth() + 1)
    }

    return monthsList
  }, [])

  // Calculate monthly amounts for each person
  const monthlyAmounts = useMemo(() => {
    if (!individualRecords) return new Map()

    const amounts = new Map<string, Map<string, number>>()

    // Initialize amounts for each person and month
    individualNames.forEach(person => {
      const personAmounts = new Map<string, number>()
      months.forEach(month => {
        personAmounts.set(month.key, 0)
      })
      amounts.set(person, personAmounts)
    })

    // Fill in actual amounts from individual records
    individualRecords.forEach(record => {
      const recordDate = new Date(record.Date)
      const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`

      // Only process if this month is in our range
      if (amounts.has(record.Qui)) {
        const personAmounts = amounts.get(record.Qui)!
        if (personAmounts.has(monthKey)) {
          const currentAmount = personAmounts.get(monthKey) || 0
          personAmounts.set(monthKey, currentAmount + record.Montant)
        }
      }
    })

    return amounts
  }, [individualRecords, individualNames, months])

  // Function to get the best and worst performers for each month
  const getMonthlyRankings = useMemo(() => {
    const currentDate = new Date()
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const rankings = new Map<string, { best: string[], worst: string[] }>()

    months.forEach(month => {
      // Only rank current and past months
      if (month.key > currentMonthKey) return

      const monthAmounts: { name: string, amount: number }[] = []

      individualNames.forEach(name => {
        const amount = monthlyAmounts.get(name)?.get(month.key) || 0
        monthAmounts.push({ name, amount })
      })

	    	  if (monthAmounts.length === 0) return

	    	  // Exclude Charlotte & Nathan from ranking calculations (they left)
	    	  const rankingAmounts = monthAmounts.filter(
	    	    p => p.name !== 'Nathan' && p.name !== 'Charlotte'
	    	  )

      if (rankingAmounts.length === 0) return

      // Sort by amount (highest first)
      rankingAmounts.sort((a, b) => b.amount - a.amount)

      const maxAmount = rankingAmounts[0].amount
      const minAmount = rankingAmounts[rankingAmounts.length - 1].amount

	    	  // Get all people with max amount (in case of ties) - excluding retired
      const best = rankingAmounts.filter(p => p.amount === maxAmount && p.amount > 0).map(p => p.name)
	    	  // Get all people with min amount (in case of ties) - excluding retired
      const worst = rankingAmounts.filter(p => p.amount === minAmount).map(p => p.name)

      rankings.set(month.key, { best, worst })
    })

    return rankings
  }, [monthlyAmounts, individualNames, months])

  // Function to get color based on amount vs 100€ objective
  const getAmountColor = (amount: number, isFutureMonth: boolean) => {
    if (isFutureMonth) return ''

    if (amount >= 100) return 'bg-green-100 text-green-800 border border-green-200'
    if (amount >= 75) return 'bg-lime-100 text-lime-800 border border-lime-200'
    if (amount >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    if (amount >= 25) return 'bg-orange-100 text-orange-800 border border-orange-200'
    return 'bg-red-100 text-red-800 border border-red-200' // This includes 0€
  }

  if (loading) {
    return <LoadingSpinner message="Chargement des données..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          100€ par mois, remember ? (et par personne)
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[700px] overflow-hidden">
        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ scrollBehavior: 'smooth', maxHeight: '620px' }}>
          <table className="w-full table-fixed border-collapse" style={{ minWidth: `${100 + months.length * 80}px` }}>
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-scouts-blue text-white">
                <th className="w-20 md:w-32 px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider border-r border-scouts-blue-dark">
                  Personne
                </th>
                {months.map(month => {
                  const currentDate = new Date()
                  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
                  const isFutureMonth = month.key > currentMonthKey

                  return (
                    <th key={month.label} className={`w-20 md:w-32 px-2 md:px-6 py-3 text-center text-xs md:text-sm font-medium uppercase tracking-wider border-r border-scouts-blue-dark ${isFutureMonth ? 'bg-scouts-blue/70 text-white/70' : ''}`}>
                      {month.label}
                    </th>
                  )
                })}
              </tr>
            </thead>
	            <tbody className="bg-white divide-y divide-gray-200">
	              {orderedIndividualNames.map((name, index) => {
	                const isRetired = name === 'Charlotte' || name === 'Nathan'

	                return (
	                  <tr
	                    key={name}
	                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${
	                      isRetired ? 'opacity-60' : ''
	                    }`}
	                  >
	                    <td
	                      className={`px-2 md:px-4 py-4 whitespace-nowrap text-xs md:text-sm font-medium border-r border-gray-200 ${
	                        isRetired ? 'text-gray-400 italic' : 'text-gray-900'
	                      }`}
	                    >
	                      {name} {isRetired && '💀'}
	                    </td>
	                    {months.map(month => {
	                      const amount = monthlyAmounts.get(name)?.get(month.key) || 0
	                      const currentDate = new Date()
	                      const currentMonthKey = `${currentDate.getFullYear()}-${String(
	                        currentDate.getMonth() + 1
	                      ).padStart(2, '0')}`
	                      const isFutureMonth = month.key > currentMonthKey
	                      const colorClasses = getAmountColor(amount, isFutureMonth)

	                      // Get ranking emojis for this month
	                      const monthRanking = getMonthlyRankings.get(month.key)
	                      const isBest = monthRanking?.best.includes(name) || false
	                      const isWorst = monthRanking?.worst.includes(name) || false

	                      return (
	                        <td
	                          key={month.label}
	                          className={`px-2 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-center border-r border-gray-200 ${
	                            isFutureMonth ? 'bg-gray-100 text-gray-400' : 'text-gray-900'
	                          }`}
	                        >
	                          {isFutureMonth ? (
	                            '-'
	                          ) : (
	                            <div className="relative inline-block">
	                              <span
	                                className={`px-2 py-1 rounded-md font-medium ${colorClasses}`}
	                              >
	                                {formatCurrency(amount)}
	                              </span>
										{!isRetired && isBest && (
										  <span className="absolute -top-2 -right-2 text-xs">👑</span>
										)}
										{!isRetired && isWorst && !isBest && (
										  <span className="absolute -top-2 -right-2 text-xs">💩</span>
										)}
	                            </div>
	                          )}
	                        </td>
	                      )
	                    })}
	                  </tr>
	                )
	              })}
	            </tbody>
          </table>

          {individualNames.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune donnée disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ObjectifsMensuelsPage
