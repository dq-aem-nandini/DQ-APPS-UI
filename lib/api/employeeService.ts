// lib/api/employeeService.ts
import api from './axios';
import { TimeSheetModel, WebResponseDTOTimeSheet, TimeSheet } from './types';

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
};
