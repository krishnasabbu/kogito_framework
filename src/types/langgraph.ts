export interface LangGraphFlow {
  id: string;
  name: string;
  description?: string;
  nodes: LangGraphNode[];
  edges: LangGraphEdge[];
  state_schema?: Record<string, any>;
  config?: FlowConfig;
  version?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LangGraphNode {
  id: string;
  type: 'function' | 'api' | 'llm' | 'conditional' | 'transform';
  name: string;
  config: NodeConfig;
  input_mapping?: Record<string, string>;
  output_mapping?: Record<string, string>;
  retry_config?: RetryConfig;
}

export interface NodeConfig {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body_template?: string;
  function_name?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  max_tokens?: number;
  transform_script?: string;
}

export interface LangGraphEdge {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export interface FlowConfig {
  timeout?: number;
  retries?: number;
  streaming?: boolean;
  checkpoint?: boolean;
  max_concurrency?: number;
}

export interface RetryConfig {
  max_attempts: number;
  backoff_ms: number;
  backoff_multiplier: number;
}

export interface ExecutionRequest {
  flow_id: string;
  version?: string;
  input: Record<string, any>;
  config?: ExecutionConfig;
  metadata?: Record<string, any>;
}

export interface ExecutionConfig {
  streaming?: boolean;
  checkpoint?: boolean;
  timeout_ms?: number;
  metadata?: Record<string, any>;
}

export interface ExecutionResponse {
  execution_id: string;
  flow_id: string;
  flow_version?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  output?: Record<string, any>;
  error?: ErrorDetails;
  metrics: ExecutionMetrics;
  node_results: NodeExecutionResult[];
  started_at: string;
  completed_at?: string;
}

export interface ExecutionMetrics {
  total_time_ms: number;
  node_count: number;
  success_count: number;
  error_count: number;
  retry_count: number;
}

export interface NodeExecutionResult {
  node_id: string;
  node_name: string;
  node_type: string;
  status: 'success' | 'error' | 'skipped';
  execution_time_ms: number;
  input: any;
  output: any;
  error?: ErrorDetails;
  retry_count: number;
  started_at: string;
  completed_at?: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  stack_trace?: string;
}

export interface FlowVersion {
  id: string;
  flow_id: string;
  version: string;
  flow_definition: LangGraphFlow;
  status: 'active' | 'deprecated' | 'archived';
  created_at: Date;
  created_by?: string;
}

export interface StreamEvent {
  type: 'node_start' | 'node_complete' | 'node_error' | 'flow_complete' | 'flow_error';
  execution_id: string;
  timestamp: string;
  data: any;
}

export type FlowExecutionMode = 'bpmn' | 'langgraph' | 'hybrid';

export interface FlowSelector {
  mode: FlowExecutionMode;
  bpmn_file?: File;
  bpmn_workflow_id?: string;
  langgraph_flow_id?: string;
  langgraph_version?: string;
}
