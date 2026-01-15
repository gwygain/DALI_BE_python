import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { adminAPI } from '../api/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopProductsChart = () => {
  const [period, setPeriod] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchTopProducts();
  }, [period]);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching top products with period:', period);
      const response = await adminAPI.getTopProducts(period, 10);
      console.log('Top products response:', response);
      const result = response.data || response;
      console.log('Top products data:', result);
      setData(result);
    } catch (error) {
      console.error('Error fetching top products:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatPrice = (value) => {
    return `₱${parseFloat(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prepare chart data
  const products = data?.products || [];
  const chartData = {
    labels: products.map(p => p.product_name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: products.map(p => p.quantity_sold),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
          'rgba(216, 180, 254, 0.8)',
          'rgba(79, 70, 229, 0.6)',
          'rgba(99, 102, 241, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(168, 85, 247, 0.6)',
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(168, 85, 247)',
          'rgb(192, 132, 252)',
          'rgb(216, 180, 254)',
          'rgb(79, 70, 229)',
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 40,
      }
    ]
  };

  // Chart options
  const options = {
    indexAxis: 'y',
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
            const product = products[context.dataIndex];
            return [
              `Quantity: ${context.parsed.x} units`,
              `Revenue: ${formatPrice(product.total_revenue || 0)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          precision: 0,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
          color: '#374151',
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.length > 25 ? label.substr(0, 25) + '...' : label;
          }
        },
        grid: {
          display: false,
        }
      }
    },
  };

  return (
    <div>
      {/* Period Toggle */}
      <div className="period-toggle">
        <button
          className={period === 'weekly' ? 'active' : ''}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
        <button
          className={period === 'monthly' ? 'active' : ''}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#6B7280' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            <p>Loading top products...</p>
          </div>
        </div>
      ) : !products || products.length === 0 ? (
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
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p style={{ margin: 0, fontSize: '14px' }}>No sales data for this period</p>
          </div>
        </div>
      ) : (
        <div style={{ height: '300px', position: 'relative' }}>
          <Bar ref={chartRef} data={chartData} options={options} />
        </div>
      )}

      {/* Period Label */}
      {data && !loading && products.length > 0 && (
        <p style={{ 
          textAlign: 'center', 
          fontSize: '13px', 
          color: '#6B7280', 
          marginTop: '12px',
          marginBottom: 0 
        }}>
          {data.period_label}
        </p>
      )}
    </div>
  );
};

export default TopProductsChart;
