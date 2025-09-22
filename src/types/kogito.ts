export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  bpmnContent: string;
  dmnContent?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  variables: WorkflowVariable[];
  // Workflow Builder Data
  builderNodes?: any[];
  builderEdges?: any[];
  serviceMappings?: Record<string, RestServiceConfig>;
  initialRequestConfig?: InitialRequestConfig;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  executionTrace: ExecutionStep[];
  abTestGroup?: 'A' | 'B';
  abTestId?: string;
}

export interface ExecutionStep {
  stepId: string;
  stepName: string;
  stepType: 'task' | 'gateway' | 'event';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: string;
  endTime?: string;
  duration?: number;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  workflowAId: string;
  workflowBId: string;
  trafficSplit: number; // Percentage for A (0-100)
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  createdBy: string;
  metrics: ABTestMetrics;
  criteria: ABTestCriteria;
}

export interface ABTestMetrics {
  totalExecutions: number;
  groupAExecutions: number;
  groupBExecutions: number;
  groupASuccessRate: number;
  groupBSuccessRate: number;
  groupAAvgDuration: number;
  groupBAvgDuration: number;
  groupAErrorRate: number;
  groupBErrorRate: number;
  statisticalSignificance: number;
  confidenceLevel: number;
}

export interface ABTestCriteria {
  primaryMetric: 'success_rate' | 'avg_duration' | 'error_rate' | 'custom';
  minimumSampleSize: number;
  confidenceLevel: number;
  minimumDetectableEffect: number;
  maxDurationDays: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  bpmnContent: string;
  dmnContent?: string;
  variables: WorkflowVariable[];
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: string;
}

export interface ProcessInstance {
  id: string;
  processId: string;
  processVersion: string;
  status: 'active' | 'completed' | 'aborted' | 'suspended';
  startDate: string;
  endDate?: string;
  variables: Record<string, any>;
  parentProcessInstanceId?: string;
  businessKey?: string;
}

export interface TaskInstance {
  id: string;
  name: string;
  processInstanceId: string;
  assignee?: string;
  candidateGroups: string[];
  status: 'created' | 'ready' | 'reserved' | 'in_progress' | 'suspended' | 'completed' | 'failed' | 'error' | 'exited' | 'obsolete';
  priority: number;
  createdDate: string;
  startedDate?: string;
  completedDate?: string;
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
}

export interface KogitoEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
  height?: string;
  width?: string;
}

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  elementId?: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  id: string;
  message: string;
  elementId?: string;
  suggestion?: string;
}

// Initial Request Configuration
export interface InitialRequestConfig {
  id: string;
  name: string;
  jsonSchema: string;
  sampleData: Record<string, any>;
}

// REST Service Configuration for Service Box
export interface RestServiceConfig {
  id?: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  requestBody: string;
  requestMapping: FieldMapping[];
  responseMapping: FieldMapping[];
}

// Field Mapping for Initial Request → Service Request
export interface FieldMapping {
  id: string;
  sourceField: string; // From Initial Request JSON
  targetField: string; // To Service Request JSON
  type: 'direct' | 'transform' | 'static';
  transform?: string; // JavaScript expression for transformation
  staticValue?: string; // Static value if type is 'static'
}