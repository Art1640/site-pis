import React from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useSummary } from '../hooks/useData'
import { formatCurrency, formatNumber } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

ChartJS.register(ArcElement, Tooltip, Legend)

const ActivitiesPage: React.FC = () => {
  const { summary, loading, error } = useSummary()

  if (loading) {
    return <LoadingSpinner message="Chargement des activités..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!summary) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

  // Sort activities by total amount
  const sortedActivities = Object.entries(summary.activity_totals)
    .sort(([, a], [, b]) => b - a)

  const colors = [
    '#1E3A8A', // Dark Blue
    '#3B82F6', // Blue
    '#1E40AF', // Darker Blue
    '#2563EB', // Medium Blue
    '#1D4ED8', // Blue variant
    '#6366F1', // Indigo
    '#4F46E5', // Indigo variant
    '#7C3AED', // Violet
    '#8B5CF6', // Purple
    '#A855F7', // Purple variant
  ]

  const chartData = {
    labels: sortedActivities.map(([activity]) => activity),
    datasets: [
      {
        data: sortedActivities.map(([, amount]) => amount),
        backgroundColor: colors.slice(0, sortedActivities.length),
        borderColor: colors.slice(0, sortedActivities.length).map(color => color + '80'),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`
          }
        }
      },
    },
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          Répartition des fonds par activité
        </h1>
        <h2 className="text-xl text-gray-600 mb-6">
          Découvrez quelles activités rapportent le plus !
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-center mb-6">📊 Répartition par activité</h3>
        <div className="h-96">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-center mb-6">📋 Détails par activité</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-scouts-blue text-white">
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  Activité
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  Montant total
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  Nombre d'activités
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                  Pourcentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedActivities.map(([activity, amount], index) => {
                const count = summary.activity_counts[activity]
                const percentage = ((amount / summary.total_funds) * 100).toFixed(1)
                return (
                  <tr key={activity} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <div className="text-sm font-medium text-gray-900">{activity}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {percentage}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ActivitiesPage
