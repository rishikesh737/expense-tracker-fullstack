// frontend/src/components/Expenses/ExpenseForm.jsx
import React, { useState } from 'react';
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const queryClient = useQueryClient();

  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense) => {
      try {
        const { tokens } = await fetchAuthSession();
        const token = tokens.idToken.jwtToken;

        const apiName = 'ExpenseTrackerAPI';
        const path = '/expenses';

        const restOperation = post(apiName, path, {
          body: newExpense,
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });
        const { body } = await restOperation.response;
        return body.json();
      } catch (err) {
        console.warn("Could not fetch authenticated user or API not configured. This is expected with placeholder aws-exports.js.", err);
        throw new Error("Authentication required or backend not configured for adding expense.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['analytics']);
      queryClient.invalidateQueries(['spendingLimits']);
      onExpenseAdded();
      toast.success('Expense added successfully!');
      setDescription('');
      setAmount('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setCategory('Food');
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      if (!error.message.includes("Authentication required or backend not configured")) {
        toast.error(`Failed to add expense: ${error.message || 'Unknown error'}`);
      } else {
        toast.error("Cannot add expense: Backend not configured or not logged in.");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || parseFloat(amount) <= 0) {
      toast.warn('Please enter a valid description and amount.');
      return;
    }

    const newExpense = {
      description,
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString().split('T')[0],
    };
    addExpenseMutation.mutate(newExpense);
  };

  return (
    // Adjusted form elements for dark theme
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <input
          type="text"
          id="description"
          className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
          Amount ($)
        </label>
        <input
          type="number"
          id="amount"
          className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white placeholder-gray-400"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0.01"
          step="0.01"
        />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-300">
          Category
        </label>
        <select
          id="category"
          className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-300">
          Date
        </label>
        <input
          type="date"
          id="date"
          className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        disabled={addExpenseMutation.isLoading}
      >
        {addExpenseMutation.isLoading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;