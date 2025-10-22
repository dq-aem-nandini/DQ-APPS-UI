import api from './axios';
import { employeeService } from './employeeService';
import {
  LeaveRequestDTO,
  LeaveResponseDTO,
  DateRangeRequestDTO,
  WorkdayResponseDTO,
  LeaveAvailabilityDTO,
  PageLeaveResponseDTO,
  LeaveStatus,
  LeaveCategoryType,
  FinancialType,
  WebResponseDTOLeaveResponseDTO,
  WebResponseDTOPageLeaveResponseDTO,
  WebResponseDTOWorkdayResponseDTO,
  WebResponseDTOLeaveAvailabilityDTO,
  WebResponseDTOString,
  WebResponseDTOListManagerLeaveDashboardDTO,
  ManagerLeaveDashboardDTO,
  WebResponseDTOMapStringString,
  WebResponseDTOListString,
  User,
  EmployeeDTO,
  WebResponseDTOEmployeeDTO,
} from './types';
import { AxiosResponse } from 'axios';

export const leaveService = {
  /**
   * Apply for a new leave (POST multipart/form-data; appends fields from LeaveRequestDTO).
   */
  async applyLeave(request: LeaveRequestDTO, attachment?: File | null): Promise<LeaveResponseDTO> {
    try {
      const formData = new FormData();
      Object.keys(request).forEach((key) => {
        const value = request[key as keyof LeaveRequestDTO];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      if (attachment) {
        formData.append('attachmentFile', attachment); // Optional per spec
      }

      const response: AxiosResponse<WebResponseDTOLeaveResponseDTO> = await api.post(
        '/employee/leaveApply',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('🧩 Full apply leave API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to apply for leave');
    } catch (error) {
      console.error('❌ Error applying for leave:', error);
      throw new Error(`Failed to apply for leave: ${error}`);
    }
  },

  /**
   * Update an existing leave request (PUT multipart/form-data; appends fields from LeaveRequestDTO).
   */
  async updateLeave(request: LeaveRequestDTO, attachment?: File | null): Promise<LeaveResponseDTO> {
    try {
      const formData = new FormData();
      Object.keys(request).forEach((key) => {
        const value = request[key as keyof LeaveRequestDTO];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      if (attachment) {
        formData.append('attachmentFile', attachment); // Optional per spec
      }

      const response: AxiosResponse<WebResponseDTOLeaveResponseDTO> = await api.put(
        '/employee/update/leave',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('🧩 Full update leave API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to update leave');
    } catch (error) {
      console.error('❌ Error updating leave:', error);
      throw new Error(`Failed to update leave: ${error}`);
    }
  },

  /**
   * Update leave status (PUT with path param and query params for status/comment).
   */
  async updateLeaveStatus(leaveId: string, status: LeaveStatus, comment?: string): Promise<LeaveResponseDTO> {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      if (comment) params.append('comment', comment);

      const response: AxiosResponse<WebResponseDTOLeaveResponseDTO> = await api.put(
        `/employee/leave/updateStatus/${leaveId}?${params.toString()}`,
        {}
      );

      console.log('🧩 Full update leave status API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to update leave status');
    } catch (error) {
      console.error('❌ Error updating leave status:', error);
      throw new Error(`Failed to update leave status: ${error}`);
    }
  },

  /**
   * Withdraw a leave request (PUT with query param for ID).
   */
  async withdrawLeave(leaveId: string): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('id', leaveId);

      const response: AxiosResponse<WebResponseDTOString> = await api.put(
        `/employee/leave/withdrawn?${params.toString()}`,
        {}
      );

      console.log('🧩 Full withdraw leave API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to withdraw leave');
    } catch (error) {
      console.error('❌ Error withdrawing leave:', error);
      throw new Error(`Failed to withdraw leave: ${error}`);
    }
  },

  /**
   * Get leave by ID (GET with path param).
   */
  async getLeaveById(leaveId: string): Promise<LeaveResponseDTO> {
    try {
      const response: AxiosResponse<WebResponseDTOLeaveResponseDTO> = await api.get(
        `/employee/view/leave/${leaveId}`
      );

      console.log('🧩 Full get leave by ID API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to fetch leave');
    } catch (error) {
      console.error('❌ Error fetching leave by ID:', error);
      throw new Error(`Failed to fetch leave by ID: ${error}`);
    }
  },

  /**
   * Calculate working days between dates (POST with body).
   */
  async calculateWorkingDays(range: DateRangeRequestDTO): Promise<WorkdayResponseDTO> {
    try {
      const response: AxiosResponse<WebResponseDTOWorkdayResponseDTO> = await api.post(
        '/employee/workDays',
        range
      );

      console.log('🧩 Full calculate working days API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to calculate working days');
    } catch (error) {
      console.error('❌ Error calculating working days:', error);
      throw new Error(`Failed to calculate working days: ${error}`);
    }
  },

  /**
   * Check leave availability (POST with query params).
   */
  async checkLeaveAvailability(employeeId: string, leaveDuration: number): Promise<LeaveAvailabilityDTO> {
    try {
      const params = new URLSearchParams();
      params.append('employeeId', employeeId);
      params.append('leaveDuration', leaveDuration.toString());

      const response: AxiosResponse<WebResponseDTOLeaveAvailabilityDTO> = await api.post(
        `/employee/leave/checkLeaveAvailability?${params.toString()}`,
        {}
      );

      console.log('🧩 Full check leave availability API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to check leave availability');
    } catch (error) {
      console.error('❌ Error checking leave availability:', error);
      throw new Error(`Failed to check leave availability: ${error}`);
    }
  },

  /**
   * Get paginated leave summary (for dashboard; uses filters like employeeId, status, etc.).
   * Returns PageLeaveResponseDTO with content categorized by status if needed.
   */
  async getLeaveSummary(
    employeeId?: string,
    month?: string,
    type?: LeaveCategoryType,
    status?: LeaveStatus,
    financialType?: FinancialType,
    futureApproved?: boolean,
    date?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'fromDate,desc'
  ): Promise<PageLeaveResponseDTO> {
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (month) params.append('month', month);
      if (type) params.append('leaveCategory', type);
      if (status) params.append('status', status);
      if (financialType) params.append('financialType', financialType);
      if (futureApproved !== undefined) params.append('futureApproved', futureApproved.toString());
      if (date) params.append('date', date);
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sort', sort);

      const response: AxiosResponse<WebResponseDTOPageLeaveResponseDTO> = await api.get(
        `/employee/leave-summary?${params.toString()}`
      );

      console.log('🧩 Full leave summary API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      throw new Error(response.data.message || 'Failed to fetch leave summary');
    } catch (error) {
      console.error('❌ Error fetching leave summary:', error);
      throw new Error(`Failed to fetch leave summary: ${error}`);
    }
  },

  /**
   * Get pending leaves for manager dashboard (GET no params).
   */
  async getPendingLeaves(): Promise<ManagerLeaveDashboardDTO[]> {
    try {
      const response: AxiosResponse<WebResponseDTOListManagerLeaveDashboardDTO> = await api.get(
        '/employee/leave/pendingLeaves'
      );

      console.log('🧩 Full pending leaves API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching pending leaves:', error);
      return [];
    }
  },

  /**
   * Get all company holidays (GET no params; returns Map<String, String>).
   */
  async getCompanyHolidays(): Promise<Record<string, string>> {
    try {
      const response: AxiosResponse<WebResponseDTOMapStringString> = await api.get(
        '/employee/company/holidays'
      );

      console.log('🧩 Full company holidays API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      return {};
    } catch (error) {
      console.error('❌ Error fetching company holidays:', error);
      return {};
    }
  },

  /**
   * Get leave types (GET no params; returns list of strings).
   */
  async getLeaveTypes(): Promise<string[]> {
    try {
      const response: AxiosResponse<WebResponseDTOListString> = await api.get(
        '/employee/leaveTypes'
      );

      console.log('🧩 Full leave types API response:', response.data.response);

      if (response.data.flag && response.data.response) {
        return response.data.response;
      }

      return [];
    } catch (error) {
      console.error('❌ Error fetching leave types:', error);
      return [];
    }
  },

  /**
   * Get leave dashboard data (fetches real employee balances + categorized requests; no hardcoded values).
   * Enhanced error handling for invalid employee IDs or backend errors.
   */
  async getLeaveDashboard(user: User): Promise<{
    balances: { availableLeaves: number };
    pendingRequests: LeaveResponseDTO[];
    approvedRequests: LeaveResponseDTO[];
    rejectedRequests: LeaveResponseDTO[];
    withdrawnRequests: LeaveResponseDTO[];
    totalLeavesTaken: number;
    remainingLeaves: number;
    error?: string;
  }> {
    try {
      // Fetch real employee details for availableLeaves
      let availableLeaves = 0;
      try {
        const employeeResponse: EmployeeDTO = await employeeService.getEmployeeById();
        if (employeeResponse) {
          availableLeaves = employeeResponse.availableLeaves || 0;
        } else {
          console.warn('⚠️ Employee response invalid');
        }
      } catch (empError) {
        console.warn('⚠️ Error fetching employee details:', empError);
        availableLeaves = 0; // Default fallback
      }

      // Fetch all requests for the employee; handle if no employee or invalid ID
      let summary: PageLeaveResponseDTO;
      try {
        summary = await this.getLeaveSummary(user.userId);
      } catch (sumError) {
        console.warn('⚠️ Error fetching leave summary, using empty data:', sumError);
        summary = {
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          numberOfElements: 0,
          pageable: {
            paged: true,
            unpaged: false,
            pageNumber: 0,
            pageSize: 10,
            offset: 0,
            sort: { sorted: false, unsorted: true, empty: true },
          },
          size: 10,
          content: [],
          number: 0,
          sort: { sorted: false, unsorted: true, empty: true },
          empty: true,
        };
      }

      // Client-side categorization by status
      const pendingRequests = summary.content.filter((req) => req.status === 'PENDING');
      const approvedRequests = summary.content.filter((req) => req.status === 'APPROVED');
      const rejectedRequests = summary.content.filter((req) => req.status === 'REJECTED');
      const withdrawnRequests = summary.content.filter((req) => req.status === 'WITHDRAWN');

      // Calculate totals from approved requests' leaveDuration
      const totalLeavesTaken = approvedRequests.reduce((sum, req) => sum + (req.leaveDuration ?? 0), 0);
      const remainingLeaves = Math.max(0, availableLeaves - totalLeavesTaken);

      return {
        balances: { availableLeaves },
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        withdrawnRequests,
        totalLeavesTaken,
        remainingLeaves,
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      return {
        balances: { availableLeaves: 0 },
        pendingRequests: [],
        approvedRequests: [],
        rejectedRequests: [],
        withdrawnRequests: [],
        totalLeavesTaken: 0,
        remainingLeaves: 0,
        error: 'Failed to load leave dashboard data. Please try refreshing or contact support if the issue persists.',
      };
    }
  },
};