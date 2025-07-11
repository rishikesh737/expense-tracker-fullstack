// frontend/src/components/SpendingLimits/SpendingLimitManager.jsx (FIXED AND UPDATED WITH DARK MODE STYLING)
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';
// Removed ExclamationCircleIcon as it's no longer used for in-page warning
// import { ExclamationCircleIcon } from '@heroicons/react/24/solid'; // This line is commented out, so it's fine.

// Receive all necessary data and refresh function as props
const SpendingLimitManager = forwardRef(({ currentMonthSpending, spendingLimit, isLimitExceeded, refreshData, currentUserEmail }, ref) => {
  // limit state now initializes from prop, but can be changed by user input
  const [limit, setLimit] = useState(spendingLimit !== null ? spendingLimit : '');
  const [isSettingLimit, setIsSettingLimit] = useState(false);
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  // isAuthenticated, loading, isLimitExceeded are now managed by App.jsx and passed as props

  const apiGatewayEndpoint = 'https://995ttznrma.execute-api.us-east-1.amazonaws.com/dev';

  const simpleFetch = async (method, path, body = null) => {
    const url = `${apiGatewayEndpoint}${path}`;
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || 'API call failed');
      } catch {
        throw new Error(errorText || 'API call failed with unknown error');
      }
    }
    return response.json();
  };

  // Update internal limit state when prop changes (e.g., after initial fetch or setLimit)
  useEffect(() => {
    if (spendingLimit !== null && spendingLimit !== limit) {
      setLimit(spendingLimit);
    }
  }, [spendingLimit]);


  const handleSetLimit = async (e) => {
    e.preventDefault();
    setIsSettingLimit(true);
    if (isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) {
      toast.error("Please enter a valid positive limit amount.");
      setIsSettingLimit(false);
      return;
    }

    try {
      await simpleFetch('POST', '/spendinglimits', {
        action: 'setLimit',
        limitAmount: parseFloat(limit),
        userEmail: currentUserEmail
      });
      toast.success("Spending limit set successfully!");
      await refreshData(); // Trigger data refresh in App.jsx
    } catch (error) {
      console.error('Error setting spending limit:', error);
      toast.error(`Failed to set spending limit: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSettingLimit(false);
    }
  };

  const checkSpendingLimit = async () => {
    setIsCheckingLimit(true);
    try {
      // This POST request now triggers the email sending logic in the Lambda
      const data = await simpleFetch('POST', '/spendinglimits', {
        action: 'checkLimit',
        currentMonthSpending: currentMonthSpending,
        userEmail: currentUserEmail // Passed to Lambda for email sending
      });

      if (data.limitExceeded) {
        toast.warn("Spending limit exceeded! Notification sent (if configured)."); 
      } else {
        toast.info("Spending is within your set limit.");
      }
      await refreshData(); // Trigger data refresh in App.jsx to update global isLimitExceeded state
    } catch (error) {
      console.error('Error checking spending limit:', error);
      toast.error(`Failed to check spending limit: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCheckingLimit(false);
    }
  };

  useImperativeHandle(ref, () => ({
    checkSpendingLimit,
  }));

  // No more internal isAuthenticated or initial fetch logic here, App.jsx handles it
  // The component receives isAuthenticated implicitly via currentUserEmail prop
  // and the loading state is handled by App.jsx before this component renders.

  const isLimitSet = typeof spendingLimit === 'number' && spendingLimit > 0;
  const remaining = isLimitSet ? spendingLimit - currentMonthSpending : null;

  // No loading state check here, App.jsx ensures data is loaded before rendering this page

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-300">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Manage Spending Limits</h2>
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          Current Monthly Spending: <span className="font-bold text-purple-700 dark:text-purple-400">₹{currentMonthSpending.toFixed(2)}</span>
        </p>
        {isLimitSet ? (
          <p className="text-gray-700 dark:text-gray-300">
            Your Limit: <span className="font-bold text-purple-700 dark:text-purple-400">₹{spendingLimit.toFixed(2)}</span>
            <br />
            Remaining: <span className={`font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
              ₹{remaining.toFixed(2)}
            </span>
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No spending limit set yet.</p>
        )}
      </div>

      <form onSubmit={handleSetLimit} className="space-y-4">
        <div>
          <label htmlFor="limit" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Set Monthly Limit (INR ₹)</label>
          <input
            type="number"
            id="limit"
            name="limit"
            value={limit}
            onChange={(e) => setLimit(parseFloat(e.target.value) || '')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            placeholder="e.g., 10000.00"
            step="0.01"
            required
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Notifications will be sent to your registered email: {currentUserEmail}</p>
        
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-green-700 dark:hover:bg-green-600"
          disabled={isSettingLimit || !currentUserEmail} // Use currentUserEmail as proxy for authenticated state
        >
          {isSettingLimit ? 'Setting Limit...' : 'Set Limit'}
        </button>
      </form>

      {isLimitSet && (
        <div className="mt-6">
          <button
            onClick={checkSpendingLimit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-700 dark:hover:bg-blue-600"
            disabled={isCheckingLimit || !currentUserEmail} // Use currentUserEmail as proxy for authenticated state
          >
            {isCheckingLimit ? 'Checking Limit...' : 'Check Spending Limit Now'}
          </button>
        </div>
      )}
    </div>
  );
});

export default SpendingLimitManager;
