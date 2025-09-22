export interface Service {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';
  auth: {
    type: 'none' | 'bearer' | 'basic' | 'oauth2' | 'api-key';
    config: Record<string, any>;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    responseTime: number;
    size: number;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  method: Service['method'];
  url: string;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  body: string;
  bodyType: Service['bodyType'];
  auth: Service['auth'];
  tags: string[];
}

export interface ServiceResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  responseTime: number;
  size: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}