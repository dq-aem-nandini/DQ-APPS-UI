'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { leaveService } from '@/lib/api/leaveService';
import { LeaveCategoryType, FinancialType, LeaveRequestDTO, LeaveAvailabilityDTO, LeaveResponseDTO } from '@/lib/api/types';
import { useAuth } from '@/context/AuthContext';

const ApplyLeavePage: React.FC = () => {
  const { state: { user } } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leaveId = searchParams.get('leaveId');
  const [formData, setFormData] = useState<LeaveRequestDTO>({
    leaveId: leaveId || undefined,
    categoryType: 'CASUAL' as LeaveCategoryType,
    financialType: 'PAID' as FinancialType,
    partialDay: false,
    leaveDuration: 0,
    fromDate: '',
    toDate: '',
    context: '',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Enum values from backend schema
  const categoryTypes: LeaveCategoryType[] = ['SICK', 'CASUAL', 'PLANNED', 'UNPLANNED'];
  const financialTypes: FinancialType[] = ['PAID', 'UNPAID'];

  // Fetch leave data for update
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (leaveId && user?.userId) {
        try {
          setLoading(true);
          setError(null);
          const leave = await leaveService.getLeaveById(leaveId);
          setFormData({
            leaveId: leave.leaveId,
            categoryType: leave.leaveCategoryType as LeaveCategoryType,
            financialType: leave.financialType as FinancialType,
            partialDay:false,
            fromDate: leave.fromDate,
            toDate: leave.toDate,
            context: leave.context || '',
            leaveDuration: leave.leaveDuration || 0,
          });
          console.log('🧩 Fetched leave data:', leave);
        } catch (err) {
          console.error('❌ Error fetching leave data:', err);
          setError('Failed to load leave data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeaveData();
  }, [leaveId, user?.userId]);

  // Auto-calculate leave duration when dates or partialDay change
  useEffect(() => {
    const calculateDuration = async () => {
      if (formData.fromDate && formData.toDate && !loading && !calculating) {
        try {
          setCalculating(true);
          setError(null);
          const range = {
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            partialDay: formData.partialDay,
          };
          const response = await leaveService.calculateWorkingDays(range);
          const calculatedDuration = response.leaveDuration || 0;
          setFormData((prev) => ({ ...prev, leaveDuration: calculatedDuration }));

          // Check availability if employeeId is available
          if (user?.userId && calculatedDuration > 0) {
            await checkAvailability(user.userId, calculatedDuration);
          }
        } catch (err: any) {
          console.error('Failed to calculate duration:', err);
          if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error') || err.message.includes('ERR_CONNECTION_REFUSED')) {
            const from = new Date(formData.fromDate);
            const to = new Date(formData.toDate);
            let diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const approxWeekends = Math.floor(diffDays / 7) * 2;
            diffDays = Math.max(1, diffDays - approxWeekends);
            const fallbackDuration = formData.partialDay ? 0.5 : diffDays;
            setFormData((prev) => ({ ...prev, leaveDuration: fallbackDuration }));
            setError('Using approximate calculation (server temporarily unavailable). For precise count, check backend status.');
          } else {
            setError('Failed to calculate leave duration. Please enter manually.');
            setFormData((prev) => ({ ...prev, leaveDuration: 0 }));
          }
        } finally {
          setCalculating(false);
        }
      }
    };

    const timeoutId = setTimeout(calculateDuration, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.fromDate, formData.toDate, formData.partialDay, loading, user?.userId]);

  // Check leave availability after duration calculation
  const checkAvailability = async (employeeId: string, leaveDuration: number) => {
    if (!employeeId || leaveDuration <= 0) return;

    try {
      setCheckingAvailability(true);
      const availability: LeaveAvailabilityDTO = await leaveService.checkLeaveAvailability(employeeId, leaveDuration);
      if (!availability.available) {
        setFormData((prev) => ({ ...prev, financialType: 'UNPAID' as FinancialType }));
        setError(availability.message || 'Insufficient paid leaves available. Switching to unpaid leave.');
      } else {
        setFormData((prev) => ({ ...prev, financialType: 'PAID' as FinancialType }));
        if (error && error.includes('Insufficient')) setError(null);
      }
    } catch (err: any) {
      console.error('Failed to check leave availability:', err);
      if (err.code !== 'ERR_NETWORK') {
        setError('Could not verify leave balance. Proceeding with paid leave.');
      }
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Dynamic label generation from enum value
  const getLabel = (value: string, isCategory: boolean = false): string => {
    const words = value.toLowerCase().split('_');
    const capitalized = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return isCategory ? `${capitalized} Leave` : capitalized;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (name === 'leaveDuration') {
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/unauthorized');
      return;
    }

    if (formData.fromDate && formData.toDate && new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError('From date must be before To date');
      return;
    }

    if (!formData.leaveDuration || formData.leaveDuration <= 0) {
      setError('Leave duration must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (formData.leaveId) {
        // Update existing leave
        await leaveService.updateLeave(formData, attachment);
        setSuccess('Leave updated successfully! Redirecting...');
      } else {
        // Create new leave
        await leaveService.applyLeave(formData, attachment);
        setSuccess('Leave applied successfully! Redirecting...');
      }
      setTimeout(() => router.push('/dashboard/leaves'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process leave request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="flex justify-center items-center h-64"><p className="text-green-600">{success}</p></div>;
  }

  return (
    <div className="apply-leave-page p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{formData.leaveId ? 'Update Leave Request' : 'Apply for New Leave'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Leave Type</label>
          <select
            name="categoryType"
            value={formData.categoryType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Leave Type</option>
            {categoryTypes.map((type) => (
              <option key={type} value={type}>
                {getLabel(type, true)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="partialDay"
            checked={formData.partialDay}
            onChange={handleInputChange}
            className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium">Partial Day</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Leave Duration (Days)</label>
          <input
            type="number"
            name="leaveDuration"
            value={formData.leaveDuration || ''}
            onChange={handleInputChange}
            min="0.5"
            step="0.5"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Auto-calculated..."
            required
            readOnly
          />
          {(calculating || checkingAvailability) && <p className="text-xs text-gray-500 mt-1">Processing...</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Financial Type</label>
          <select
            name="financialType"
            value={formData.financialType}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Financial Type</option>
            {financialTypes.map((type) => (
              <option key={type} value={type}>
                {getLabel(type, false)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="context"
            value={formData.context}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Attachment (Optional, e.g., medical certificate)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || calculating || checkingAvailability}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition duration-300"
        >
          {loading ? 'Processing...' : formData.leaveId ? 'Update Leave' : 'Apply Leave'}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeavePage;
