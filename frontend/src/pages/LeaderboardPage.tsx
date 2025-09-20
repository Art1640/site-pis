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

  // Sort contributors by total amount
  const sortedContributors = Object.entries(summary.person_totals)
    .sort(([, a], [, b]) => b - a)

  const top3 = sortedContributors.slice(0, 3)

  const chartData = {
    labels: sortedContributors.map(([name]) => name),
    datasets: [
      {
        label: 'Montant collecté (€)',
        data: sortedContributors.map(([, amount]) => amount),
        backgroundColor: [
          '#FFD700', // Gold for 1st
          '#C0C0C0', // Silver for 2nd
          '#CD7F32', // Bronze for 3rd
          ...Array(Math.max(0, sortedContributors.length - 3)).fill('#1E3A8A') // Blue for others
        ],
        borderColor: [
          '#FFB000',
          '#A0A0A0',
          '#B8691A',
          ...Array(Math.max(0, sortedContributors.length - 3)).fill('#1E40AF') // Darker blue for others
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1E3A8A',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.x.toFixed(2)} €`
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return `${value} €`
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
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
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          Classement des contributeurs
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          Les meilleurs collecteurs des Pissenlits
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-center mb-6">🏆 Podium</h3>
        <div className="flex justify-center items-end space-x-4 mb-6">
          {top3.map(([name, amount], index) => (
            <div key={name} className="text-center">
              <div className="text-4xl mb-2">{getPodiumPosition(index)}</div>
              <div className={`bg-gradient-to-t ${
                index === 0 ? 'from-yellow-400 to-yellow-300' :
                index === 1 ? 'from-gray-400 to-gray-300' :
                'from-orange-400 to-orange-300'
              } ${getPodiumHeight(index)} w-24 rounded-t-lg flex items-end justify-center pb-2`}>
                <div className="text-white font-bold text-sm">{index + 1}</div>
              </div>
              <div className="mt-2 font-semibold text-scouts-blue">{name}</div>
              <div className="text-sm text-gray-600">{formatCurrency(amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-center mb-6">Classement complet</h3>
        <div className="h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
