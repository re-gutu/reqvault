
export interface ReqVaultRequest {
  id?: number;
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
  body?: string | null;
  authType?: 'none' | 'bearer' | 'basic' | 'apikey';
  authValue?: string | null;
  tags?: string[];
  collection?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecuteRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string | null;
  authType?: 'none' | 'bearer' | 'basic' | 'apikey';
  authValue?: string | null;
}

export interface ExecuteResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | null;
  durationMs: number;
  sizeBytes: number;
  timestamp: string;
  error?: string;
}