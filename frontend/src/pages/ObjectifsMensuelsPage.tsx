import React, { useMemo, useState } from 'react'
import { useRecords, useIndividualRecords } from '../hooks/useData'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useRefresh } from '../contexts/RefreshContext'

const TARGET_PER_MONTH = 120

const ObjectifsMensuelsPage: React.FC = () => {
  const { refreshTrigger } = useRefresh()
  const { records, loading: recordsLoading, error: recordsError } = useRecords(refreshTrigger)
  const { records: individualRecords, loading: individualLoading, error: individualError } = useIndividualRecords(refreshTrigger)
  const [showGlobalView, setShowGlobalView] = useState(false)

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

  // Cumulative monthly targets: 120, 240, ..., 1200
  const monthlyTargets = useMemo(() => {
    const targets = new Map<string, number>()
    months.forEach((month, index) => {
      targets.set(month.key, TARGET_PER_MONTH * (index + 1))
    })
    return targets
  }, [months])

  // Calculate cumulative amounts per person per month
  const cumulativeAmounts = useMemo(() => {
    const cumulative = new Map<string, Map<string, number>>()
    individualNames.forEach(person => {
      const personCumulative = new Map<string, number>()
      let runningTotal = 0
      months.forEach(month => {
        runningTotal += monthlyAmounts.get(person)?.get(month.key) || 0
        personCumulative.set(month.key, runningTotal)
      })
      cumulative.set(person, personCumulative)
    })
    return cumulative
  }, [monthlyAmounts, individualNames, months])

  // Current month key (reused in JSX)
  const currentMonthKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])

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

  // Function to get color based on amount vs 120€ objective
  const getAmountColor = (amount: number, isFutureMonth: boolean) => {
    if (isFutureMonth) return ''

    if (amount >= 120) return 'bg-green-100 text-green-800 border border-green-200'
    if (amount >= 90) return 'bg-lime-100 text-lime-800 border border-lime-200'
    if (amount >= 60) return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    if (amount >= 30) return 'bg-orange-100 text-orange-800 border border-orange-200'
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
          Objectif 1200€ avant juillet
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[700px] overflow-hidden">
        {/* Toggle buttons */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowGlobalView(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showGlobalView
                  ? 'bg-scouts-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📅 Par mois
            </button>
            <button
              onClick={() => setShowGlobalView(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showGlobalView
                  ? 'bg-scouts-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Global
            </button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ scrollBehavior: 'smooth' }}>
          {!showGlobalView ? (
          <table className="w-full table-fixed border-collapse" style={{ minWidth: `${100 + months.length * 80}px` }}>
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-scouts-blue text-white">
                <th className="w-20 md:w-32 px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider border-r border-scouts-blue-dark">
                  Personne
                </th>
                {months.map(month => {
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
          ) : (
          /* ── GLOBAL VIEW ── */
          <table className="w-full table-fixed border-collapse" style={{ minWidth: `${100 + months.length * 80}px` }}>
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-scouts-blue text-white">
                <th className="w-20 md:w-32 px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider border-r border-scouts-blue-dark">
                  Personne
                </th>
                {months.map(month => {
                  const isFutureMonth = month.key > currentMonthKey
                  return (
                    <th key={month.label} className={`w-20 md:w-32 px-2 md:px-6 py-3 text-center text-xs md:text-sm font-medium uppercase tracking-wider border-r border-scouts-blue-dark ${isFutureMonth ? 'bg-scouts-blue/70 text-white/70' : ''}`}>
                      {month.label}
                    </th>
                  )
                })}
              </tr>
              {/* Cumulative target row */}
              <tr className="bg-amber-50 border-b-2 border-amber-300">
                <td className="px-2 md:px-4 py-3 whitespace-nowrap text-xs md:text-sm font-bold text-amber-800 border-r border-amber-200">
                  🎯 Objectif
                </td>
                {months.map(month => {
                  const isFutureMonth = month.key > currentMonthKey
                  const target = monthlyTargets.get(month.key) || 0
                  return (
                    <td key={month.key} className={`px-2 md:px-6 py-3 text-xs md:text-sm text-center font-bold border-r border-amber-200 ${isFutureMonth ? 'text-amber-300' : 'text-amber-800'}`}>
                      {formatCurrency(target)}
                    </td>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orderedIndividualNames.map(name => {
                const isRetired = name === 'Charlotte' || name === 'Nathan'
                const personCurrentCumulative = cumulativeAmounts.get(name)?.get(currentMonthKey) || 0
                const currentTarget = monthlyTargets.get(currentMonthKey) || 0
                const isOnTrack = !isRetired && personCurrentCumulative >= currentTarget
                const rowBg = isRetired ? 'bg-gray-50 opacity-60' : isOnTrack ? 'bg-green-50' : 'bg-red-50'
                return (
                  <tr key={name} className={rowBg}>
                    <td className={`px-2 md:px-4 py-4 whitespace-nowrap text-xs md:text-sm font-medium border-r border-gray-200 ${isRetired ? 'text-gray-400 italic' : isOnTrack ? 'text-green-900' : 'text-red-900'}`}>
                      {name} {isRetired ? '💀' : isOnTrack ? '✅' : '❌'}
                    </td>
                    {months.map(month => {
                      const isFutureMonth = month.key > currentMonthKey
                      const cumulative = cumulativeAmounts.get(name)?.get(month.key) || 0
                      const target = monthlyTargets.get(month.key) || 0
                      const isAbove = cumulative >= target
                      return (
                        <td key={month.key} className={`px-2 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-center border-r border-gray-200 ${isFutureMonth ? 'text-gray-400' : 'text-gray-900'}`}>
                          {isFutureMonth ? '-' : (
                            <span className={`px-2 py-1 rounded-md font-medium ${
                              isRetired
                                ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                : isAbove
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {formatCurrency(cumulative)}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          )}

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
