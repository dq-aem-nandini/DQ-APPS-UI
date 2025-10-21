// lib/api/leaveService.ts (Updated: Uncommented and fixed getPendingLeaves and getCompanyHolidays; aligned with backend endpoints and types; enhanced error handling)
import api from "./axios";
import { employeeService } from "./employeeService";
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
  User,
  EmployeeDTO,
} from "./types";

export const leaveService = {
  /**
   * Apply for a new leave (POST multipart/form-data; appends fields from LeaveRequestDTO).
   */
  async applyLeave(request: LeaveRequestDTO, attachment?: File | null): Promise<LeaveResponseDTO> {
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

    const response = await api.post<WebResponseDTOLeaveResponseDTO>(
      "/employee/leaveApply",
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    console.log("🧩 Full apply leave API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to apply for leave");
  },

  /**
   * Update an existing leave request (PUT multipart/form-data; appends fields from LeaveRequestDTO).
   */
  async updateLeave(request: LeaveRequestDTO): Promise<LeaveResponseDTO> {
    const formData = new FormData();
    Object.keys(request).forEach((key) => {
      const value = request[key as keyof LeaveRequestDTO];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    const response = await api.put<WebResponseDTOLeaveResponseDTO>(
      "/employee/update/leave",
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    console.log("🧩 Full update leave API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to update leave");
  },

  /**
   * Update leave status (PUT with path param and query params for status/comment).
   */
  async updateLeaveStatus(leaveId: string, status: LeaveStatus, comment?: string): Promise<LeaveResponseDTO> {
    const params = new URLSearchParams();
    params.append("status", status);
    if (comment) params.append("comment", comment);

    const response = await api.put<WebResponseDTOLeaveResponseDTO>(
      `/employee/leave/updateStatus/${leaveId}?${params.toString()}`,
      {}
    );

    console.log("🧩 Full update leave status API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to update leave status");
  },

  /**
   * Withdraw a leave request (PUT with query param for ID).
   */
  async withdrawLeave(leaveId: string): Promise<string> {
    const params = new URLSearchParams();
    params.append("id", leaveId);

    const response = await api.put<WebResponseDTOString>(
      `/employee/leave/withdrawn?${params.toString()}`,
      {}
    );

    console.log("🧩 Full withdraw leave API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to withdraw leave");
  },

  /**
   * Get leave by ID (GET with path param).
   */
  async getLeaveById(leaveId: string): Promise<LeaveResponseDTO> {
    const response = await api.get<WebResponseDTOLeaveResponseDTO>(
      `/employee/view/leave/${leaveId}`
    );

    console.log("🧩 Full get leave by ID API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to fetch leave");
  },

  /**
   * Calculate working days between dates (POST with body).
   */
  async calculateWorkingDays(range: DateRangeRequestDTO): Promise<WorkdayResponseDTO> {
    const response = await api.post<WebResponseDTOWorkdayResponseDTO>(
      "/employee/workDays",
      range
    );

    console.log("🧩 Full calculate working days API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to calculate working days");
  },

  /**
   * Check leave availability (POST with query params).
   */
  async checkLeaveAvailability(employeeId: string, leaveDuration: number): Promise<LeaveAvailabilityDTO> {
    const params = new URLSearchParams();
    params.append("employeeId", employeeId);
    params.append("leaveDuration", leaveDuration.toString());

    const response = await api.post<WebResponseDTOLeaveAvailabilityDTO>(
      `/employee/leave/checkLeaveAvailability?${params.toString()}`,
      {}
    );

    console.log("🧩 Full check leave availability API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to check leave availability");
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
    futureApproved?: boolean,
    date?: string,
    page: number = 0,
    size: number = 10,
    sort: string = "fromDate,desc"
  ): Promise<PageLeaveResponseDTO> {
    const params = new URLSearchParams();
    if (employeeId) params.append("employeeId", employeeId);
    if (month) params.append("month", month);
    if (type) params.append("type", type);
    if (status) params.append("status", status);
    if (futureApproved !== undefined) params.append("futureApproved", futureApproved.toString());
    if (date) params.append("date", date);
    params.append("page", page.toString());
    params.append("size", size.toString());
    params.append("sort", sort);

    const response = await api.get<WebResponseDTOPageLeaveResponseDTO>(
      `/employee/leave-summary?${params.toString()}`
    );

    console.log("🧩 Full leave summary API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    throw new Error(response.data.message || "Failed to fetch leave summary");
  },

  /**
   * Get pending leaves for manager dashboard (GET no params).
   */
  async getPendingLeaves(): Promise<ManagerLeaveDashboardDTO[]> {
    const response = await api.get<WebResponseDTOListManagerLeaveDashboardDTO>(
      `/pending-leaves`
    );

    console.log("🧩 Full pending leaves API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    return [];
  },

  /**
   * Get all company holidays (GET no params; returns Map<String, String>).
   */
  async getCompanyHolidays(): Promise<Record<string, string>> {
    const response = await api.get<WebResponseDTOMapStringString>(
      `/company/holidays`
    );

    console.log("🧩 Full company holidays API response:", response.data.response);

    if (response.data.flag && response.data.response) {
      return response.data.response;
    }

    return {};
  },

  /**
   * Get leave dashboard data (fetches real employee balances + categorized requests; no hardcoded values).
   * Enhanced error handling for invalid employee IDs or backend errors.
   */
  async getLeaveDashboard(user: User): Promise<{
    balances: { availableLeaves: number }; // From fetched EmployeeDTO
    pendingRequests: LeaveResponseDTO[];
    approvedRequests: LeaveResponseDTO[];
    rejectedRequests: LeaveResponseDTO[];
    withdrawnRequests: LeaveResponseDTO[];
    totalLeavesTaken: number;
    remainingLeaves: number;
    error?: string; // Optional error for frontend handling
  }> {
    try {
      // Fetch real employee details for availableLeaves
      let availableLeaves = 0;
      try {
        const employee: EmployeeDTO = await employeeService.getEmployeeById(user.userId);
        availableLeaves = employee.availableLeaves;
      } catch (empError) {
        console.warn("⚠️ Employee not found or error fetching employee details:", empError);
        availableLeaves = 0; // Default fallback
      }

      // Fetch all requests for the employee; handle if no employee or invalid ID
      let summary: PageLeaveResponseDTO;
      try {
        summary = await this.getLeaveSummary(user.userId);
      } catch (sumError) {
        console.warn("⚠️ Error fetching leave summary, using empty data:", sumError);
        summary = {
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          numberOfElements: 0,
          pageable: { paged: true, unpaged: false, pageNumber: 0, pageSize: 10, offset: 0, sort: { sorted: false, unsorted: true, empty: true } },
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
      console.error("❌ Error fetching dashboard data:", error);
      return {
        balances: { availableLeaves: 0 },
        pendingRequests: [],
        approvedRequests: [],
        rejectedRequests: [],
        withdrawnRequests: [],
        totalLeavesTaken: 0,
        remainingLeaves: 0,
        error: "Failed to load leave dashboard data. Please try refreshing or contact support if the issue persists.",
      };
    }
  },
};