// frontend/src/components/Layout/Header.jsx (UPDATED TO DISPLAY DISMISSIBLE 80% WARNING ICON)
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ExclamationTriangleIcon, Cog6ToothIcon, SunIcon, MoonIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Import XCircleIcon for dismiss button

const Header = ({ isAuthenticated, onSignOut, isLimitExceeded, currentMonthSpending, spendingLimit, theme, toggleTheme, is80PercentWarningActive, onDismiss80PercentWarning }) => {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  const handleSettingsToggle = () => {
    setIsSettingsMenuOpen(prev => !prev);
  };

  const handleMenuItemClick = () => {
    setIsSettingsMenuOpen(false); // Close menu after clicking an item
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 shadow-xl dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl md:text-3xl font-extrabold rounded-md px-3 py-2 hover:bg-white hover:text-purple-700 transition-colors duration-200 dark:hover:bg-gray-700 dark:hover:text-white">
          Expense Tracker
        </Link>
        <nav>
          {isAuthenticated ? (
            <div className="space-x-4 flex items-center">
              {/* Display Current Monthly Spending and Spending Limit */}
              <div className="text-lg font-semibold mr-4 flex items-center space-x-4">
                <span>
                    Your Spending: <span className="text-yellow-300">₹{currentMonthSpending.toFixed(2)}</span>
                </span>
                {spendingLimit !== null && spendingLimit > 0 && ( // Conditionally display limit if set
                    <span>
                        Limit: <span className="text-green-300">₹{spendingLimit.toFixed(2)}</span>
                    </span>
                )}
              </div>

              {/* 80% Spending Warning Icon (Dismissible) */}
              {is80PercentWarningActive && (
                <div className="relative group flex items-center space-x-1">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-400 animate-pulse" title="Approaching Spending Limit (80% used)!" />
                  <button
                    onClick={onDismiss80PercentWarning}
                    className="p-1 rounded-full text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    title="Dismiss 80% warning"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                  <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 px-2 py-1 bg-orange-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    80% of Limit Used!
                  </span>
                </div>
              )}

              {/* Limit Exceeded Icon (Non-Dismissible) */}
              {isLimitExceeded && ( 
                <div className="relative group">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-500 animate-pulse" title="Spending Limit Exceeded!" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 px-2 py-1 bg-red-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Limit Exceeded!
                  </span>
                </div>
              )}
              
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 ${
                    isActive ? 'bg-purple-600 text-white dark:bg-gray-700' : 'bg-purple-500 hover:bg-purple-600 text-white dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>

              {/* Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={handleSettingsToggle}
                  className="p-2 rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200 dark:hover:bg-gray-700 dark:focus:ring-gray-500"
                  aria-label="Settings"
                >
                  <Cog6ToothIcon className="h-8 w-8 text-white" />
                </button>

                {isSettingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5 focus:outline-none dark:ring-gray-700">
                    <NavLink
                      to="/dashboard/profile-settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleMenuItemClick}
                    >
                      <UserCircleIcon className="h-5 w-5 mr-2" /> Profile
                    </NavLink>
                    
                    {/* Theme Toggle Slider */}
                    <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      <span>Theme:</span>
                      <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          id="theme-toggle"
                          className="sr-only peer"
                          checked={theme === 'dark'}
                          onChange={toggleTheme}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          {theme === 'light' ? <SunIcon className="h-5 w-5 text-yellow-500" /> : <MoonIcon className="h-5 w-5 text-blue-300" />}
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={() => { onSignOut(); handleMenuItemClick(); }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors duration-200 dark:bg-green-700 dark:hover:bg-green-600">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
