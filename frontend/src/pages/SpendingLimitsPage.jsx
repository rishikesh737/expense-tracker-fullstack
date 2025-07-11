// frontend/src/pages/SpendingLimitsPage.jsx (DARK MODE STYLING)
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import SpendingLimitManager from '../components/SpendingLimits/SpendingLimitManager';

const SpendingLimitsPage = () => {
  const { currentMonthSpending, spendingLimit, isLimitExceeded, refreshData, currentUserEmail } = useOutletContext();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors duration-300"> {/* Added dark mode classes */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Manage Your Spending Limits</h1>
      <SpendingLimitManager 
        currentMonthSpending={currentMonthSpending} 
        spendingLimit={spendingLimit}
        isLimitExceeded={isLimitExceeded}
        refreshData={refreshData}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
};

export default SpendingLimitsPage;
