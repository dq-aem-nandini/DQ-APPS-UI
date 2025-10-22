'use client';

import { useState, useEffect, useCallback } from 'react';
import { leaveService } from '@/lib/api/leaveService';

import { LeaveResponseDTO, PageLeaveResponseDTO, LeaveStatus, LeaveCategoryType, FinancialType, User, LeaveRequestDTO } from '@/lib/api/types';
import { useRouter } from 'next/navigation';

const LeaveHistoryPage = () => {
  const [leaveHistory, setLeaveHistory] = useState<PageLeaveResponseDTO>({
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    pageable: { paged: true, unpaged: false, pageNumber: 0, pageSize: 5, offset: 0, sort: { sorted: true, unsorted: false, empty: false } },
    size: 5,
    content: [],
    number: 0,
    sort: { sorted: true, unsorted: false, empty: false },
    empty: true,
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: LeaveStatus;
    leaveCategory?: LeaveCategoryType;
    financialType?: FinancialType;
    month?: string;
    date?: string;
    futureApproved?: boolean;
  }>({});
  const [pagination, setPagination] = useState<{
    page: number;
    size: number;
    sort: string;
  }>({
    page: 0,
    size: 5,
    sort: 'fromDate,desc',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveResponseDTO | null>(null);
  const [updateForm, setUpdateForm] = useState<Partial<LeaveRequestDTO>>({});
  const [attachment, setAttachment] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeaveRequestDTO, string>>>({});
  const [calculating, setCalculating] = useState(false);

  const router = useRouter();

  // Enum values from ApplyLeavePage
  const categoryTypes: LeaveCategoryType[] = ['SICK', 'CASUAL', 'PLANNED', 'UNPLANNED'];
  const financialTypes: FinancialType[] = ['PAID', 'UNPAID'];

  // Fetch authenticated user
  const fetchUser = useCallback(async () => {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        throw new Error('User not found in localStorage');
      }
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      setError('Please log in to view leave history.');
      router.push('/auth/login');
    }
  }, [router]);

  // Fetch leave history
  const fetchLeaveHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await leaveService.getLeaveSummary(
        user.userId,
        filters.month,
        filters.leaveCategory,
        filters.status,
        filters.financialType,
        filters.futureApproved,
        filters.date,
        pagination.page,
        pagination.size,
        pagination.sort
      );
      setLeaveHistory(response);
    } catch (err) {
      console.error('❌ Error fetching leave history:', err);
      setError('Failed to load leave history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, filters, pagination]);

  // // Fetch total leave history (no filters)
  // const fetchTotalHistory = useCallback(async () => {
  //   if (!user) return;

  //   setLoading(true);
  //   setError(null);
  //   setFilters({});
  //   setPagination((prev) => ({ ...prev, page: 0 }));
  //   try {
  //     const response = await leaveService.getLeaveSummary(
  //       user.userId,
  //       undefined,
  //       undefined,
  //       undefined,
  //       undefined,
  //       undefined,
  //       undefined,
  //       0,
  //       pagination.size,
  //       pagination.sort
  //     );
  //     setLeaveHistory(response);
  //   } catch (err) {
  //     console.error('❌ Error fetching total leave history:', err);
  //     setError('Failed to load total leave history. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [user, pagination.size, pagination.sort]);

  // Open update modal
  const openUpdateModal = (leave: LeaveResponseDTO) => {
    setSelectedLeave(leave);
    setUpdateForm({
      leaveId: leave.leaveId,
      categoryType: leave.leaveCategoryType as LeaveCategoryType | undefined,
      financialType: leave.financialType as FinancialType | undefined,
      partialDay: false,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      subject: leave.subject,
      context: leave.context,
      leaveDuration: leave.leaveDuration,
    });
    setAttachment(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle update form changes
  const handleUpdateFormChange = (key: keyof LeaveRequestDTO, value: string | number | boolean) => {
    setUpdateForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // Auto-calculate leave duration
  useEffect(() => {
    const calculateDuration = async () => {
      if (
        isModalOpen &&
        updateForm.fromDate &&
        updateForm.toDate &&
        !calculating &&
        (updateForm.fromDate !== selectedLeave?.fromDate || updateForm.toDate !== selectedLeave?.toDate)
      ) {
        try {
          setCalculating(true);
          setError(null);
          const range = {
            fromDate: updateForm.fromDate,
            toDate: updateForm.toDate,
            partialDay: updateForm.partialDay || false,
          };
          const response = await leaveService.calculateWorkingDays(range);
          const calculatedDuration = response.leaveDuration || 0;
          setUpdateForm((prev) => ({ ...prev, leaveDuration: calculatedDuration }));
        } catch (err: any) {
          console.error('Failed to calculate duration:', err);
          if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error') || err.message.includes('ERR_CONNECTION_REFUSED')) {
            const from = new Date(updateForm.fromDate);
            const to = new Date(updateForm.toDate);
            let diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const approxWeekends = Math.floor(diffDays / 7) * 2;
            diffDays = Math.max(1, diffDays - approxWeekends);
            const fallbackDuration = updateForm.partialDay ? 0.5 : diffDays;
            setUpdateForm((prev) => ({ ...prev, leaveDuration: fallbackDuration }));
            setError('Using approximate calculation (server temporarily unavailable).');
          } else {
            setError('Failed to calculate leave duration. Please enter manually.');
            setUpdateForm((prev) => ({ ...prev, leaveDuration: 0 }));
          }
        } finally {
          setCalculating(false);
        }
      }
    };

    const timeoutId = setTimeout(calculateDuration, 500);
    return () => clearTimeout(timeoutId);
  }, [updateForm.fromDate, updateForm.toDate, updateForm.partialDay, calculating, isModalOpen, selectedLeave]);

  // Validate update form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LeaveRequestDTO, string>> = {};
    if (!updateForm.categoryType) errors.categoryType = 'Leave category is required';
    if (!updateForm.financialType) errors.financialType = 'Financial type is required';
    if (!updateForm.fromDate) errors.fromDate = 'From date is required';
    if (!updateForm.toDate) errors.toDate = 'To date is required';
    if (!updateForm.subject) errors.subject = 'Subject is required';
    if (!updateForm.context) errors.context = 'Description is required';
    if (!updateForm.leaveDuration || updateForm.leaveDuration <= 0) {
      errors.leaveDuration = 'Duration must be greater than 0';
    }
    if (updateForm.fromDate && updateForm.toDate && new Date(updateForm.fromDate) > new Date(updateForm.toDate)) {
      errors.toDate = 'To date must be after from date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle update leave request
  const handleUpdateLeave = async () => {
    if (!selectedLeave || !updateForm.leaveId) return;

    if (!validateForm()) {
      setError('Please fix the errors in the form.');
      return;
    }

    try {
      const updatedRequest: LeaveRequestDTO = {
        leaveId: updateForm.leaveId,
        categoryType: updateForm.categoryType as LeaveCategoryType,
        financialType: updateForm.financialType as FinancialType,
        partialDay: updateForm.partialDay || false,
        fromDate: updateForm.fromDate!,
        toDate: updateForm.toDate!,
        subject: updateForm.subject!,
        context: updateForm.context!,
        leaveDuration: updateForm.leaveDuration!,
      };
      const response = await leaveService.updateLeave(updatedRequest, attachment);
      console.log('🧩 Leave updated successfully:', response);
      setIsModalOpen(false);
      setSelectedLeave(null);
      setUpdateForm({});
      setAttachment(null);
      setFormErrors({});
      fetchLeaveHistory();
    } catch (err) {
      console.error('❌ Error updating leave:', err);
      setError('Failed to update leave request. Please try again.');
    }
  };

  // Handle withdraw leave request
  const handleWithdrawLeave = async (leaveId: string) => {
    try {
      const response = await leaveService.withdrawLeave(leaveId);
      console.log('🧩 Leave withdrawn successfully:', response);
      fetchLeaveHistory();
    } catch (err) {
      console.error('❌ Error withdrawing leave:', err);
      setError('Failed to withdraw leave request. Please try again.');
    }
  };

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    if (newPage < 0) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Initial fetch for user and leave history
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchLeaveHistory();
    }
  }, [user, fetchLeaveHistory]);

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // Handle sort changes
  const handleSortChange = (newSort: string) => {
    setPagination((prev) => ({
      ...prev,
      sort: newSort.includes(',desc') ? newSort.replace(',desc', ',asc') : newSort.replace(',asc', ',desc'),
      page: 0,
    }));
  };

  // Dynamic label generation from enum value
  const getLabel = (value: string, isCategory: boolean = false): string => {
    const words = value.toLowerCase().split('_');
    const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return isCategory ? `${capitalized} Leave` : capitalized;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leave History</h1>

      {/* Total History Button */}
      {/* <button
        onClick={fetchTotalHistory}
        className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      >
        View Total History
      </button> */}

      {/* Filters */}
      <div className="mb-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as LeaveStatus)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Leave Category</label>
            <select
              value={filters.leaveCategory || ''}
              onChange={(e) => handleFilterChange('leaveCategory', e.target.value as LeaveCategoryType)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="">All</option>
              {categoryTypes.map((type) => (
                <option key={type} value={type}>{getLabel(type, true)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Financial Type</label>
            <select
              value={filters.financialType || ''}
              onChange={(e) => handleFilterChange('financialType', e.target.value as FinancialType)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="">All</option>
              {financialTypes.map((type) => (
                <option key={type} value={type}>{getLabel(type)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Month</label>
            <input
              type="month"
              value={filters.month || ''}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={filters.date || ''}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            />
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-600">Future Approved</label>
            <input
              type="checkbox"
              checked={filters.futureApproved || false}
              onChange={(e) => handleFilterChange('futureApproved', e.target.checked)}
              className="mt-1 ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('leaveId,desc')} className="flex items-center gap-1">
                    Leave ID {pagination.sort.includes('leaveId,desc') ? '↓' : pagination.sort.includes('leaveId,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('employeeName,desc')} className="flex items-center gap-1">
                    Employee {pagination.sort.includes('employeeName,desc') ? '↓' : pagination.sort.includes('employeeName,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('approverName,desc')} className="flex items-center gap-1">
                    Approver {pagination.sort.includes('approverName,desc') ? '↓' : pagination.sort.includes('approverName,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('leaveCategoryType,desc')} className="flex items-center gap-1">
                    Category {pagination.sort.includes('leaveCategoryType,desc') ? '↓' : pagination.sort.includes('leaveCategoryType,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('financialType,desc')} className="flex items-center gap-1">
                    Financial Type {pagination.sort.includes('financialType,desc') ? '↓' : pagination.sort.includes('financialType,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('status,desc')} className="flex items-center gap-1">
                    Status {pagination.sort.includes('status,desc') ? '↓' : pagination.sort.includes('status,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('fromDate,desc')} className="flex items-center gap-1">
                    From Date {pagination.sort.includes('fromDate,desc') ? '↓' : pagination.sort.includes('fromDate,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('toDate,desc')} className="flex items-center gap-1">
                    To Date {pagination.sort.includes('toDate,desc') ? '↓' : pagination.sort.includes('toDate,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('leaveDuration,desc')} className="flex items-center gap-1">
                    Duration {pagination.sort.includes('leaveDuration,desc') ? '↓' : pagination.sort.includes('leaveDuration,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSortChange('holidays,desc')} className="flex items-center gap-1">
                    Holidays {pagination.sort.includes('holidays,desc') ? '↓' : pagination.sort.includes('holidays,asc') ? '↑' : ''}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager Comment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaveHistory.content.length > 0 ? (
                leaveHistory.content.map((leave: LeaveResponseDTO) => (
                  <tr key={leave.leaveId} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.leaveId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.employeeName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.approverName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.leaveCategoryType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.financialType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.fromDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.toDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.leaveDuration}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.holidays || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.subject || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.context || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{leave.managerComment || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {leave.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openUpdateModal(leave)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => leave.leaveId && handleWithdrawLeave(leave.leaveId)}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
                          >
                            Withdraw
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="px-4 py-3 text-center text-sm text-gray-500">
                    No leave history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <button
          disabled={leaveHistory.first}
          onClick={() => handlePageChange(pagination.page - 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition duration-300"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {pagination.page + 1} of {leaveHistory.totalPages}
        </span>
        <button
          disabled={leaveHistory.last}
          onClick={() => handlePageChange(pagination.page + 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition duration-300"
        >
          Next
        </button>
      </div>

      {/* Update Leave Modal */}
      {isModalOpen && selectedLeave && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300">
    <div className="bg-white rounded-lg p-4 w-full max-w-2xl min-h-[350px] overflow-y-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Update Leave Request</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Leave Type</label>
          <select
            value={updateForm.categoryType || ''}
            onChange={(e) => handleUpdateFormChange('categoryType', e.target.value)}
            className={`w-full p-2 border rounded ${formErrors.categoryType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Leave Type</option>
            {categoryTypes.map((type) => (
              <option key={type} value={type}>{getLabel(type, true)}</option>
            ))}
          </select>
          <div className="min-h-[20px]">
            {formErrors.categoryType && <p className="text-red-500 text-xs mt-1">{formErrors.categoryType}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={updateForm.partialDay || false}
            onChange={(e) => handleUpdateFormChange('partialDay', e.target.checked)}
            className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-600">Partial Day</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              value={updateForm.fromDate || ''}
              onChange={(e) => handleUpdateFormChange('fromDate', e.target.value)}
              className={`w-full p-2 border rounded ${formErrors.fromDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="min-h-[20px]">
              {formErrors.fromDate && <p className="text-red-500 text-xs mt-1">{formErrors.fromDate}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              value={updateForm.toDate || ''}
              onChange={(e) => handleUpdateFormChange('toDate', e.target.value)}
              className={`w-full p-2 border rounded ${formErrors.toDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            <div className="min-h-[20px]">
              {formErrors.toDate && <p className="text-red-500 text-xs mt-1">{formErrors.toDate}</p>}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Leave Duration (Days)</label>
          <input
            type="number"
            value={updateForm.leaveDuration !== undefined ? updateForm.leaveDuration : ''}
            onChange={(e) => handleUpdateFormChange('leaveDuration', e.target.value ? parseFloat(e.target.value) : '')}
            min="0.5"
            step="0.5"
            className={`w-full p-2 border rounded ${formErrors.leaveDuration ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Auto-calculated..."
          />
          <div className="min-h-[20px]">
            {formErrors.leaveDuration && <p className="text-red-500 text-xs mt-1">{formErrors.leaveDuration}</p>}
            {calculating && <p className="text-xs text-gray-500 mt-1">Calculating duration...</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Financial Type</label>
          <select
            value={updateForm.financialType || ''}
            onChange={(e) => handleUpdateFormChange('financialType', e.target.value)}
            className={`w-full p-2 border rounded ${formErrors.financialType ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select Financial Type</option>
            {financialTypes.map((type) => (
              <option key={type} value={type}>{getLabel(type)}</option>
            ))}
          </select>
          <div className="min-h-[20px]">
            {formErrors.financialType && <p className="text-red-500 text-xs mt-1">{formErrors.financialType}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
          <input
            type="text"
            value={updateForm.subject || ''}
            onChange={(e) => handleUpdateFormChange('subject', e.target.value)}
            className={`w-full p-2 border rounded ${formErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
          />
          <div className="min-h-[20px]">
            {formErrors.subject && <p className="text-red-500 text-xs mt-1">{formErrors.subject}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <textarea
            value={updateForm.context || ''}
            onChange={(e) => handleUpdateFormChange('context', e.target.value)}
            rows={3}
            className={`w-full p-2 border rounded ${formErrors.context ? 'border-red-500' : 'border-gray-300'}`}
          />
          <div className="min-h-[20px]">
            {formErrors.context && <p className="text-red-500 text-xs mt-1">{formErrors.context}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Attachment (Optional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
            className="w-full p-2 border rounded border-gray-300"
          />
          <div className="min-h-[20px]"></div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateLeave}
          disabled={calculating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-300"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default LeaveHistoryPage;