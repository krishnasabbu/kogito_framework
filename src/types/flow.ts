export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: EdgeData;
}

export interface NodeData {
  label: string;
  config: Record<string, any>;
  inputs?: PortDefinition[];
  outputs?: PortDefinition[];
}

export interface EdgeData {
  condition?: string;
  mapping?: MappingRule[];
}

export interface PortDefinition {
  id: string;
  name: string;
  type: string;
  required?: boolean;
}

export interface MappingRule {
  source: string;
  target: string;
  transform?: string;
  type: 'direct' | 'transform' | 'conditional';
}

export interface NodeType {
  type: string;
  label: string;
  icon: string;
  category: 'input' | 'transform' | 'output' | 'logic' | 'data';
  defaultData: NodeData;
  configSchema: ConfigField[];
}

export interface ConfigField {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'json' | 'code';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  authType: 'none' | 'apikey' | 'basic' | 'oauth2';
  authConfig: Record<string, any>;
  openApiSpec?: string;
  endpoints: ConnectorEndpoint[];
}

export interface ConnectorEndpoint {
  id: string;
  method: string;
  path: string;
  description: string;
  parameters: Parameter[];
  requestSchema?: string;
  responseSchema?: string;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'body';
  type: string;
  required?: boolean;
  description?: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  config: {
    timeout: number;
    retries: number;
    errorHandling: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResult {
  flowId: string;
  executionId: string;
  status: 'success' | 'error' | 'running';
  steps: SimulationStep[];
  error?: string;
  duration: number;
}

export interface SimulationStep {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  input: any;
  output: any;
  error?: string;
  duration: number;
  httpTrace?: {
    request: any;
    response: any;
  };
}

export interface GenerationRequest {
  flowId: string;
  options: {
    projectName: string;
    packageName: string;
    javaVersion: '17' | '21';
    springBootVersion: string;
    buildTool: 'maven' | 'gradle';
    includeTests: boolean;
    includeDocker: boolean;
    includeKogito: boolean;
    includeObservability: boolean;
  };
}

export interface GenerationResult {
  success: boolean;
  projectZipUrl?: string;
  kogitoArtifacts?: {
    pojosZipUrl: string;
    serviceClassesZipUrl: string;
    adapterClassesZipUrl: string;
  };
  error?: string;
  warnings: string[];
}

// Service Orchestration Types
export interface InitialRequestConfig {
  id: string;
  name: string;
  jsonSchema: string;
  sampleData: Record<string, any>;
}

export interface RestServiceConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
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