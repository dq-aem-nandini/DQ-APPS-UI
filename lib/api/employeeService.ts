// // lib/api/employeeService.ts
// import api from './axios';
// import { TimeSheetModel, WebResponseDTOTimeSheet, TimeSheet } from './types';

// export const employeeService = {
//   async registerTimeSheet(timeSheetModel: TimeSheetModel): Promise<TimeSheet> {
//     const response = await api.post<WebResponseDTOTimeSheet>('/employee/timesheet/register', timeSheetModel);
//     if (response.data.flag) {
//       return response.data.response;
//     }
//     throw new Error(response.data.message || 'Failed to register timesheet');
//   },

//   // 👇 NEW FUNCTION: Fetch all timesheets for the logged-in employee
//   async getEmployeeTimeSheets(): Promise<TimeSheet[]> {
//     try {
//       const response = await api.get<WebResponseDTOTimeSheet>('/employee/timesheet/all');
//       if (response.data.flag) {
//         return response.data.response as unknown as TimeSheet[];
//       }
//       throw new Error(response.data.message || 'Failed to fetch timesheets');
//     } catch (error: any) {
//       throw new Error(error.response?.data?.message || 'Failed to load timesheets');
//     }
//   },
// };


// // lib/api/employeeService.ts
// import api from './axios';
// import { WebResponseDTOTimeSheet, WebResponseDTOListTimesheet, TimeSheetModel } from "./types";


// export const employeeService = {
//   /** 🔹 Register or update a timesheet entry */
//   async registerTimeSheet(data: TimeSheetModel): Promise<WebResponseDTOTimeSheet> {
//     const response = await api.post<WebResponseDTOTimeSheet>(
//       '/web/api/v1/employee/timesheet/register',
//       data
//     );
//     return response.data;
//   },

//   /** 🔹 Fetch all timesheets for a given employee */
//   async viewTimeSheet(employeeId?: string): Promise<WebResponseDTOListTimesheet> {
//     const response = await api.get<WebResponseDTOListTimesheet>(
//       '/web/api/v1/employee/view/timesheet',
//       {
//         params: { employeeId },
//       }
//     );
//     return response.data;
//   },
// };



import api from './axios';
import { TimeSheetModel, TimeSheetResponse, TimeSheetResponseDto, WebResponseDTOListTimesheet } from './types';

export const employeeService = {
  // Fetch list of timesheets for the current logged-in employee between startDate and endDate
  viewTimeSheet: async (startDate?: string, endDate?: string): Promise<TimeSheetResponse[]> => {
    const res = await api.get<WebResponseDTOListTimesheet>('/employee/view/timesheet', {
      params: { startDate, endDate },
    });

    const list: TimeSheetResponseDto[] = res.data?.response || [];

    // Map backend TimeSheetResponseDto => frontend TimeSheetResponse
    return list.map((item: TimeSheetResponseDto) => ({
      timesheetId: item.timesheetId ?? '',
      workDate: item.workDate ?? '',
      hoursWorked: item.workedHours ?? 0,
      taskName: item.taskName ?? '',
      taskDescription: item.taskDescription ?? '',
      status: item.status ?? 'Draft',
    }));
  },

  // Register a new timesheet
  registerTimeSheet: async (timeSheet: TimeSheetModel) => {
    const payload = {
      workDate: timeSheet.workDate,
      // include both names in case backend expects 'workedHours' instead of 'hoursWorked'
      hoursWorked: Number(timeSheet.hoursWorked),
      workedHours: Number(timeSheet.hoursWorked),
      taskName: timeSheet.taskName ?? '',
      taskDescription: timeSheet.taskDescription ?? '',
      status: timeSheet.status ?? '',
      timesheetId: timeSheet.timesheetId ?? undefined,
    };
    console.debug('[employeeService] registerTimeSheet payload:', payload);
    const res = await api.post('/employee/timesheet/register', payload);
    return res.data;
  },

  // Update an existing timesheet (backend expects timesheetId in body or uses token to identify)
  updateTimeSheet: async (timeSheet: TimeSheetModel) => {
    const payload = {
      // include timesheetId in body (some backends expect it here)
      timesheetId: timeSheet.timesheetId ?? undefined,
      workDate: timeSheet.workDate,
      // send both field names just in case backend expects 'workedHours' or 'hoursWorked'
      hoursWorked: Number(timeSheet.hoursWorked),
      workedHours: Number(timeSheet.hoursWorked),
      taskName: timeSheet.taskName ?? '',
      taskDescription: timeSheet.taskDescription ?? '',
      status: timeSheet.status ?? '',
    };
    console.debug('[employeeService] updateTimeSheet payload:', payload, 'timesheetIdParam:', timeSheet.timesheetId);

    // Send timesheetId both as query param (required by some endpoints) and in body for clarity
    const res = await api.put('/employee/timesheet/update', payload, {
      params: { timesheetId: timeSheet.timesheetId },
    });
    return res.data;
  },
};
