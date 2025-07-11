// frontend/src/pages/ExpensesPage.jsx (DARK MODE STYLING)
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useOutletContext } from 'react-router-dom';

import { createExpense as createExpenseMutation, updateExpense as updateExpenseMutation, deleteExpense as deleteExpenseMutation } from '../graphql/mutations';

const client = generateClient();

const ExpensesPage = () => {
  const { expenses, refreshData } = useOutletContext();

  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Food', date: '' });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingExpenseData, setEditingExpenseData] = useState({}); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (isNaN(parseFloat(newExpense.amount)) || parseFloat(newExpense.amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    try {
      const expenseToCreate = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toISOString().split('T')[0]
      };

      await client.graphql({
        query: createExpenseMutation,
        variables: { input: expenseToCreate },
      });

      toast.success('Expense added successfully!');
      setNewExpense({ description: '', amount: '', category: 'Food', date: '' });
      
      const newIsLimitExceeded = await refreshData(); 

      if (newIsLimitExceeded) {
        toast.error("Warning: Spending limit exceeded!");
      }

    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error(`Failed to add expense: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpenseId(expense.id);
    setEditingExpenseData({ ...expense, amount: parseFloat(expense.amount) });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    if (isNaN(parseFloat(editingExpenseData.amount)) || parseFloat(editingExpenseData.amount) <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }

    try {
      const { description, amount, category, date } = editingExpenseData;
      const input = { id, description, amount: parseFloat(amount), category, date };

      await client.graphql({
        query: updateExpenseMutation,
        variables: { input },
      });

      setEditingExpenseId(null);
      setEditingExpenseData({});
      toast.success('Expense updated successfully!');
      
      const newIsLimitExceeded = await refreshData(); 

      if (newIsLimitExceeded) {
        toast.error("Warning: Spending limit exceeded!");
      }

    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error(`Failed to update expense: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setEditingExpenseData({});
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }
    try {
      await client.graphql({
        query: deleteExpenseMutation,
        variables: { input: { id } },
      });
      toast.success('Expense deleted successfully!');
      await refreshData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(`Failed to delete expense: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* Add New Expense Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Expense</h2>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={newExpense.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              placeholder="e.g., Groceries"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Amount (INR ₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={newExpense.amount}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              placeholder="e.g., 50.00"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Category</label>
            <select
              id="category"
              name="category"
              value={newExpense.category}
              onChange={handleInputChange}
              className="shadow border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="date" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={newExpense.date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-purple-700 dark:hover:bg-purple-600"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Your Expenses List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No expenses found. Add some!</p>
        ) : (
          <ul>
            {(expenses || []).map((expense) => (
              <li key={expense.id} className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                {editingExpenseId === expense.id ? (
                  // Editing mode
                  <div className="flex flex-col w-full space-y-2">
                    <input
                      type="text"
                      name="description"
                      value={editingExpenseData.description || ''}
                      onChange={handleEditInputChange}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                    />
                    <input
                      type="number"
                      name="amount"
                      value={editingExpenseData.amount || ''}
                      onChange={handleEditInputChange}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                      step="0.01"
                    />
                    <select
                      name="category"
                      value={editingExpenseData.category || 'Other'}
                      onChange={handleEditInputChange}
                      className="shadow border rounded w-full py-1 px-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="date"
                      name="date"
                      value={editingExpenseData.date || ''}
                      onChange={handleEditInputChange}
                      className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(expense.id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md dark:bg-green-600 dark:hover:bg-green-500"
                        title="Save"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full shadow-md dark:bg-gray-600 dark:hover:bg-gray-500"
                        title="Cancel"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{expense.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{expense.category} - ₹{parseFloat(expense.amount).toFixed(2)} on {expense.date}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(expense)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md dark:bg-red-600 dark:hover:bg-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
