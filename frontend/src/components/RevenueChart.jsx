import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data, loading }) => {
  const chartRef = useRef(null);

  // Format currency for tooltips
  const formatPrice = (value) => {
    return `₱${parseFloat(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prepare chart data
  const chartData = {
    labels: data?.map(item => item.month_year) || [],
    datasets: [
      {
        label: 'Revenue',
        data: data?.map(item => item.revenue) || [],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(79, 70, 229)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            return `Revenue: ${formatPrice(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toLocaleString('en-PH');
          },
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
        },
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            style={{ margin: '0 auto 12px', opacity: 0.5 }}
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <p style={{ margin: 0, fontSize: '14px' }}>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default RevenueChart;
