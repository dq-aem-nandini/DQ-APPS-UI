// src/lib/deviceUtils.ts
"use client";

import { v4 as uuidv4 } from "uuid";

export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "server-device"; // fallback
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

export const getDeviceName = (): string => {
  if (typeof window === "undefined") return "Server";
  return window.navigator.platform || "Web Browser";
};

export const getUserAgent = (): string => {
  if (typeof window === "undefined") return "Server";
  return window.navigator.userAgent;
};
