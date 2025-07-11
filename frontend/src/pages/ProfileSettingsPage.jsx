// frontend/src/pages/ProfileSettingsPage.jsx (ENHANCED UI)
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // To get currentUserEmail
import { toast } from 'react-toastify';
import { UserIcon, BellIcon, CogIcon } from '@heroicons/react/24/outline'; // Outline icons for forms

const ProfileSettingsPage = () => {
  const { currentUserEmail, refreshData } = useOutletContext(); // Get current user email from context
  const [userName, setUserName] = useState('User Name'); // Placeholder for user's name
  const [notificationEnabled, setNotificationEnabled] = useState(true); // Placeholder for notification preference

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend/Cognito
    toast.success(`Profile updated! Name: ${userName}`);
    // Potentially refresh user data if name was part of it
    // refreshData(); 
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(prev => !prev);
    toast.info(`Notifications ${notificationEnabled ? 'disabled' : 'enabled'}.`);
    // In a real app, update user preferences in backend
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto my-8 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <CogIcon className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
        User Profile Settings
      </h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
        Manage your personal information, notification preferences, and customize your application experience.
      </p>
      
      <div className="space-y-8">
        {/* Profile Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-blue-500" /> Profile Information
          </h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                placeholder="Your Name"
                required
              />
            </div>
            <div>
              <label htmlFor="userEmail" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="userEmail"
                value={currentUserEmail}
                readOnly // Email is usually read-only from Cognito
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 dark:text-gray-400 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:shadow-outline transition-colors duration-200"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-green-500" /> Notification Preferences
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Enable Email Notifications</span>
            <label htmlFor="notification-toggle" className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="notification-toggle"
                className="sr-only peer"
                checked={notificationEnabled}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-green-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Control whether you receive email alerts for spending limit breaches.
          </p>
        </div>

        {/* Dashboard Customization Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <CogIcon className="h-6 w-6 mr-2 text-orange-500" /> Dashboard Customization
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Future enhancement: Arrange widgets, choose display metrics, select default view.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            (More customization options coming soon!)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
