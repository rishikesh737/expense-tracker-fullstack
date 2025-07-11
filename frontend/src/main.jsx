// frontend/src/main.jsx (CORRECT, SIMPLIFIED VERSION)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Removed Amplify import here as configuration is now in App.jsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Render the app (Amplify configuration will happen in App.jsx)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
  </React.StrictMode>
);