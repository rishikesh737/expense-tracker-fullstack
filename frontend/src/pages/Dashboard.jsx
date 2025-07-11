// frontend/src/pages/Dashboard.jsx (FIXED AND UPDATED WITH DARK MODE STYLING AND CONTEXT)
import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom'; // Import useOutletContext
import { Wallet, PieChart, Target } from 'lucide-react'; // Import icons

const Dashboard = () => {
  // Get currentUserEmail from the Outlet context provided by App.jsx
  const { currentUserEmail } = useOutletContext();
  const [userName, setUserName] = useState('User'); // Default or derived from email

  useEffect(() => {
    // Extract username from email if available
    if (currentUserEmail) {
      setUserName(currentUserEmail.split('@')[0]);
    } else {
      setUserName('User'); // Fallback if no email
    }
  }, [currentUserEmail]); // Re-run when currentUserEmail changes

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // No loading state needed here as App.jsx handles initial loading and auth
  // The Dashboard component will only render if isAuthenticated is true in App.jsx

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center max-w-5xl mx-auto my-8 transition-colors duration-300">
      <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 dark:text-purple-400 mb-4 animate-fade-in">
        {getGreeting()}, {userName}!
      </h1>
      <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 animate-fade-in-delay">
        Your personal financial hub. How can I help you manage your expenses today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          to="/dashboard/expenses"
          className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-8 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-lg space-y-4
          dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-600 dark:hover:to-blue-800"
        >
          <Wallet size={48} strokeWidth={1.5} />
          <span>Manage Expenses</span>
        </Link>
        <Link
          to="/dashboard/analytics"
          className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-8 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-lg space-y-4
          dark:from-green-700 dark:to-green-900 dark:hover:from-green-600 dark:hover:to-green-800"
        >
          <PieChart size={48} strokeWidth={1.5} />
          <span>View Analytics</span>
        </Link>
        <Link
          to="/dashboard/spending-limits"
          className="bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white font-bold py-8 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center justify-center text-lg space-y-4
          dark:from-yellow-700 dark:to-yellow-900 dark:hover:from-yellow-600 dark:hover:to-yellow-800"
        >
          <Target size={48} strokeWidth={1.5} />
          <span>Set Spending Limits</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
