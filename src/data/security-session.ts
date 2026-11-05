export type AdminSessionDeviceType = "desktop" | "mobile" | "tablet" | (string & {});

export interface APIAdminSession {
  id: number;
  isCurrent: boolean;
  deviceName: string;
  browser: string;
  os: string;
  deviceType: AdminSessionDeviceType;
  ipAddress: string;
  authMethod: string; // "password" | "email" | ...
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

export interface APIAdminSessionsResponse {
  data: APIAdminSession[];
  total: number;
}

export interface APIAdminSessionMessage {
  message: string;
}

export interface APIAdminSessionRevokeResponse {
  message: string;
  revoked: number;
}