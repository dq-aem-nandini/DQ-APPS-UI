// lib/api/types.ts (updated based on backend OpenAPI schema)
export type Role = "ADMIN" | "EMPLOYEE" | "CLIENT" | "MANAGER";

export type Designation =
  | "INTERN"
  | "TRAINEE"
  | "ASSOCIATE_ENGINEER"
  | "SOFTWARE_ENGINEER"
  | "SENIOR_SOFTWARE_ENGINEER"
  | "LEAD_ENGINEER"
  | "TEAM_LEAD"
  | "TECHNICAL_ARCHITECT"
  | "PROJECT_MANAGER"
  | "DELIVERY_MANAGER"
  | "DIRECTOR"
  | "VP_ENGINEERING"
  | "CTO"
  | "HR"
  | "FINANCE"
  | "OPERATIONS";

export type LeaveCategoryType = "SICK" | "CASUAL" | "PLANNED" | "UNPLANNED";
export type FinancialType = "PAID" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
export interface DateRangeRequestDTO {
  fromDate: string; // date
  toDate: string; // date
  partialDay?: boolean;
}

export interface WorkdayResponseDTO {
  totalDays: number; // int32
  holidays: number; // int32
  weekends: number; // int32
  totalHolidays: number; // int32
  leaveDuration: number; // double
}

export interface LeaveAvailabilityDTO {
  availableLeaves: number; // int32
  requestedLeave: number; // double
  message: string;
  available: boolean;
}
export interface User {
  userId: string;
  userName: string;
  companyEmail: string;
  password?: string; // Optional, as it's not always included
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  inputKey: string;
  password: string;
}

export interface LoginDTO {
  inputKey: string;
  password: string;
}

export interface TokenResponseData {
  accessToken?: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
  tokenType?: string;
}

export interface ApiResponseObject<T = any> {
  data: T;
  message: string;
}

export interface WebResponseDTO<T> {
  flag: boolean;
  message: string;
  status: number;
  response: T;
  totalRecords: number;
  otherInfo: any;
}

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthAction =
  | {
      type: "LOGIN_SUCCESS";
      payload: {
        user: User;
        accessToken: string | null;
        refreshToken: string | null;
      };
    }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

// EmployeeModel (for add/update)
export interface EmployeeModel {
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  clientId: string;
  designation: Designation;
  dateOfBirth: string;
  dateOfJoining: string;
  currency: string;
  rateCard: number;
  panNumber: string;
  aadharNumber: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  houseNo: string;
  streetName: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  panCardUrl: string;
  aadharCardUrl: string;
  bankPassbookUrl: string;
  tenthCftUrl: string;
  interCftUrl: string;
  degreeCftUrl: string;
  postGraduationCftUrl: string;
}

// ClientModel (for add/update)
export interface ClientModel {
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  currency: string;
  panNumber: string;
  houseNo: string;
  streetName: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

// BankDetails
export interface BankDetails {
  bankAccountId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt: string;
  updatedAt: string;
}

// ClientPoc
export interface ClientPoc {
  pocId: string;
  name: string;
  email: string;
  contactNumber: string;
  designation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Client
export interface Client {
  clientId: string;
  user: User;
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  tanNumber: string;
  currency: string;
  panNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pocs?: ClientPoc[];
}

// Employee
export interface Employee {
  employeeId: string;
  reportingManager?: Employee; // Recursive reference
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  dateOfBirth: string;
  dateOfJoining: string;
  designation: Designation;
  rateCard: number;
  panNumber: string;
  availableLeaves: number;
  aadharNumber: string;
  panCardUrl?: string;
  aadharCardUrl?: string;
  bankPassbookUrl?: string;
  tenthCftUrl?: string;
  interCftUrl?: string;
  degreeCftUrl?: string;
  postGraduationCftUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// EmployeeDTO (for list/get)
export interface EmployeeDTO {
  employeeId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  dateOfBirth: string;
  designation: Designation;
  dateOfJoining: string;
  currency: string;
  rateCard: number;
  availableLeaves: number;
  panNumber: string;
  aadharNumber: string;
  clientId: string;
  clientName: string;
  panCardUrl?: string;
  aadharCardUrl?: string;
  bankPassbookUrl?: string;
  tenthCftUrl?: string;
  interCftUrl?: string;
  degreeCftUrl?: string;
  postGraduationCftUrl?: string;
  status: string;
}

// ClientDTO (for list/get)
export interface ClientDTO {
  clientId: string;
  userId: string;
  addressId: string;
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  currency: string;
  panNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  houseNo: string;
  streetName: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

// RefreshTokenRequestDTO
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// RefreshTokenResponseDTO
export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  tokenType: string;
}

// LeaveRequestDTO
export interface LeaveRequestDTO {
  leaveId?: string;
  categoryType: LeaveCategoryType;
  financialType: FinancialType;
  partialDay?: boolean;
  leaveDuration?: number; // double
  fromDate?: string; // date
  toDate?: string; // date
  subject?: string;
  context?: string;
  attachmentFile?: string; // binary
}

export interface LeaveResponseDTO {
  leaveId?: string; // uuid
  approverName?: string;
  employeeName?: string;
  fromDate?: string; // date
  toDate?: string; // date
  type?: string;
  subject?: string;
  context?: string;
  status?: string;
  // status: LeaveStatus;
  managerComment?: string;
  holidays?: number; // int32
  leaveDuration?: number; // double
}

// SortObject
export interface SortObject {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

// PageableObject
export interface PageableObject {
  paged: boolean;
  unpaged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort?: SortObject;
}

// PageLeaveResponseDTO
export interface PageLeaveResponseDTO {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: PageableObject;
  size: number;
  content: LeaveResponseDTO[];
  number: number;
  sort?: SortObject;
  empty: boolean;
}

// TimeSheetModel
export interface TimeSheetModel {
  workDate: string; // date
  hoursWorked: number;
  taskName: string;
  taskDescription: string;
  status: string;
}

// TimeSheet
export interface TimeSheet {
  timesheetId: string; // uuid
  employee?: Employee; // Optional for some responses
  workDate: string; // date
  hoursWorked: number;
  taskName: string;
  taskDescription: string;
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

// TimeSheetResponseDto
export interface TimeSheetResponseDto {
  timesheetId: string;
  clientId: string;
  clientName: string;
  employeeId: string;
  employeeName: string;
  workedHours: number;
  workDate: string;
  taskName: string;
  taskDescription: string;
  projectName?: string;
  projectStartedAt?: string;
  projectEndedAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// WebResponseDTOTimeSheet (specific for TimeSheet)
export interface WebResponseDTOTimeSheet {
  flag: boolean;
  message: string;
  status: number; // int32
  response: TimeSheet;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOListTimeSheetResponseDto
export interface WebResponseDTOListTimeSheetResponseDto {
  flag: boolean;
  message: string;
  status: number;
  response: TimeSheetResponseDto[];
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOTimeSheetResponseDto
export interface WebResponseDTOTimeSheetResponseDto {
  flag: boolean;
  message: string;
  status: number;
  response: TimeSheetResponseDto;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOLeaveResponseDTO
export interface WebResponseDTOLeaveResponseDTO {
  flag: boolean;
  message: string;
  status: number;
  response: LeaveResponseDTO;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOPageLeaveResponseDTO
export interface WebResponseDTOPageLeaveResponseDTO {
  flag: boolean;
  message: string;
  status: number;
  response: PageLeaveResponseDTO;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOListString
export interface WebResponseDTOListString {
  flag: boolean;
  message: string;
  status: number;
  response: string[];
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOEmployeeDTO
export interface WebResponseDTOEmployeeDTO {
  flag: boolean;
  message: string;
  status: number;
  response: EmployeeDTO;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOListEmployeeDTO
export interface WebResponseDTOListEmployeeDTO {
  flag: boolean;
  message: string;
  status: number;
  response: EmployeeDTO[];
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOClientDTO
export interface WebResponseDTOClientDTO {
  flag: boolean;
  message: string;
  status: number;
  response: ClientDTO;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOListClientDTO
export interface WebResponseDTOListClientDTO {
  flag: boolean;
  message: string;
  status: number;
  response: ClientDTO[];
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOEmployee
export interface WebResponseDTOEmployee {
  flag: boolean;
  message: string;
  status: number;
  response: Employee;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOClient
export interface WebResponseDTOClient {
  flag: boolean;
  message: string;
  status: number;
  response: Client;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// WebResponseDTOString
export interface WebResponseDTOString {
  flag: boolean;
  message: string;
  status: number;
  response: string;
  totalRecords: number;
  otherInfo: Record<string, any>;
}

// Refresh Inner Response
export interface RefreshInnerResponse {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string; // ISO date string
  tokenType: string;
  data: any;
}
// ManagerLeaveDashboardDTO
export interface ManagerLeaveDashboardDTO {
  leaveId?: string; // uuid
  employeeName?: string;
  leaveType?: string;
  leaveDuration?: number; // double
  reason?: string;
  attachmentUrl?: string;
  remainingLeaves?: number; // int32
  status?: string;
}

// WebResponseDTOListManagerLeaveDashboardDTO
export interface WebResponseDTOListManagerLeaveDashboardDTO {
  flag?: boolean;
  message?: string;
  status?: number; // int32
  response?: ManagerLeaveDashboardDTO[];
  totalRecords?: number; // int64
  otherInfo?: any;
}

// WebResponseDTOMapStringString
export interface WebResponseDTOMapStringString {
  flag?: boolean;
  message?: string;
  status?: number; // int32
  response?: { [key: string]: string };
  totalRecords?: number; // int64
  otherInfo?: any;
}
// Login Inner Response
export interface LoginInnerResponse {
  data: any; // Can replace `any` with a more specific login response if known
  message: string;
}
// WebResponse wrappers (extend base WebResponseDTO<T>)
export interface WebResponseDTOWorkdayResponseDTO
  extends WebResponseDTO<WorkdayResponseDTO> {}

export interface WebResponseDTOLeaveAvailabilityDTO
  extends WebResponseDTO<LeaveAvailabilityDTO> {}