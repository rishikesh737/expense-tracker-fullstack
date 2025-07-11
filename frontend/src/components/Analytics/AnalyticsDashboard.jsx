// frontend/src/components/Analytics/AnalyticsDashboard.jsx (CHART.JS TOOLTIP FIX)
import React, { useMemo, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Needed for Pie chart
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Register ArcElement for Pie chart
);

const AnalyticsDashboard = ({ expenses }) => {
  // State to control which chart is displayed (e.g., 'monthly' or 'category')
  const [chartView, setChartView] = useState('monthly');

  // Memoize aggregated data for monthly spending
  const monthlySpendingData = useMemo(() => {
    const data = {};
    expenses.forEach(expense => {
      const monthYear = expense.date.substring(0, 7); // "YYYY-MM"
      data[monthYear] = (data[monthYear] || 0) + parseFloat(expense.amount); // Ensure amount is parsed
    });

    const sortedMonths = Object.keys(data).sort(); // Sort months chronologically

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Total Spending (INR ₹)',
          data: sortedMonths.map(month => data[month]),
          backgroundColor: 'rgba(75, 192, 192, 0.8)', // Lighter, more vibrant color for light theme
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [expenses]);

  // Memoize aggregated data for spending by category
  const categorySpendingData = useMemo(() => {
    const data = {};
    expenses.forEach(expense => {
      data[expense.category] = (data[expense.category] || 0) + parseFloat(expense.amount); // Ensure amount is parsed
    });

    const labels = Object.keys(data);
    const amounts = Object.values(data);

    // Define a set of appealing colors for the pie chart slices
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCE', '#A8DADC', '#F7CAC9', '#83AF9B'
    ];

    return {
      labels: labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: labels.map((_, i) => backgroundColors[i % backgroundColors.length]),
          hoverOffset: 4,
        },
      ],
    };
  }, [expenses]);

  // Common chart options for responsive behavior
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows charts to resize freely within their container
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#555555', // Dark text for legend on light theme
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = null;

            // Safely get the value for Bar Chart (context.parsed.y)
            if (context.parsed && typeof context.parsed.y === 'number') {
              value = context.parsed.y;
            } 
            // Safely get the value for Pie Chart (context.parsed)
            else if (typeof context.parsed === 'number') {
              value = context.parsed;
            }
            
            if (label) {
              label += ': ';
            }

            if (value !== null) {
              label += `₹${value.toFixed(2)}`; // INR symbol for tooltip
            } else {
              label += 'N/A'; // Fallback for undefined/null values
            }
            return label;
          }
        }
      }
    },
  };

  // Specific options for Bar Chart
  const barChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Monthly Spending Trend (INR ₹)',
        color: '#333333', // Dark text for title
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#555555', // Dark text for x-axis labels
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Lighter grid lines for light theme
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (INR ₹)', // INR symbol for Y-axis title
          color: '#333333', // Dark text for y-axis title
        },
        ticks: {
          color: '#555555', // Dark text for y-axis labels
          callback: function(value) {
            return '₹' + value; // Add rupee symbol to Y-axis ticks
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', // Lighter grid lines for light theme
        },
      },
    },
  };

  // Specific options for Pie Chart
  const pieChartOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Expenses by Category (INR ₹)',
        color: '#333333', // Dark text for title
      },
    },
  };

  const totalSpent = useMemo(() => {
    // Ensure that expense.amount is treated as a number
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  }, [expenses]);

  if (expenses.length === 0) {
    return <p className="text-gray-600">Add expenses to see analytics!</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setChartView('monthly')}
          className={`py-2 px-4 rounded-md font-semibold transition-colors duration-200 ${chartView === 'monthly' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Monthly Trend
        </button>
        <button
          onClick={() => setChartView('category')}
          className={`py-2 px-4 rounded-md font-semibold transition-colors duration-200 ${chartView === 'category' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          By Category
        </button>
      </div>

      <div className="text-center text-3xl font-bold text-gray-800">
        Total Spent: <span className="text-purple-700">₹{totalSpent.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8"> {/* Changed to 1 column for charts to stack better */}
        {/* Adjusted component background and shadow */}
        <div className="p-4 bg-white rounded-lg shadow-xl border border-gray-200">
          {chartView === 'monthly' && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Monthly Spending</h3>
              {monthlySpendingData.labels.length > 0 ? (
                <div className="h-80"> {/* Fixed height for chart container */}
                  <Bar data={monthlySpendingData} options={barChartOptions} />
                </div>
              ) : (
                <p className="text-center text-gray-600">No monthly data available.</p>
              )}
            </>
          )}

          {chartView === 'category' && (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Expenses by Category</h3>
              {categorySpendingData.labels.length > 0 ? (
                <div className="h-80"> {/* Fixed height for chart container */}
                  <Pie data={categorySpendingData} options={pieChartOptions} />
                </div>
              ) : (
                <p className="text-center text-gray-600">No category data available.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;