// ```typescript
import api from './axios';
import {
  EmployeeModel,

  WebResponseDTOListEmployeeDTO,
  TimeSheetModel,
  WebResponseDTOTimeSheet,
  WebResponseDTOListTimeSheetResponseDto,
  WebResponseDTOTimeSheetResponseDto,
  WebResponseDTOString,
  Designation,
  WebResponseDTOListString,
  EmployeeDTO,
  WebResponseDTO,
  TimeSheetResponseDto,
  TimeSheet,
} from './types';
import { AxiosResponse, AxiosError } from 'axios';

class EmployeeService {
 
  async updateEmployee(employee: EmployeeModel): Promise<WebResponseDTO<EmployeeDTO>> {
    try {
      const response: AxiosResponse<WebResponseDTO<EmployeeDTO>> = await api.put(
        '/employee/update',
        employee
      );

      console.log('🧩 Full update employee API response:', response.data);

      const { flag, message, status, response: data, totalRecords, otherInfo } = response.data;

      return {
        flag,
        message: message || (flag ? 'Employee updated successfully' : 'Failed to update employee'),
        status: status ?? (flag ? 200 : 400),
        response: data ?? ({} as EmployeeDTO), // ✅ use empty object for non-nullable type
        totalRecords: totalRecords ?? 0,
        otherInfo: otherInfo ?? null,
      };
    } catch (error: unknown) {
      console.error('❌ Error updating employee:', error);

      let errorMessage = 'Failed to update employee';
      let errorStatus = 500;

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to update employee';
        errorStatus = error.response?.status || 500;
      }

      // ✅ return a well-typed fallback response
      return {
        flag: false,
        message: errorMessage,
        status: errorStatus,
        response: {} as EmployeeDTO, // ✅ prevents TS error if response cannot be null
        totalRecords: 0,
        otherInfo: null,
      };
    }
  }
  // /**
  //  * Update timesheet (PUT with body).
  //  */
  // async updateTimeSheet(timesheetId: string, update: TimeSheetModel): Promise<TimeSheetResponseDto> {
  //   try {
  //     const response: AxiosResponse<WebResponseDTOTimeSheetResponseDto> = await api.put(
  //       `/employee/update/timesheet/${timesheetId}`,
  //       update
  //     );
  //     console.log('🧩 Full update timesheet API response:', response.data.response);
  //     if (response.data.flag && response.data.response) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to update timesheet');
  //   } catch (error) {
  //     console.error('❌ Error updating timesheet:', error);
  //     throw new Error(`Failed to update timesheet: ${error}`);
  //   }
  // }
  // /**
  //  * Register a new timesheet (POST with body).
  //  */
  // async registerTimeSheet(timesheet: TimeSheetModel): Promise<TimeSheet> {
  //   try {
  //     const response: AxiosResponse<WebResponseDTOTimeSheet> = await api.post(
  //       '/employee/timesheet/register',
  //       timesheet
  //     );
  //     console.log('🧩 Full register timesheet API response:', response.data.response);
  //     if (response.data.flag && response.data.response) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to register timesheet');
  //   } catch (error) {
  //     console.error('❌ Error registering timesheet:', error);
  //     throw new Error(`Failed to register timesheet: ${error}`);
  //   }
  // }

  /**
   * Get current employee's details (GET no params; for authenticated user).
   */
  async getEmployeeById(): Promise<EmployeeDTO> {
    try {
      const response: AxiosResponse<WebResponseDTO<EmployeeDTO>> = await api.get('/employee/view');
      console.log('🧩 Full get employee by ID API response:', response.data);
      if (response.data.flag && response.data.response) {
        return response.data.response;
      }
      throw new Error(response.data.message || 'Failed to fetch employee');
    } catch (error: unknown) {
      console.error('❌ Error fetching employee by ID:', error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || error.message || 'Failed to fetch employee'
        : 'Failed to fetch employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get employee by ID for admin access (GET with path param).
   */
  // async getEmployeeByIdAdmin(empId: string): Promise<EmployeeDTO> {
  //   try {
  //     const response: AxiosResponse<WebResponseDTO<EmployeeDTO>> = await api.get(`/admin/emp/${empId}`);
  //     console.log('🧩 Full get employee by ID (admin) API response:', response.data.response);
  //     if (response.data.flag && response.data.response) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to fetch employee');
  //   } catch (error) {
  //     console.error('❌ Error fetching employee by ID (admin):', error);
  //     throw new Error(`Failed to fetch employee by ID: ${error}`);
  //   }
  // }

  // /**
  //  * Get timesheet details with pagination and filtering (GET with query params).
  //  */
  // async getTimeSheetDetails(params: {
  //   page?: number;
  //   size?: number;
  //   direction?: string;
  //   orderBy?: string;
  //   startDate?: string;
  //   endDate?: string;
  // }): Promise<TimeSheetResponseDto[]> {
  //   try {
  //     const response: AxiosResponse<WebResponseDTOListTimeSheetResponseDto> = await api.get(
  //       '/employee/view/timesheet',
  //       { params }
  //     );
  //     console.log('🧩 Full get timesheet details API response:', response.data.response);
  //     if (response.data.flag && response.data.response) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to get timesheet details');
  //   } catch (error) {
  //     console.error('❌ Error fetching timesheet details:', error);
  //     throw new Error(`Failed to get timesheet details: ${error}`);
  //   }
  // }

  // /**
  //  * Get timesheet by ID (GET with path param).
  //  */
  // async getTimeSheetById(timesheetId: string): Promise<TimeSheetResponseDto> {
  //   try {
  //     const response: AxiosResponse<WebResponseDTOTimeSheetResponseDto> = await api.get(
  //       `/employee/view/timesheet/${timesheetId}`
  //     );
  //     console.log('🧩 Full get timesheet by ID API response:', response.data.response);
  //     if (response.data.flag && response.data.response) {
  //       return response.data.response;
  //     }
  //     throw new Error(response.data.message || 'Failed to get timesheet by ID');
  //   } catch (error) {
  //     console.error('❌ Error fetching timesheet by ID:', error);
  //     throw new Error(`Failed to get timesheet by ID: ${error}`);
  //   }
  // }

  /**
   * Get employees by designation (GET with path param).
   */
  async getEmployeesByDesignation(designation: Designation): Promise<EmployeeDTO[]> {
    try {
      const response: AxiosResponse<WebResponseDTOListEmployeeDTO> = await api.get(
        `/employee/designation/${designation}`
      );
      console.log('🧩 Full get employees by designation API response:', response.data.response);
      if (response.data.flag && response.data.response) {
        return response.data.response;
      }
      throw new Error(response.data.message || 'Failed to get employees by designation');
    } catch (error) {
      console.error('❌ Error fetching employees by designation:', error);
      throw new Error(`Failed to get employees by designation: ${error}`);
    }
  }

  /**
   * Delete timesheet by ID (DELETE with query param).
   */
  async deleteTimeSheet(timesheetId: string): Promise<string> {
    try {
      const response: AxiosResponse<WebResponseDTOString> = await api.delete(
        '/employee/timesheet/delete',
        { params: { timesheetId } }
      );
      console.log('🧩 Full delete timesheet API response:', response.data.response);
      if (response.data.flag && response.data.response) {
        return response.data.response;
      }
      throw new Error(response.data.message || 'Failed to delete timesheet');
    } catch (error) {
      console.error('❌ Error deleting timesheet:', error);
      throw new Error(`Failed to delete timesheet: ${error}`);
    }
  }

  /**
   * Get designation list (GET no params).
   */
  async getDesignationList(): Promise<string[]> {
    try {
      const response: AxiosResponse<WebResponseDTOListString> = await api.get('/employee/designationList');
      console.log('🧩 Full get designation list API response:', response.data.response);
      if (response.data.flag && response.data.response) {
        return response.data.response;
      }
      throw new Error(response.data.message || 'Failed to get designation list');
    } catch (error) {
      console.error('❌ Error fetching designation list:', error);
      throw new Error(`Failed to get designation list: ${error}`);
    }
  }
  
}

export const employeeService = new EmployeeService();
