import React from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useSummary } from '../hooks/useData'
import { formatCurrency, formatNumber } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useRefresh } from '../contexts/RefreshContext'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const ActivitiesPage: React.FC = () => {
  const { refreshTrigger } = useRefresh()
  const { summary, loading, error } = useSummary(refreshTrigger)

  if (loading) {
    return <LoadingSpinner message="Chargement des activités..." />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!summary) {
    return <ErrorMessage message="Aucune donnée disponible" />
  }

  // Sort types by total amount
  const sortedTypes = Object.entries(summary.type_totals)
    .sort(([, a], [, b]) => b - a)

  const colors = [
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
    '#1E40AF', // Darker Blue
    '#2563EB', // Medium Blue
    '#6366F1', // Indigo
  ]

  const chartData = {
    labels: sortedTypes.map(([type]) => type),
    datasets: [
      {
        data: sortedTypes.map(([, amount]) => amount),
        backgroundColor: colors.slice(0, sortedTypes.length),
        borderColor: colors.slice(0, sortedTypes.length).map(color => color + '80'),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    hover: {
      mode: null as any,
    },
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
        enabled: false
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 12
        },
        formatter: function(value: any) {
          return value.toFixed(2)
        }
      }
    },
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-scouts-blue mb-4">
          Activités veeryy lucratiiives 🤑🤑
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[700px]">
        {/* Pie Chart Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[400px] lg:h-full">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">Pie Chart!</h3>
          <div className="flex-1 flex justify-center items-center">
            <div className="w-full h-full max-h-[300px] md:max-h-[500px]">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Details Table Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 flex flex-col h-[400px] lg:h-full overflow-hidden">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">Détails par type</h3>
          <div className="flex-1 overflow-y-auto overflow-x-auto" style={{ scrollBehavior: 'smooth', maxHeight: '350px' }}>
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-scouts-blue text-white">
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                    Montant total gagné
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                    Nombre d'actis
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTypes.map(([type, amount], index) => {
                  const count = summary.type_counts[type]
                  const percentage = ((amount / summary.total_funds) * 100).toFixed(1)
                  return (
                    <tr key={type} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 md:w-4 md:h-4 rounded-full mr-2 md:mr-3"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <div className="text-xs md:text-sm font-medium text-gray-900">{type}</div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 font-semibold">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                        {formatNumber(count)}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
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
    </div>
  )
}

export default ActivitiesPage
