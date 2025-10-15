// components/dashboard/TimeSheetRegister.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { employeeService } from '@/lib/api/employeeService';
import { TimeSheetModel } from '@/lib/api/types';

const TimeSheetRegister: React.FC = () => {
  const { state } = useAuth();
  console.log('Auth state:', state);
  const [formData, setFormData] = useState<TimeSheetModel>({
    workDate: '',
    hoursWorked: 0,
    taskName: '',
    taskDescription: '',
    status: 'SUBMITTED',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const timeSheet = await employeeService.registerTimeSheet(formData);
      setSuccess('Time Sheet is created Successfully');
      setFormData({
        workDate: '',
        hoursWorked: 0,
        taskName: '',
        taskDescription: '',
        status: 'SUBMITTED',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register timesheet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hoursWorked' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
      <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Register Timesheet</h2>
            <p className="mt-2 text-sm text-gray-600">
              Submit your timesheet details for {state.user?.userName || 'Employee'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="workDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Date
                </label>
                <input
                  id="workDate"
                  name="workDate"
                  type="date"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                  value={formData.workDate}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="hoursWorked"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Hours Worked
                </label>
                <input
                  id="hoursWorked"
                  name="hoursWorked"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                  placeholder="Enter hours worked"
                  value={formData.hoursWorked}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name
                </label>
                <input
                  id="taskName"
                  name="taskName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                  placeholder="Enter task name"
                  value={formData.taskName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="taskDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Task Description
                </label>
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                  placeholder="Enter task description"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Timesheet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TimeSheetRegister;
