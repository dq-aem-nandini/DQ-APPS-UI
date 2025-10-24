'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { employeeService } from '@/lib/api/employeeService';
import { LeaveResponseDTO, PageLeaveResponseDTO } from '@/lib/api/types';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

const LeaveList = () => {
  const [leaves, setLeaves] = useState<LeaveResponseDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('');
  const { state } = useAuth();
  const router = useRouter();
  const pageSize = 10;

  const fetchLeaves = async (page: number = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page,
        size: pageSize,
        sort: 'fromDate,desc',
      };
      if (monthFilter) params.month = monthFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response: PageLeaveResponseDTO = await employeeService.getLeaves(params);
      setLeaves(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, typeFilter, statusFilter, monthFilter]);

  const handleDelete = async (leaveId: string) => {
    if (!confirm('Are you sure you want to delete this leave?')) return;
    setDeletingId(leaveId);
    try {
      await employeeService.deleteLeave(leaveId);
      if (currentPage === totalPages - 1 && leaves.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchLeaves(currentPage);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete leave');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setMonthFilter('');
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['EMPLOYEE']}>
        <div className="p-8 text-center">Loading leaves...</div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['EMPLOYEE']}>
        <div className="p-8 text-center text-red-600">{error}</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Leaves</h2>
          <Link
            href="/employee-dashboard/leave/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Apply New Leave
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                id="month"
                type="month"
                value={monthFilter}
                onChange={(e) => handleFilterChange(setMonthFilter, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => handleFilterChange(setTypeFilter, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Types</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="SICK">Sick</option>
                  <option value="CASUAL">Casual</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || monthFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {leaves.length} of {totalElements} leaves
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.leaveId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.fromDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.toDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      leave.type === 'PAID' ? 'bg-green-100 text-green-800' :
                      leave.type === 'SICK' ? 'bg-orange-100 text-orange-800' :
                      leave.type === 'CASUAL' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {leave.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link href={`/employee-dashboard/leave/${leave.leaveId}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                    {leave.status === 'PENDING' && (
                      <>
                        <Link href={`/employee-dashboard/leave/${leave.leaveId}/edit`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                        <button 
                          onClick={() => handleDelete(leave.leaveId)}
                          disabled={deletingId === leave.leaveId}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === leave.leaveId ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No leaves found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow mt-6 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default LeaveList;