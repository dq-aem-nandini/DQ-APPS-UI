// src/api/types.ts
export interface LoginDTO {
  inputKey: string;
  password: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: string;
  tokenType: string;
}

export interface ApiResponseObject<T = any> {
  data: T;
  message: string;
}
export interface WebResponseDTOApiResponseObject {
  flag: boolean;
  message: string;
  status: number;
  response: ApiResponseObject;
  totalRecords?: number;
  otherInfo?: any;
}
export interface WebResponseDTO<T> {
  flag: boolean;
  message: string;
  status: number;
  response: T;
  totalRecords: number;
  otherInfo?: any;
}

export interface EmployeeModel {
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  clientId: string; // UUID
  designation: string;
  dateOfBirth: string; // date
  dateOfJoining: string; // date
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
  panCardUrl?: string;
  aadharCardUrl?: string;
  bankPassbookUrl?: string;
  tenthCftUrl?: string;
  interCftUrl?: string;
  degreeCftUrl?: string;
  postGraduationCftUrl?: string;
}

export interface User {
  userId: string; // UUID
  userName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

export interface Address {
  addressId?: string; // UUID
  houseNo: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface BankDetails {
  bankAccountId?: string; // UUID
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
}

export interface Client {
  clientId: string; // UUID
  user: User;
  address: Address;
  companyName: string;
  contactNumber: string;
  email: string;
  gst: string;
  currency: string;
  panNumber: string;
  status: string;
  createdAt: string; // date-time
  updatedAt: string; // date-time
}

export interface Employee {
  employeeId: string; // UUID
  user: User;
  client: Client;
  address: Address;
  bankDetails: BankDetails;
  firstName: string;
  lastName: string;
  personalEmail: string;
  companyEmail: string;
  contactNumber: string;
  currency: string;
  dateOfBirth: string; // date
  dateOfJoining: string; // date
  designation: string;
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
  createdAt: string; // date-time
  updatedAt: string; // date-time
}