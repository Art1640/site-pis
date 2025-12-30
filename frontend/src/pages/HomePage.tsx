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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useSummary, useRecords, useIndividualRecords } from '../hooks/useData'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getTotalAmount } from '../utils/amountUtils'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useRefresh } from '../contexts/RefreshContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
)

const HomePage: React.FC = () => {
  const { refreshTrigger } = useRefresh()
  const { summary, loading: summaryLoading, error: summaryError } = useSummary(refreshTrigger)
  const { records, loading: recordsLoading, error: recordsError } = useRecords(refreshTrigger)
  const { records: individualRecords, loading: individualLoading, error: individualError } = useIndividualRecords(refreshTrigger)
  const [showPerPerson, setShowPerPerson] = useState(false)

  // All hooks must be called unconditionally at the top level
  const loading = summaryLoading || recordsLoading || individualLoading
  const error = summaryError || recordsError || individualError

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
    const sortedRecords = [...records].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())
    let runningTotal = 0

    // Process each date in chronological order
    const result = dateRange.map(date => {
      const dateKey = date.toISOString().split('T')[0]
      const dateObj = new Date(dateKey)

      if (dateObj <= currentDate) {
        // Check if there are any transactions on this specific date
        const dayRecords = sortedRecords.filter(record => record.Date === dateKey)

        // Add all transactions for this day
        dayRecords.forEach(record => {
          runningTotal += getTotalAmount(record.Montant)
        })

        return { date: dateKey, total: runningTotal }
      }

      return null
    }).filter(item => item !== null)

    return result
  }, [records, dateRange])

  // Create per-person cumulative data (use individual records for accurate per-person amounts)
  const { personTotals, uniquePersons } = useMemo(() => {
    if (!individualRecords) return { personTotals: new Map(), uniquePersons: [] }

    const currentDate = new Date()
    const personTotals = new Map()
    const uniquePersons = [...new Set(individualRecords.map(r => r.Qui))]

    // Initialize person totals for each date
    uniquePersons.forEach(person => {
      const personData = new Map()
      dateRange.forEach(date => {
        personData.set(date.toISOString().split('T')[0], 0)
      })
      personTotals.set(person, personData)
    })

    // Fill in actual data up to current date
    const sortedRecords = [...individualRecords].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

    uniquePersons.forEach(person => {
      const personData = personTotals.get(person)
      let runningTotal = 0

      // Process each date in chronological order
      dateRange.forEach(date => {
        const dateKey = date.toISOString().split('T')[0]
        const dateObj = new Date(dateKey)

        if (dateObj <= currentDate) {
          // Check if there's a transaction on this specific date
          const dayRecords = sortedRecords.filter(record =>
            record.Qui === person && record.Date === dateKey
          )

          // Add all transactions for this day
          dayRecords.forEach(record => {
            runningTotal += record.Montant
          })

          // Set the cumulative total for this date
          personData.set(dateKey, runningTotal)
        }
      })
    })

    return { personTotals, uniquePersons }
  }, [individualRecords, dateRange])

  // Colors for different people - distinct colors for easy differentiation
  const personColors = useMemo(() => [
    '#1E3A8A', // Dark blue
    '#DC2626', // Red
    '#059669', // Green
    '#D97706', // Orange
    '#7C3AED', // Purple
    '#DB2777', // Pink
    '#0891B2', // Cyan
    '#65A30D', // Lime
    '#C2410C', // Orange-red
    '#9333EA', // Violet
    '#0D9488', // Teal
    '#CA8A04', // Yellow
    '#BE185D', // Rose
    '#0369A1', // Sky blue
    '#166534', // Dark green
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
            label: '',
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
        display: false, // Always hide legend, we'll show names on lines
      },

      datalabels: {
        display: function(context: any) {
          if (!showPerPerson) return false

          // Only show on the very last data point
          const dataIndex = context.dataIndex
          const dataset = context.dataset

          // Find the last non-null data point
          let lastValidIndex = -1
          for (let i = dataset.data.length - 1; i >= 0; i--) {
            if (dataset.data[i] !== null && dataset.data[i] !== undefined) {
              lastValidIndex = i
              break
            }
          }

          return dataIndex === lastValidIndex
        },
        align: 'right' as const,
        anchor: 'center' as const,
        offset: 15,
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: function(context: any) {
          return context.dataset.borderColor
        },
        font: {
          weight: 'bold' as const,
          size: 14
        },
        formatter: function(_value: any, context: any) {
          return context.dataset.label
        }
      } as any,

      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1E3A8A',
        borderWidth: 1,
        displayColors: false, // Remove color squares
        callbacks: {
          title: function(context: any) {
            // Get the actual date from the data index
            const dataIndex = context[0].dataIndex
            const dateKey = dateRange[dataIndex]?.toISOString().split('T')[0]
            return dateKey ? formatDate(dateKey) : formatDate(context[0].label)
          },
          label: function(context: any) {
            if (showPerPerson) {
              // In per-person mode: show "Name: Amount"
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y || 0)}`
            }
            // In total mode: show only the amount
            return formatCurrency(context.parsed.y || 0)
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: function(context: any) {
            const index = context.index
            if (index >= dateRange.length) return 'transparent'

            const date = new Date(dateRange[index])
            const day = date.getDate()
            const month = date.getMonth()
            const year = date.getFullYear()

            // Show vertical grid lines ONLY at the first day of each month (Sept 2025 to June 2026)
            if (day === 1) {
              if ((year === 2025 && month >= 8) || (year === 2026 && month <= 5)) {
                return 'rgba(0, 0, 0, 0.1)' // Same color as horizontal grid lines
              }
            }

            return 'transparent' // Hide all other grid lines
          },
          lineWidth: function(context: any) {
            const index = context.index
            if (index >= dateRange.length) return 0

            const date = new Date(dateRange[index])
            const day = date.getDate()
            const month = date.getMonth()
            const year = date.getFullYear()

            // Show lines only for first day of each month
            if (day === 1) {
              if ((year === 2025 && month >= 8) || (year === 2026 && month <= 5)) {
                return 1
              }
            }

            return 0 // No line width for other days
          },
        },
        ticks: {
          autoSkip: false,
          callback: function(_value: any, index: number) {
            if (index >= dateRange.length) return ''

            const date = new Date(dateRange[index])
            const day = date.getDate()
            const month = date.getMonth()
            const year = date.getFullYear()

            // Calculate middle of month for tick labels (centered in month)
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            const middleDay = Math.ceil(daysInMonth / 2)

            // Show month labels at the middle of each month from Sept 2025 to June 2026
            if (day === middleDay) {
              // September 2025 to December 2025
              if (year === 2025 && month >= 8) {
                return date.toLocaleDateString('fr-FR', {
                  month: 'short',
                })
              }
              // January 2026 to June 2026 (month 5 = June)
              else if (year === 2026 && month <= 5) {
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
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
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
          💵💲 Collecte de la Moulah 💲💵
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          Pour financer nos vacances de juillet 2026 🥥🌴
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Direction Afrique, ou Asie, on verra...
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="text-3xl font-bold text-scouts-blue">
              Richesse actuelle: {formatCurrency(summary.total_funds)}
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
              📈 Groupe
            </button>
            <button
              onClick={() => setShowPerPerson(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showPerPerson
                  ? 'bg-scouts-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👥 Par enfant
            </button>
          </div>
        </div>

        <div className="h-96">
          <Line
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage
