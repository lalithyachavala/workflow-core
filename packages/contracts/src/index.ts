export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type ClockRequest = {
  imageBase64: string;
  deviceFingerprint: string;
  hostname: string;
  osVersion: string;
  appVersion: string;
};

export type AttendanceEventType = "clockIn" | "clockOut";
