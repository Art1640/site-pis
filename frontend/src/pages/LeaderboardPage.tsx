import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useSummary } from '../hooks/useData'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const LeaderboardPage: React.FC = () => {
  const { summary, loading, error } = useSummary()

  if (loading) {
    return <LoadingSpinner message="Chargement du classement..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!summary) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

  // Sort contributors by total amount, excluding "Groupe" for podium
  const sortedContributors = Object.entries(summary.person_totals)
    .sort(([, a], [, b]) => b - a)

  // Get top 3 individual contributors (excluding "Groupe")
  const individualContributors = sortedContributors.filter(([name]) => name !== "Groupe")
  const top3Individual = individualContributors.slice(0, 3)

  // Arrange podium in 2-1-3 order (2nd place, 1st place, 3rd place)
  const podiumOrder = top3Individual.length >= 3 ? [
    top3Individual[1], // 2nd place (left)
    top3Individual[0], // 1st place (center)
    top3Individual[2]  // 3rd place (right)
  ] : top3Individual.length === 2 ? [
    null,              // Empty left
    top3Individual[0], // 1st place (center)
    top3Individual[1]  // 2nd place (right)
  ] : top3Individual.length === 1 ? [
    null,              // Empty left
    top3Individual[0], // 1st place (center)
    null               // Empty right
  ] : []

  const chartData = {
    labels: sortedContributors.map(([name]) => name),
    datasets: [
      {
        label: 'Montant collecté (€)',
        data: sortedContributors.map(([, amount]) => amount),
        backgroundColor: sortedContributors.map(([name]) => {
          // Give "Groupe" a neutral color
          if (name === "Groupe") {
            return '#6B7280' // Gray-500 for Groupe
          }

          // Find the rank among individual contributors only
          const individualRank = individualContributors.findIndex(([indivName]) => indivName === name)

          if (individualRank === 0) return '#FFD700' // Gold for 1st individual
          if (individualRank === 1) return '#C0C0C0' // Silver for 2nd individual
          if (individualRank === 2) return '#CD7F32' // Bronze for 3rd individual

          return '#1E3A8A' // Blue for other individuals
        }),
        borderColor: sortedContributors.map(([name]) => {
          // Give "Groupe" a neutral border color
          if (name === "Groupe") {
            return '#4B5563' // Gray-600 for Groupe border
          }

          // Find the rank among individual contributors only
          const individualRank = individualContributors.findIndex(([indivName]) => indivName === name)

          if (individualRank === 0) return '#FFB000' // Gold border for 1st individual
          if (individualRank === 1) return '#A0A0A0' // Silver border for 2nd individual
          if (individualRank === 2) return '#B8691A' // Bronze border for 3rd individual

          return '#1E40AF' // Blue border for other individuals
        }),
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    hover: {
      mode: null as any,
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        anchor: 'center' as const,
        align: 'center' as const,
        formatter: function(value: any) {
          return value.toFixed(2)
        }
      }
    },
    scales: {
      x: {
        display: false, // Hide the x-axis since we show it separately
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 14
          }
        }
      },
    },
  }

  const getPodiumPosition = (index: number) => {
    const positions = ['🥇', '🥈', '🥉']
    return positions[index] || ''
  }

  const getPodiumHeight = (index: number) => {
    const heights = ['h-32', 'h-24', 'h-20']
    return heights[index] || 'h-16'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          Classement des meilleurs ouvriers
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[700px]">
        {/* Podium Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[400px] lg:h-full">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">🏆 Podium individuel</h3>
          <div className="flex-1 flex justify-center items-center min-h-0">
            <div className="flex justify-center items-end space-x-3 md:space-x-6">
              {podiumOrder.map((contributor, index) => {
                if (!contributor) {
                  // Empty slot for missing podium positions
                  return <div key={`empty-${index}`} className="w-20 md:w-28"></div>
                }

                const [name, amount] = contributor
                // Map display index to actual ranking (0=2nd, 1=1st, 2=3rd)
                const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3
                const displayPosition = index === 0 ? 1 : index === 1 ? 0 : 2 // For styling (2nd, 1st, 3rd)

                return (
                  <div key={name} className="text-center">
                    <div className="text-3xl md:text-5xl mb-2 md:mb-4">{getPodiumPosition(displayPosition)}</div>
                    <div className={`bg-gradient-to-t ${
                      actualRank === 1 ? 'from-yellow-400 to-yellow-300' :
                      actualRank === 2 ? 'from-gray-400 to-gray-300' :
                      'from-orange-400 to-orange-300'
                    } ${getPodiumHeight(displayPosition)} w-20 md:w-28 rounded-t-lg flex items-end justify-center pb-2 md:pb-3`}>
                      <div className="text-white font-bold text-sm md:text-lg">{actualRank}</div>
                    </div>
                    <div className="mt-2 md:mt-3 font-semibold text-scouts-blue text-sm md:text-lg">{name}</div>
                    <div className="text-xs md:text-sm text-gray-600">{formatCurrency(amount)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Full Ranking Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[400px] lg:h-full overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">📊 Classement complet</h3>
          <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ scrollBehavior: 'smooth' }}>
            <div className="h-full min-h-[300px] lg:min-h-[500px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
