// src/lib/api/authService.ts
"use client";

import axiosInstance from "./axios";
import { getDeviceId, getDeviceName } from "./deviceUtils";
import { LoginDTO, WebResponseDTOApiResponseObject } from "./types";


export const login = async (
  credentials: LoginDTO
): Promise<WebResponseDTOApiResponseObject> => {
  try {
    const response = await axiosInstance.post<WebResponseDTOApiResponseObject>(
      "/auth/login",
      credentials,
      {
        headers: {
          "X-Device-Id": getDeviceId(),
          "X-Device-Name": getDeviceName(),
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error(error.message || "Server error");
  }
};
