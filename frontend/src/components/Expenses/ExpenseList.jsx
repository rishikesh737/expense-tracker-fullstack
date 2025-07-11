// frontend/src/components/Expenses/ExpenseList.jsx
import React, { useState } from 'react';
import { get, del } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ExpenseList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const fetchExpenses = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      const token = tokens.idToken.jwtToken;

      const apiName = 'ExpenseTrackerAPI';
      let path = '/expenses';
      const queryParams = [];

      if (filterCategory !== 'All') {
        queryParams.push(`category=${filterCategory}`);
      }
      if (filterStartDate) {
        queryParams.push(`startDate=${filterStartDate}`);
      }
      if (filterEndDate) {
        queryParams.push(`endDate=${filterEndDate}`);
      }

      if (queryParams.length > 0) {
        path += `?${queryParams.join('&')}`;
      }

      const restOperation = get(apiName, path, {
        headers: {
          Authorization: token,
        },
      });
      const { body } = await restOperation.response;
      return body.json();
    } catch (err) {
      console.warn("Could not fetch authenticated user or API not configured. This is expected with placeholder aws-exports.js.", err);
      throw new Error("Authentication required or backend not configured for fetching expenses.");
    }
  };

  const { data: expenses, isLoading, isError, error } = useQuery({
    queryKey: ['expenses', filterCategory, filterStartDate, filterEndDate],
    queryFn: fetchExpenses,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error('Error fetching expenses:', err);
      if (!err.message.includes("Authentication required or backend not configured")) {
        toast.error(`Failed to load expenses: ${err.message || 'Unknown error'}`);
      }
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId) => {
      try {
        const { tokens } = await fetchAuthSession();
        const token = tokens.idToken.jwtToken;

        const apiName = 'ExpenseTrackerAPI';
        const path = `/expenses/${expenseId}`;

        const restOperation = del(apiName, path, {
          headers: {
            Authorization: token,
          },
        });
        const { body } = await restOperation.response;
        return body.json();
      } catch (err) {
        console.warn("Could not fetch authenticated user or API not configured. This is expected with placeholder aws-exports.js.", err);
        throw new Error("Authentication required or backend not configured for deleting expense.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Expense deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting expense:', error);
      if (!error.message.includes("Authentication required or backend not configured")) {
        toast.error(`Failed to delete expense: ${error.message || 'Unknown error'}`);
      } else {
        toast.error("Cannot delete expense: Backend not configured or not logged in.");
      }
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses ? expenses.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = expenses ? Math.ceil(expenses.length / itemsPerPage) : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading expenses...</div>;
  }

  if (isError) {
    if (error.message.includes("Authentication required or backend not configured")) {
      return (
        <div className="text-center text-red-400 p-4 bg-red-900 rounded-lg border border-red-700">
          <p className="font-bold">Expense list not available.</p>
          <p className="text-sm">Please ensure you are logged in and AWS backend is configured and deployed.</p>
        </div>
      );
    }
    return <div className="text-center text-red-400">Error: {error.message}</div>;
  }

  const expenseCategories = ['All', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other'];

  return (
    // Adjusted container background and shadow
    <div className="bg-neutral-800 p-6 rounded-lg shadow-xl border border-neutral-700">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-300">Category</label>
          <select
            id="filterCategory"
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            id="filterStartDate"
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white"
            value={filterStartDate}
            onChange={(e) => {
              setFilterStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div>
          <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-300">End Date</label>
          <input
            type="date"
            id="filterEndDate"
            className="mt-1 block w-full px-3 py-2 border border-neutral-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-700 text-white"
            value={filterEndDate}
            onChange={(e) => {
              setFilterEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {expenses && expenses.length === 0 ? (
        <p className="text-center text-gray-400">No expenses found for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-700"> {/* Adjusted divider color */}
            <thead className="bg-neutral-700"> {/* Adjusted header background */}
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700"> {/* Adjusted body background and divider */}
              {currentExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {format(new Date(expense.date), 'MMM d,yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                      disabled={deleteExpenseMutation.isLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-4">
          <ul className="flex items-center -space-x-px h-10 text-base">
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-300 bg-neutral-700 border border-neutral-600 rounded-s-lg hover:bg-neutral-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button
                  onClick={() => paginate(i + 1)}
                  className={`flex items-center justify-center px-4 h-10 leading-tight border border-neutral-600 ${
                    currentPage === i + 1
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                      : 'text-gray-300 bg-neutral-700 hover:bg-neutral-600 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-4 h-10 leading-tight text-gray-300 bg-neutral-700 border border-neutral-600 rounded-e-lg hover:bg-neutral-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ExpenseList;