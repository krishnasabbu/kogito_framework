export interface InitialRequest {
  id: string;
  name: string;
  description: string;
  jsonSchema: string;
  sampleData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceBox {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  restServices: RestService[];
  order: number;
}

export interface RestService {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  authType: 'none' | 'bearer' | 'basic' | 'apikey';
  authConfig: Record<string, any>;
  requestBody: string;
  requestMapping: FieldMapping[];
  responseMapping: FieldMapping[];
  testResponse?: any;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transform?: string;
  type: 'direct' | 'transform' | 'static';
  staticValue?: any;
}

export interface WorkflowOrchestration {
  id: string;
  name: string;
  description: string;
  initialRequest: InitialRequest;
  serviceBoxes: ServiceBox[];
  connections: ServiceConnection[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceConnection {
  id: string;
  sourceId: string;
  targetId: string;
  condition?: string;
}

export interface ExecutionResult {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  initialData: Record<string, any>;
  finalData?: Record<string, any>;
  serviceResults: ServiceExecutionResult[];
  error?: string;
}

export interface ServiceExecutionResult {
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  request: any;
  response?: any;
  error?: string;
  duration: number;
}