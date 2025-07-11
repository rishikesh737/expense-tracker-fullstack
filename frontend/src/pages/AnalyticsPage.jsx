// frontend/src/pages/AnalyticsPage.jsx (DARK MODE STYLING)
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

const AnalyticsPage = () => {
  const { expenses } = useOutletContext();

  if (!expenses) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 dark:text-gray-300">
        Loading analytics data...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors duration-300"> {/* Added dark mode classes */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Spending Analytics</h1>
      <AnalyticsDashboard expenses={expenses} />
    </div>
  );
};

export default AnalyticsPage;
