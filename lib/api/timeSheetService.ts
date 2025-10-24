// lib/api/timesheetService.ts
import { AxiosError, AxiosResponse, Method } from "axios";
import api from "./axios";
import { TimeSheetModel, TimeSheetResponseDto, WebResponseDTO } from "./types";

type WebResponseDTOList<T> = WebResponseDTO<T[]>;
type WebResponseDTOObject = WebResponseDTO<any>; // For generic object responses

class TimesheetService {
  /**
   * Private helper for mutation operations (create, update, delete, submit).
   * Handles common response normalization and error handling.
   * Supports form-urlencoded for specific methods like update.
   */
  private async _mutation<T = string>(
    url: string,
    method: Method,
    data?: any,
    config?: any,
    isFormData = false,
    successMessage?: string,
    failureMessage?: string
  ): Promise<WebResponseDTO<T>> {
    try {
      const headers: any = {};
      if (isFormData && data && typeof data === 'string') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      const response: AxiosResponse<WebResponseDTO<T>> = await api({
        method,
        url,
        data: isFormData ? data : data,
        ...config,
        headers: { ...config?.headers, ...headers },
      });
      console.log(`🧩 Full ${method.toUpperCase()} API response:`, response.data);
      const { flag, message, status, response: resp, totalRecords, otherInfo } = response.data;
      return {
        flag,
        message: message || (flag ? successMessage || "Operation successful" : failureMessage || "Operation failed"),
        status: status ?? (flag ? 200 : 400),
        response: resp ?? ({} as T),
        totalRecords: totalRecords ?? 0,
        otherInfo: otherInfo ?? null,
      };
    } catch (error: unknown) {
      console.error(`❌ Error in ${method.toUpperCase()} operation:`, error);
      let errorMessage = failureMessage || "Operation failed";
      let errorStatus = 500;
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
        errorStatus = error.response?.status || 500;
      }
      return {
        flag: false,
        message: errorMessage,
        status: errorStatus,
        response: {} as T,
        totalRecords: 0,
        otherInfo: null,
      };
    }
  }

  /**
   * Private helper for query operations (get).
   * Returns the response if successful, throws otherwise.
   */
  private async _query<T>(url: string, config?: any): Promise<WebResponseDTO<T>> {
    try {
      const response: AxiosResponse<WebResponseDTO<T>> = await api.get(url, config);
      console.log(`🧩 Full GET API response:`, response.data);
      if (response.data.flag) {
        return response.data;
      }
      throw new Error(response.data.message || "Failed to fetch data");
    } catch (error: unknown) {
      console.error("❌ Error in GET operation:", error);
      const errorMessage = error instanceof AxiosError
        ? error.response?.data?.message || error.message || "Failed to fetch data"
        : "Failed to fetch data";
      throw new Error(errorMessage);
    }
  }

  /**
   * Register new timesheet(s) (POST with body as array of TimeSheetModel, supports single or multiple).
   */
  async createTimesheets(timesheets: TimeSheetModel | TimeSheetModel[]): Promise<WebResponseDTOObject> {
    const list = Array.isArray(timesheets) ? timesheets : [timesheets];
    const payload = list.map((ts) => ({
      workDate: ts.workDate,
      hoursWorked: Number(ts.hoursWorked),
      taskName: ts.taskName ?? '',
      taskDescription: ts.taskDescription ?? '',
    }));
    console.debug('[TimesheetService] createTimesheets payload:', payload);
    return this._mutation(
      "/employee/timesheet/register",
      "post",
      payload,
      undefined,
      false,
      "Timesheets created successfully",
      "Failed to create timesheets"
    );
  }

  /**
   * Update an existing timesheet (PUT with query param timesheetIds as string and body as array of TimeSheetModel).
   */
  async updateTimesheet(timesheetId: string, timesheet: TimeSheetModel): Promise<WebResponseDTO<string>> {
    if (!timesheetId) {
      return {
        flag: false,
        message: "Timesheet ID is required",
        status: 400,
        response: '',
        totalRecords: 0,
        otherInfo: null,
      };
    }
    const model = {
      ...(timesheet.timesheetId && { timesheetId: timesheet.timesheetId }),
      workDate: timesheet.workDate,
      hoursWorked: Number(timesheet.hoursWorked),
      taskName: timesheet.taskName ?? '',
      taskDescription: timesheet.taskDescription ?? '',
    };
    const payload = [model];
    const params = { timesheetIds: timesheetId };
    console.debug('[TimesheetService] updateTimesheet params:', params, 'payload:', payload);
    return this._mutation(
      "/employee/timesheet/update",
      "put",
      payload,
      { params },
      false,
      "Timesheet updated successfully",
      "Failed to update timesheet"
    );
  }

  /**
   * Delete a timesheet entry by id (DELETE with query param timesheetId).
   */
  async deleteTimesheet(timesheetId: string): Promise<WebResponseDTO<string>> {
    if (!timesheetId) {
      return {
        flag: false,
        message: "Timesheet ID is required",
        status: 400,
        response: '',
        totalRecords: 0,
        otherInfo: null,
      };
    }
    return this._mutation(
      "/employee/timesheet/delete",
      "delete",
      undefined,
      { params: { timesheetId } },
      false,
      "Timesheet deleted successfully",
      "Failed to delete timesheet"
    );
  }

  /**
   * Submit timesheets for manager approval (GET with query param timesheetIds array).
   */
  async submitForApproval(timesheetIds: string[]): Promise<WebResponseDTO<string>> {
    if (!timesheetIds || timesheetIds.length === 0) {
      return {
        flag: false,
        message: "At least one timesheet ID is required",
        status: 400,
        response: '',
        totalRecords: 0,
        otherInfo: null,
      };
    }
    return this._mutation(
      "/employee/timesheet/approvaltomanager",
      "get",
      undefined,
      { params: { timesheetIds } },
      false,
      "Timesheets submitted for approval successfully",
      "Failed to submit timesheets for approval"
    );
  }

  /**
   * Fetch list of timesheets with pagination and filtering (GET with query params).
   */
  async getAllTimesheets(params?: {
    page?: number;
    size?: number;
    direction?: string;
    orderBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WebResponseDTOList<TimeSheetResponseDto>> {
    return this._query<TimeSheetResponseDto[]>("/employee/view/timesheet", { params });
  }

  /**
   * Get a single timesheet by ID (GET with path param).
   */
  async getTimesheetById(timesheetId: string): Promise<WebResponseDTO<TimeSheetResponseDto>> {
    return this._query<TimeSheetResponseDto>(`/employee/view/timesheet/${timesheetId}`);
  }
}

export const timesheetService = new TimesheetService();