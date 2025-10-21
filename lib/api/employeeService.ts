// lib/api/employeeService.ts
import api from './axios';
import { TimeSheetModel, WebResponseDTOTimeSheet, TimeSheet,LeaveResponseDTO,LeaveRequestDTO,PageLeaveResponseDTO,EmployeeDTO, WebResponseDTO } from './types';

export const employeeService = {
  async registerTimeSheet(timeSheetModel: TimeSheetModel): Promise<TimeSheet> {
    const response = await api.post<WebResponseDTOTimeSheet>('/employee/timesheet/register', timeSheetModel);
    if (response.data.flag) {
      return response.data.response;
    }
    throw new Error(response.data.message || 'Failed to register timesheet');
  },

  // 👇 NEW FUNCTION: Fetch all timesheets for the logged-in employee
  async getEmployeeTimeSheets(): Promise<TimeSheet[]> {
    try {
      const response = await api.get<WebResponseDTOTimeSheet>('/employee/timesheet/all');
      if (response.data.flag) {
        return response.data.response as unknown as TimeSheet[];
      }
      throw new Error(response.data.message || 'Failed to fetch timesheets');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load timesheets');
    }
  },
  async applyLeave(request: LeaveRequestDTO): Promise<LeaveResponseDTO> {
    const response = await api.post('/employee/leaveApply', { request });
    return response.data.response?.data as LeaveResponseDTO;
  },

  // ✅ Update existing leave
  async updateLeave(request: LeaveRequestDTO): Promise<LeaveResponseDTO> {
    const response = await api.put('/employee/update/leave', { request });
    return response.data.response?.data as LeaveResponseDTO;
  },

  // ✅ Approve/Reject leave (manager/admin)
  async updateLeaveStatus(leaveId: string, status: string, comment?: string): Promise<LeaveResponseDTO> {
    const response = await api.put(`/employee/leave/updateStatus/${leaveId}`, null, {
      params: { status, comment },
    });
    return response.data.response?.data as LeaveResponseDTO;
  },

  // ✅ Get leave details by ID
  // async getLeaveById(leaveId: string): Promise<LeaveResponseDTO> {
  //   const response = await api.get(`/employee/view/leave/${leaveId}`);
  //   return response.data.response?.data as LeaveResponseDTO;
  // },
  // async calculateWorkingDays(fromDate: string, toDate: string): Promise<WorkdayResponseDTO> {
  //   try {
  //     const response = await api.get<WebResponseDTOWorkdayResponseDTO>('employee/workDays', {
  //       params: { fromDate, toDate }
  //     });
  //     if (response.data.flag) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to calculate working days');
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Failed to calculate working days');
  //   }
  // },
  // // ✅ Get paginated summary of leaves
  // async getLeaveSummary(query?: {
  //   employeeId?: string;
  //   month?: string;
  //   type?: string;
  //   status?: string;
  //   page?: number;
  //   size?: number;
  //   sort?: string;
  // }): Promise<PageLeaveResponseDTO> {
  //   const response = await api.get('/common/leave-summary', { params: query });
  //   return response.data.response?.data as PageLeaveResponseDTO;
  // },

  // ✅ Delete a leave (only pending)
  async deleteLeave(id: string): Promise<string> {
    const response = await api.delete(`/employee/leave/delete/${id}`);
    return response.data.response?.data;
  },
  // 👇 NEW FUNCTION: Upload attachment
  async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{
      message: string; flag: boolean; response: { url: string } 
}>('/upload/attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (response.data.flag) {
      return response.data.response.url;
    }
    throw new Error(response.data.message || 'Failed to upload attachment');
  },
  async getEmployeeById(empId: string): Promise<EmployeeDTO> {
    const response = await api.get<WebResponseDTO<EmployeeDTO>>(`/admin/emp/${empId}`);
    if (response.data.flag) {
      return response.data.response;
    }
    throw new Error(response.data.message || 'Failed to fetch employee');
  },
};
