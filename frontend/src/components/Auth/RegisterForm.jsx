// frontend/src/components/Auth/RegisterForm.jsx
import React, { useState } from 'react';
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify'; // <--- ADD THIS IMPORT
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      console.log("RegisterForm.jsx: Amplify config at handleSignUp:", Amplify.getConfig()); // <--- ADD THIS LINE
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: username,
          },
        },
      });
      setIsSignedUp(true);
      toast.success('Registration successful! Please check your email for a verification code.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignUp({ username, confirmationCode: verificationCode });
      toast.success('Account confirmed! You can now log in.');
      navigate('/login');
    } catch (error) {
      console.error('Error confirming sign up:', error);
      toast.error(`Confirmation failed: ${error.message || 'Please check your code.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await resendSignUpCode({ username });
      toast.info('Verification code re-sent to your email.');
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error(`Failed to resend code: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
        <h2 className="text-3xl font-bold text-center text-white">
          {isSignedUp ? 'Confirm Account' : 'Sign Up'}
        </h2>
        {!isSignedUp ? (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="username"
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
                className="mt-1 block w-full px-4 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="mt-1 block w-full px-4 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmSignUp} className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-300">
                Verification Code (from Email)
              </label>
              <input
                type="text"
                id="verificationCode"
                className="mt-1 block w-full px-4 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Account'}
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-400 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-2"
              disabled={loading}
            >
              Resend Code
            </button>
          </form>
        )}
        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign In
          </Link>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default RegisterForm;