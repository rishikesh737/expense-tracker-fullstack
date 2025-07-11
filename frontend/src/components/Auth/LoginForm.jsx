// frontend/src/components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn({ username, password });
      onLogin();
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(`Login failed: ${error.message || 'Please check your credentials.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Changed background to dark neutral, text colors, and adjusted border */}
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
        <h2 className="text-3xl font-bold text-center text-white">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username (Email)
            </label>
            <input
              type="email"
              id="username"
              // Adjusted input field styles for dark theme
              className="mt-1 block w-full px-4 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              // Adjusted input field styles for dark theme
              className="mt-1 block w-full px-4 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign Up
          </Link>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default LoginForm;