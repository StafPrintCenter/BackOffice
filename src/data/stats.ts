export interface APIAdminStat {
  id: string;
  key: string;
  value: number;
  suffix: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStatPayload {
  key: string;
  value: number;
  suffix: string;
  label: string;
}