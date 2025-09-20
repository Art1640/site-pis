import React, { useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useSummary, useRecords } from '../hooks/useData'
import { formatCurrency, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const HomePage: React.FC = () => {
  const { summary, loading: summaryLoading, error: summaryError } = useSummary()
  const { records, loading: recordsLoading, error: recordsError } = useRecords()
  const [showPerPerson, setShowPerPerson] = useState(false)

  // All hooks must be called unconditionally at the top level
  const loading = summaryLoading || recordsLoading
  const error = summaryError || recordsError

  // Generate full date range from Sept 1, 2025 to June 30, 2026
  const dateRange = useMemo(() => {
    const startDate = new Date('2025-09-01')
    const endDate = new Date('2026-06-30')
    const dates = []
    const current = new Date(startDate)

    while (current <= endDate) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }, [])

  // Create cumulative data for total funds
  const cumulativeData = useMemo(() => {
    if (!records) return []

    const currentDate = new Date()
    const endDate = new Date('2026-06-30')
    const dataMap = new Map()

    // Initialize all dates with 0
    dateRange.forEach(date => {
      dataMap.set(date.toISOString().split('T')[0], 0)
    })

    // Fill in actual data up to current date
    let runningTotal = 0
    const sortedRecords = [...records].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    sortedRecords.forEach(record => {
      const recordDate = new Date(record.Date)
      if (recordDate <= currentDate) {
        runningTotal += record.Montant
        const dateKey = record.Date
        dataMap.set(dateKey, runningTotal)

        // Fill forward for subsequent dates up to current date
        const nextDay = new Date(recordDate)
        nextDay.setDate(nextDay.getDate() + 1)

        while (nextDay <= currentDate && nextDay <= endDate) {
          const nextDateKey = nextDay.toISOString().split('T')[0]
          if (dataMap.get(nextDateKey) < runningTotal) {
            dataMap.set(nextDateKey, runningTotal)
          }
          nextDay.setDate(nextDay.getDate() + 1)
        }
      }
    })

    return Array.from(dataMap.entries()).map(([date, total]) => ({ date, total }))
  }, [records, dateRange])

  // Create per-person cumulative data
  const { personTotals, uniquePersons } = useMemo(() => {
    if (!records) return { personTotals: new Map(), uniquePersons: [] }

    const currentDate = new Date()
    const endDate = new Date('2026-06-30')
    const personTotals = new Map()
    const uniquePersons = [...new Set(records.map(r => r.Nom))]

    // Initialize person totals for each date
    uniquePersons.forEach(person => {
      const personData = new Map()
      dateRange.forEach(date => {
        personData.set(date.toISOString().split('T')[0], 0)
      })
      personTotals.set(person, personData)
    })

    // Fill in actual data up to current date
    const sortedRecords = [...records].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    uniquePersons.forEach(person => {
      let runningTotal = 0
      const personData = personTotals.get(person)

      sortedRecords.forEach(record => {
        const recordDate = new Date(record.Date)
        if (record.Nom === person && recordDate <= currentDate) {
          runningTotal += record.Montant
          const dateKey = record.Date
          personData.set(dateKey, runningTotal)

          // Fill forward for subsequent dates up to current date
          const nextDay = new Date(recordDate)
          nextDay.setDate(nextDay.getDate() + 1)

          while (nextDay <= currentDate && nextDay <= endDate) {
            const nextDateKey = nextDay.toISOString().split('T')[0]
            if (personData.get(nextDateKey) < runningTotal) {
              personData.set(nextDateKey, runningTotal)
            }
            nextDay.setDate(nextDay.getDate() + 1)
          }
        }
      })
    })

    return { personTotals, uniquePersons }
  }, [records, dateRange])

  // Colors for different people - blue theme variations
  const personColors = useMemo(() => [
    '#1E3A8A', '#3B82F6', '#1E40AF', '#2563EB', '#1D4ED8',
    '#6366F1', '#4F46E5', '#7C3AED', '#8B5CF6', '#A855F7',
    '#C084FC', '#E879F9', '#F472B6', '#FB7185', '#F87171'
  ], [])

  const chartData = useMemo(() => {
    const currentDate = new Date()

    return {
      labels: dateRange.map(date => formatDate(date.toISOString().split('T')[0])),
      datasets: showPerPerson ?
        uniquePersons.map((person, index) => ({
          label: person,
          data: dateRange.map(date => {
            const dateKey = date.toISOString().split('T')[0]
            const dateObj = new Date(dateKey)
            return dateObj <= currentDate ? personTotals.get(person)?.get(dateKey) || 0 : null
          }),
          borderColor: personColors[index % personColors.length],
          backgroundColor: `${personColors[index % personColors.length]}20`,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointBackgroundColor: personColors[index % personColors.length],
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          spanGaps: false,
        })) :
        [
          {
            label: 'Fonds collectés (€)',
            data: dateRange.map(date => {
              const dateKey = date.toISOString().split('T')[0]
              const dateObj = new Date(dateKey)
              const dataPoint = cumulativeData.find(d => d.date === dateKey)
              return dateObj <= currentDate ? (dataPoint?.total || 0) : null
            }),
            borderColor: '#1E3A8A',
            backgroundColor: 'rgba(30, 58, 138, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointBackgroundColor: '#1E3A8A',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            spanGaps: false,
          },
        ],
    }
  }, [dateRange, showPerPerson, uniquePersons, personTotals, cumulativeData, personColors])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showPerPerson,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1E3A8A',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (showPerPerson) {
              return `${context.dataset.label} : ${formatCurrency(context.parsed.y || 0)}`
            }
            return `Total : ${formatCurrency(context.parsed.y || 0)}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          autoSkip: false,
          maxTicksLimit: 11,
          callback: function(_value: any, index: number) {
            if (index >= dateRange.length) return ''

            const date = new Date(dateRange[index])
            const day = date.getDate()
            const month = date.getMonth()
            const year = date.getFullYear()

            // Show only the first day of each month from Sept 2025 to July 2026
            if (day === 1) {
              // September 2025 to December 2025
              if (year === 2025 && month >= 8) {
                return date.toLocaleDateString('fr-FR', {
                  month: 'short',
                  // year: month === 8 ? '2-digit' : undefined // Show year only for September
                })
              }
              // January 2026 to July 2026
              else if (year === 2026 && month <= 6) {
                return date.toLocaleDateString('fr-FR', {
                  month: 'short'
                })
              }
            }
            return ''
          },
          color: '#666',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value)
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), [showPerPerson, dateRange])

  // Early returns after all hooks are called
  if (loading) {
    return <LoadingSpinner message="Chargement des données..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!summary || !records) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-green mb-4">
          Évolution des fonds collectés
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          Projet Scouts 2025-2026
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Bienvenue sur le site de collecte de fonds pour notre projet Scouts !
          Suivez notre progression ci-dessous et découvrez comment nous nous rapprochons
          de notre objectif grâce à vos contributions.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-3xl font-bold text-scouts-blue">
              Total collecté : {formatCurrency(summary.total_funds)}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowPerPerson(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showPerPerson
                  ? 'bg-scouts-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📈 Total
            </button>
            <button
              onClick={() => setShowPerPerson(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showPerPerson
                  ? 'bg-scouts-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👥 Par personne
            </button>
          </div>
        </div>

        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default HomePage
