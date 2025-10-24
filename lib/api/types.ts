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
  | "REPORTING_MANAGER" // Updated to match schema
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
export type HolidayType = 
  | 'PUBLIC'
  | 'RELIGIOUS'
  | 'REGIONAL'
  | 'COMPANY_SPECIFIC';

export type RecurrenceRule =
  | 'ANNUAL'
  | 'ONE_TIME';
export interface AddressModel {
  addressId?: string; // uuid
  houseNo?: string;
  streetName?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string; // Updated to match schema
  addressType?: string;
}

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
  availableLeaves: number; // double, updated to match schema
  requestedLeave: number; // double
  message: string;
  available: boolean;
}

export interface User {
  userId: string; // uuid
  userName: string;
  companyEmail: string;
  password?: string; // Optional, as it's not always included
  role: Role;
  createdAt: string; // date-time
  updatedAt: string; // date-time
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
  refreshExpiresAt?: string; // date-time
  tokenType?: string;
}
 
export interface ApiResponseObject<T = unknown> {
  data: T;
  message: string;
}

export interface WebResponseDTO<T> {
  flag: boolean;
  message: string;
  status: number; // int32
 response: T | null;    // ✅ FIX: allow null for failure cases
  totalRecords: number; // int64
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
// export interface EmployeeModel {
//   firstName: string;
//   lastName: string;
//   personalEmail: string;
//   companyEmail: string;
//   contactNumber: string;
//   alternateContactNumber?: string | null;// Added from schema
//   gender?: string; // Added from schema
//   maritalStatus?: string; // Added from schema
//   numberOfChildren?: number; // Added from schema
//   employeePhotoUrl?: string; // Added from schema
//   clientId: string; // uuid
//   reportingManagerId?: string; // uuid, added from schema
//   designation: Designation;
//   dateOfBirth: string; // date
//   dateOfJoining: string; // date
//   currency: string;
//   rateCard: number;
//   employmentType?: "CONTRACTOR" | "FREELANCER" | "FULLTIME"; // Added from schema
//   panNumber: string;
//   aadharNumber: string;
//   accountNumber: string;
//   accountHolderName: string;
//   bankName: string;
//   ifscCode: string;
//   branchName: string;
//   addresses?: AddressModel[]; // Added from schema
//   panCardUrl: string;
//   aadharCardUrl: string;
//   bankPassbookUrl: string;
//   tenthCftUrl: string;
//   interCftUrl: string;
//   degreeCftUrl: string;
//   postGraduationCftUrl: string;
// }


export interface EmployeeModel {
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  alternateContactNumber: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren: number;
  employeePhotoUrl: string;
  clientId: string; // UUID
  reportingManagerId: string; // UUID
  designation: Designation;
  dateOfBirth: string; // ISO Date (YYYY-MM-DD)
  dateOfJoining: string; // ISO Date (YYYY-MM-DD)
  currency: string;
  rateCard: number;
  employmentType: "CONTRACTOR" | "FREELANCER" | "FULLTIME"; // Added from schema
  panNumber: string;
  aadharNumber: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  addresses: AddressModel[];
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
  tanNumber?: string; // Added from schema
  addresses?: AddressModel[]; // Added from schema
  clientPocs?: ClientPocModel[]; // Added from schema
}

export interface ClientPocModel {
  name: string;
  email: string;
  contactNumber: string;
  designation: string;
}

// BankDetails
export interface BankDetails {
  bankAccountId: string; // uuid
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}
// From schemas/HolidaySchemeModel
export interface HolidaySchemeModel {
  holidayCalendarId?: string; // UUID
  schemeName?: string;
  schemeDescription?: string;
  city?: string;
  state?: string;
  schemeCountryCode?: string;
  activeStatus?: boolean;
}

// From schemas/HolidayCalendarModel
export interface HolidayCalendarModel {
  holidayName?: string;
  calendarDescription?: string;
  holidayDate?: string; // Date format (YYYY-MM-DD)
  locationRegion?: string;
  holidayType?: HolidayType;
  recurrenceRule?: RecurrenceRule;
  calendarCountryCode?: string;
  activeStatus?: boolean;
}

// From schemas/HolidayCalendarDTO (used in responses)
export interface HolidayCalendarDTO {
  holidayCalendarId: string; // uuid
  holidayName: string;
  calendarDescription: string;
  holidayDate: string; // date
  locationRegion: string;
  holidayType: HolidayType;
  recurrenceRule: RecurrenceRule;
  calendarCountryCode: string| null;
  createdByAdminId: string; // uuid
  holidayActive: boolean;
}

// From schemas/NotificationDTO
export interface NotificationDTO {
  id: string; // UUID
  message: string;
  referenceId: string; // UUID
  read: boolean;
  createdAt: string; // Date-time
  updatedAt: string; // Date-time
}
// ClientPoc
export interface ClientPoc {
  pocId: string; // uuid
  client?: Client; // Added from schema
  name: string;
  email: string;
  contactNumber: string;
  designation: string;
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

// Client
export interface Client {
  clientId: string; // uuid
  user: User;
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  tanNumber: string;
  currency: string;
  panNumber: string;
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
  pocs?: ClientPoc[];
}

// Employee
export interface Employee {
  employeeId: string; // UUID
  user?: User; // linked user object
  client?: Client; // linked client object
  companyId?: string;
  bankDetails?: BankDetails; // employee bank info
  reportingManager?: Employee; // recursive reference
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  alternateContactNumber: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren: number;
  dateOfBirth: string; // ISO date
  dateOfJoining: string; // ISO date
  designation:Designation;
  employmentType: "CONTRACTOR" | "FREELANCER" | "FULLTIME"; // e.g., 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  rateCard: number;
  panNumber: string;
  availableLeaves: number;
  aadharNumber: string;
  employeePhotoUrl: string;
  panCardUrl: string;
  aadharCardUrl: string;
  bankPassbookUrl: string;
  tenthCftUrl: string;
  interCftUrl: string;
  degreeCftUrl: string;
  postGraduationCftUrl: string;
  status: string; // e.g., 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// // EmployeeDTO (for list/get)
// export interface EmployeeDTO {
//   employeeId: string; // uuid
//   firstName: string;
//   lastName: string;
//   personalEmail: string;
//   companyEmail: string;
//   contactNumber: string | null; // Consistent with cURL response
//   alternateContactNumber?: string| null;
//   gender: string | undefined;
//   maritalStatus: string | undefined;
//   numberOfChildren: number | undefined;
//   dateOfBirth: string; // date
//   employeePhotoUrl?: string;
//   designation: string;
//   dateOfJoining: string; // date
//   rateCard: number;
//   availableLeaves: number;
//   employmentType?: "CONTRACTOR" | "FREELANCER" | "FULLTIME"; // Added from schema
//   companyId: string | undefined;
//   accountNumber: string | undefined;
//   accountHolderName: string;
//   bankName: string;
//   ifscCode: string;
//   branchName: string;
//   panNumber: string;
//   aadharNumber: string;
//   clientId: string; // uuid
//   clientName: string;
//   reportingManagerId: string; // uuid
//   reportingManagerName: string;
//   panCardUrl?: string;
//   aadharCardUrl?: string;
//   bankPassbookUrl?: string;
//   tenthCftUrl?: string;
//   interCftUrl?: string;
//   degreeCftUrl?: string;
//   postGraduationCftUrl?: string;
//   addresses?:AddressModel[]; // Added from schema
//   status: string;
//   createdAt: string; // date-time
//   updatedAt: string; // date-time
// }
export interface EmployeeDTO {
  employeeId: string; // UUID
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  alternateContactNumber: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren: number;
  dateOfBirth: string; // ISO Date (YYYY-MM-DD)
  employeePhotoUrl: string;
  designation: Designation;
  dateOfJoining: string; // ISO Date (YYYY-MM-DD)
  rateCard: number;
  availableLeaves: number;
  employmentType: "CONTRACTOR" | "FREELANCER" | "FULLTIME"; // Added from schema
  companyId: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  panNumber: string;
  currency: string
  aadharNumber: string;
  clientId: string; // UUID
  clientName: string;
  reportingManagerId: string; // UUID
  reportingManagerName: string;
  panCardUrl: string;
  aadharCardUrl: string;
  bankPassbookUrl: string;
  tenthCftUrl: string;
  interCftUrl: string;
  degreeCftUrl: string;
  postGraduationCftUrl: string;
  addresses: AddressModel[]; // Added from schema
  status: string; // e.g., 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}
// ClientDTO (for list/get)
export interface ClientDTO {
  clientId: string; // uuid
  userId: string; // uuid
  addressId?: string; // uuid, updated to optional
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  currency: string;
  panNumber: string;
  tanNumber?: string; // Added from schema
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
  houseNo?: string; // Made optional to align with schema
  streetName?: string; // Made optional
  city?: string; // Made optional
  state?: string; // Made optional
  pinCode?: string; // Made optional
  country?: string; // Made optional
  addresses?: AddressModel[]; // Added from schema
  pocs?: ClientPoc[]; // Added from schema
}

// RefreshTokenRequestDTO
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

// RefreshTokenResponseDTO
export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string; // date-time
  tokenType: string;
}

// LeaveRequestDTO
export interface LeaveRequestDTO {
  leaveId?: string; // uuid
  categoryType: LeaveCategoryType;
  financialType: FinancialType;
  partialDay?: boolean;
  leaveDuration?: number; // double
  fromDate?: string; // date
  toDate?: string; // date
  context?: string;
  attachmentFile?: string; // binary
}

export interface LeaveResponseDTO {
  leaveId?: string; // uuid
  approverName?: string;
  employeeName?: string;
  fromDate?: string; // date
  toDate?: string; // date
  financialType?: string; // Updated to match schema
  leaveCategoryType?: string; // Updated to match schema
  subject?: string;
  context?: string;
  status?: LeaveStatus; // Updated to use LeaveStatus
  approverComment?: string;
  holidays?: number; // int32
  leaveDuration?: number; // double
  attachmentUrl?: string;
}

export interface LoginInnerResponse {
  data: LoginResponseInner;
  message?: string;
}

// PageableObject
export interface PageableObject {
  paged: boolean;
  unpaged: boolean;
  pageNumber: number; // int32
  pageSize: number; // int32
  offset: number; // int64
  sort?: SortObject;
}

// PageLeaveResponseDTO
export interface PageLeaveResponseDTO {
  totalElements: number; // int64
  totalPages: number; // int32
  first: boolean;
  last: boolean;
  numberOfElements: number; // int32
  pageable: PageableObject;
  size: number; // int32
  content: LeaveResponseDTO[];
  number: number; // int32
  sort?: SortObject;
  empty: boolean;
}

export interface TimeSheetModel {
  timesheetId?: string; // optional, needed for updates
  workDate: string; // date
  hoursWorked: number;
  taskName: string;
  taskDescription: string;
}

// Used when fetching timesheet details (single record returned by some endpoints)
export interface TimeSheet {
  timesheetId: string; // uuid
  workDate: string;
  hoursWorked: number;
  taskName: string;
  taskDescription: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Backend DTO returned by the employee view timesheet list
export interface TimeSheetResponseDto {
  timesheetId: string; // uuid
  clientId: string; // uuid
  clientName: string;
  employeeId: string; // uuid
  employeeName: string;
  workedHours: number;
  workDate: string; // date
  taskName: string;
  taskDescription: string;
  projectName?: string;
  projectStartedAt?: string; // date
  projectEndedAt?: string; // date
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}
export interface EmployeeLeaveDayDTO {
  date: string; // date
  leaveCategory: LeaveCategoryType;
  duration: number; // double
}
// WebResponseDTOTimeSheet
export interface WebResponseDTOTimeSheet {
  flag: boolean;
  message: string;
  status: number; // int32
  response: TimeSheet;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}
// WebResponseDTOHolidayCalendarDTO
export interface WebResponseDTOHolidayCalendarDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: HolidayCalendarDTO;
  totalRecords: number; // int64
 otherInfo?: Record<string, unknown>;
}
// WebResponseDTOListNotificationDTO
export interface WebResponseDTOListNotificationDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: NotificationDTO[]; // array of notification objects
  totalRecords: number; // int64
  otherInfo: any;
}
// WebResponseDTOListTimeSheetResponseDto
export interface WebResponseDTOListTimeSheetResponseDto {
  flag: boolean;
  message: string;
  status: number; // int32
  response: TimeSheetResponseDto[];
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOTimeSheetResponseDto
export interface WebResponseDTOTimeSheetResponseDto {
  flag: boolean;
  message: string;
  status: number; // int32
  response: TimeSheetResponseDto;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOLeaveResponseDTO
export interface WebResponseDTOLeaveResponseDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: LeaveResponseDTO;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOPageLeaveResponseDTO
export interface WebResponseDTOPageLeaveResponseDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: PageLeaveResponseDTO;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOListString
export interface WebResponseDTOListString {
  flag: boolean;
  message: string;
  status: number; // int32
  response: string[];
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOEmployeeDTO
export interface WebResponseDTOEmployeeDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: EmployeeDTO;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOListEmployeeDTO
export interface WebResponseDTOListEmployeeDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: EmployeeDTO[];
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOClientDTO
export interface WebResponseDTOClientDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: ClientDTO;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOListClientDTO
export interface WebResponseDTOListClientDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: ClientDTO[];
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOEmployee
export interface WebResponseDTOEmployee {
  flag: boolean;
  message: string;
  status: number; // int32
  response: Employee;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOClient
export interface WebResponseDTOClient {
  flag: boolean;
  message: string;
  status: number; // int32
  response: Client;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// WebResponseDTOString
export interface WebResponseDTOString {
  flag: boolean;
  message: string;
  status: number; // int32
  response: string;
  totalRecords: number; // int64
  otherInfo: Record<string, any>;
}

// Refresh Inner Response
export interface RefreshInnerResponse {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string; // date-time
  tokenType: string;
  data: any;
}

// PendingLeavesResponseDTO
export interface PendingLeavesResponseDTO {
  leaveId: string; // uuid
  employeeName: string;
  leaveCategoryType: string;
  financialType: string;
  fromDate: string; // date
  toDate: string; // date
  leaveDuration: number; // double
  attachmentUrl: string;
  remainingLeaves: number; // double
  context: string;
  status: string;
}

// WebResponseDTOListPendingLeavesResponseDTO
export interface WebResponseDTOListPendingLeavesResponseDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: PendingLeavesResponseDTO[]; // array of leave dashboard items
  totalRecords: number; // int64
  otherInfo: any;
}
export interface WebResponseDTOListEmployeeLeaveDayDTO {
  flag: boolean;
  message: string;
  status: number; // int32
  response: EmployeeLeaveDayDTO[]; // array of leave day objects
  totalRecords: number; // int64
  otherInfo: any;
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

export interface WebResponseDTOApiResponseObject
  extends WebResponseDTO<ApiResponseObject> {} 
  // Specific type for WebResponseDTOVoid
export interface WebResponseDTOVoid extends WebResponseDTO<null> {}
