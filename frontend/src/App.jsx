// frontend/src/App.jsx (UPDATED WITH TIME-BASED DISMISSIBLE 80% WARNING LOGIC)
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { generateClient } from 'aws-amplify/api';
import { listExpenses } from './graphql/queries';

// Import your components and pages
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SpendingLimitsPage from './pages/SpendingLimitsPage';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProfileSettingsPage from './pages/ProfileSettingsPage';

const client = generateClient();

const amplifyConfig = {
    "aws_project_region": "us-east-1",
    "aws_appsync_graphqlEndpoint": "https://lym655clqrh6xpved53ekx46r4.appsync-api.us-east-1.amazonaws.com/graphql",
    "aws_appsync_region": "us-east-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "aws_cognito_identity_pool_id": "us-east-1:f83c28cc-17c0-4bdf-bc23-722312cb57b1",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_Vm6bzPPNH",
    "aws_user_pools_web_client_id": "5ig85en85b7h7qt0rbee0lqtec",
    "oauth": {},
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_cloud_logic_custom": [
        {
            "name": "ExpenseTrackerAPI",
            "endpoint": "https://995ttznrma.execute-api.us-east-1.amazonaws.com/dev",
            "region": "us-east-1"
        }
    ]
};

Amplify.configure(amplifyConfig);
console.log('App.jsx: Amplify config at top level:', Amplify.getConfig());

// Define the re-alert duration (e.g., 24 hours)
const RE_ALERT_DURATION_HOURS = 24; // You can change this value

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [spendingLimit, setSpendingLimit] = useState(null);
  const [currentMonthSpending, setCurrentMonthSpending] = useState(0);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // State for 80% warning active status (to show/hide icon)
  const [is80PercentWarningActive, setIs80PercentWarningActive] = useState(false);
  // Ref to track if 80% warning was previously active (for toast logic)
  const prevIs80PercentWarningActiveRef = useRef(false);

  // Refs to track previous values for warning logic
  const prevSpendingRef = useRef(0);
  const prevLimitRef = useRef(null);
  const prevIsLimitExceededRef = useRef(false);

  // Function to get the current month key (YYYY-MM) for localStorage
  const getCurrentMonthKey = () => {
    return new Date().toISOString().substring(0, 7);
  };

  // Function to check if the 80% warning has been dismissed for the current month AND if re-alert duration has passed
  const is80PercentWarningDismissedForCurrentMonth = useCallback(() => {
    const monthKey = getCurrentMonthKey();
    const dismissalRecord = localStorage.getItem(`dismissed80PercentWarning_${monthKey}`);

    if (dismissalRecord) {
      const { timestamp } = JSON.parse(dismissalRecord);
      const now = new Date().getTime();
      const lastDismissedTime = new Date(timestamp).getTime();
      const hoursSinceDismissal = (now - lastDismissedTime) / (1000 * 60 * 60);

      // If enough time has passed since dismissal, it's no longer considered "dismissed" for re-alerting purposes
      if (hoursSinceDismissal >= RE_ALERT_DURATION_HOURS) {
        return false; // Re-alert is allowed
      }
      return true; // Still dismissed
    }
    return false; // Not dismissed at all
  }, []);

  // Function to dismiss the 80% warning for the current month
  const dismiss80PercentWarning = useCallback(() => {
    const monthKey = getCurrentMonthKey();
    localStorage.setItem(`dismissed80PercentWarning_${monthKey}`, JSON.stringify({ timestamp: new Date().toISOString() }));
    setIs80PercentWarningActive(false); // Hide the icon immediately
    toast.info(`80% spending warning dismissed for ${RE_ALERT_DURATION_HOURS} hours.`);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const apiGatewayEndpoint = 'https://995ttznrma.execute-api.us-east-1.amazonaws.com/dev';

  const simpleFetch = async (method, path) => {
    const url = `${apiGatewayEndpoint}${path}`;
    const response = await fetch(url, { method });
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

  const fetchAllData = useCallback(async () => {
    const prevSpending = prevSpendingRef.current;
    const prevLimit = prevLimitRef.current;
    const prevExceeded = prevIsLimitExceededRef.current;
    const was80PercentActive = prevIs80PercentWarningActiveRef.current;

    try {
      if (!Amplify.getConfig().Auth || !Amplify.getConfig().API) {
        console.warn('Amplify not fully configured yet. Skipping data fetch.');
        return false;
      }

      const user = await getCurrentUser();
      if (user && user.signInDetails && user.signInDetails.loginId) {
        setCurrentUserEmail(user.signInDetails.loginId);
      }

      const { data: expensesData } = await client.graphql({ query: listExpenses });
      const fetchedExpenses = expensesData?.listExpenses?.items || [];
      setExpenses(fetchedExpenses);

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      const spending = fetchedExpenses.reduce((sum, exp) => {
        const expenseDate = new Date(exp.date);
        if (isNaN(expenseDate.getTime())) {
            console.warn(`Invalid date format for expense: ${exp.date}`);
            return sum;
        }
        const expenseYear = expenseDate.getFullYear();
        const expenseMonth = expenseDate.getMonth();

        return (expenseYear === currentYear && expenseMonth === currentMonth) ? sum + parseFloat(exp.amount || 0) : sum;
      }, 0);
      setCurrentMonthSpending(spending);

      const limitData = await simpleFetch('GET', '/spendinglimits');
      const fetchedLimit = limitData.limit !== null ? parseFloat(limitData.limit) : null;
      setSpendingLimit(fetchedLimit);

      const currentExceeded = (fetchedLimit !== null && fetchedLimit > 0) && (spending > fetchedLimit);
      setIsLimitExceeded(currentExceeded);

      // --- WARNING LOGIC REFINEMENT ---
      if (fetchedLimit !== null && fetchedLimit > 0) {
        const eightyPercentThreshold = fetchedLimit * 0.8;

        // Determine if 80% warning should be active (and not dismissed for the current re-alert period)
        const shouldBe80PercentActive = (
          spending >= eightyPercentThreshold && 
          spending < fetchedLimit && 
          !is80PercentWarningDismissedForCurrentMonth()
        );
        setIs80PercentWarningActive(shouldBe80PercentActive);

        // Trigger 80% warning toast ONLY if it just became active and wasn't active before
        if (shouldBe80PercentActive && !was80PercentActive) {
          toast.warn(`You've spent over 80% of your limit! Current: ₹${spending.toFixed(2)} / Limit: ₹${fetchedLimit.toFixed(2)}`);
        }
        
        // Logic for exceeding limit toast (only if it just became exceeded)
        if (currentExceeded && !prevExceeded) {
          toast.error(`Warning: Spending limit exceeded! Current: ₹${spending.toFixed(2)} / Limit: ₹${fetchedLimit.toFixed(2)}`);
        }
      } else {
          // If no limit is set or limit is 0, ensure 80% warning is not active
          setIs80PercentWarningActive(false);
      }

      // Update refs for next render cycle
      prevSpendingRef.current = spending;
      prevLimitRef.current = fetchedLimit;
      prevIsLimitExceededRef.current = currentExceeded;
      prevIs80PercentWarningActiveRef.current = is80PercentWarningActive; // Update this ref with the *current* state value

      setIsAuthenticated(true);
      return currentExceeded; // Return true if limit exceeded
    } catch (error) {
      console.error('Error fetching all data:', error);
      setIsAuthenticated(false);
      toast.error(`Failed to load data: ${error.message || 'Please log in.'}`);
      return false;
    }
  }, [is80PercentWarningDismissedForCurrentMonth, is80PercentWarningActive]); // Dependencies for state/functions used in toast logic

  useEffect(() => {
    const initializeAppData = async () => {
      setInitialLoading(true);
      await fetchAllData();
      setInitialLoading(false);
    };

    if (Amplify.getConfig().Auth && Amplify.getConfig().API) {
      initializeAppData();
    } else {
      const interval = setInterval(() => {
        if (Amplify.getConfig().Auth && Amplify.getConfig().API) {
          initializeAppData();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [fetchAllData]);

  // Effect to reset 80% warning dismissal at the start of a new month
  useEffect(() => {
    const checkMonthAndResetWarning = () => {
      const currentMonthKey = getCurrentMonthKey();
      const lastDismissedMonthKey = localStorage.getItem('lastDismissed80PercentMonth');

      if (lastDismissedMonthKey && lastDismissedMonthKey !== currentMonthKey) {
        // New month detected, clear previous dismissal
        localStorage.removeItem(`dismissed80PercentWarning_${lastDismissedMonthKey}`);
        localStorage.removeItem('lastDismissed80PercentMonth'); // Clear this too
        // No need to set is80PercentWarningActive here, fetchAllData will handle it
      }
      // Always update lastDismissed80PercentMonth to current month to track changes
      localStorage.setItem('lastDismissed80PercentMonth', currentMonthKey);
    };

    checkMonthAndResetWarning();
  }, []); // Run only once on mount

  const handleSignOut = async () => {
    console.log('Attempting to sign out...');
    try {
      await signOut();
      setIsAuthenticated(false);
      setExpenses([]);
      setSpendingLimit(null);
      setCurrentMonthSpending(0);
      setIsLimitExceeded(false);
      setCurrentUserEmail('');
      setIs80PercentWarningActive(false); // Reset on sign out
      // Reset refs on sign out
      prevSpendingRef.current = 0;
      prevLimitRef.current = null;
      prevIsLimitExceededRef.current = false;
      prevIs80PercentWarningActiveRef.current = false;
      // Also clear localStorage for 80% warning on sign out
      const monthKey = getCurrentMonthKey();
      localStorage.removeItem(`dismissed80PercentWarning_${monthKey}`);
      localStorage.removeItem('lastDismissed80PercentMonth');
      toast.success('You have been signed out.');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const Layout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Header 
        isAuthenticated={isAuthenticated} 
        onSignOut={handleSignOut} 
        isLimitExceeded={isLimitExceeded}
        currentMonthSpending={currentMonthSpending}
        spendingLimit={spendingLimit}
        theme={theme}
        toggleTheme={toggleTheme}
        is80PercentWarningActive={is80PercentWarningActive} // NEW PROP
        onDismiss80PercentWarning={dismiss80PercentWarning} // NEW PROP
      />
      <main className="flex-grow container mx-auto p-4 text-gray-800 dark:text-gray-200">
        <Outlet context={{ expenses, currentMonthSpending, spendingLimit, isLimitExceeded, refreshData: fetchAllData, currentUserEmail }} />
      </main>
      <Footer />
    </div>
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm onLogin={fetchAllData} />,
        },
        {
          path: "login",
          element: isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm onLogin={fetchAllData} />,
        },
        {
          path: "register",
          element: isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterForm />,
        },
        {
          path: "dashboard",
          element: isAuthenticated ? <Dashboard /> : <Navigate to="/" />,
        },
        {
          path: "dashboard/expenses",
          element: isAuthenticated ? <ExpensesPage /> : <Navigate to="/" />,
        },
        {
          path: "dashboard/analytics",
          element: isAuthenticated ? <AnalyticsPage /> : <Navigate to="/" />,
        },
        {
          path: "dashboard/spending-limits",
          element: isAuthenticated ? <SpendingLimitsPage /> : <Navigate to="/" />,
        },
        {
          path: "dashboard/profile-settings",
          element: isAuthenticated ? <ProfileSettingsPage /> : <Navigate to="/" />,
        },
      ],
    },
  ]);

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700 dark:text-gray-300">Loading app data...</div>;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{ fontSize: '1.2rem', padding: '15px' }}
      />
    </>
  );
}

export default App;
