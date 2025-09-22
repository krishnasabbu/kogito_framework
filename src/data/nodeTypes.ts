import { NodeType } from '../types/flow';

export const nodeTypes: NodeType[] = [
  {
    type: 'http-ingress',
    label: 'HTTP Ingress',
    icon: 'Globe',
    category: 'input',
    defaultData: {
      label: 'HTTP Endpoint',
      config: {
        path: '/api/endpoint',
        method: 'POST',
        timeout: 30000,
        enableAuth: false,
        authType: 'none'
      },
      outputs: [
        { id: 'success', name: 'Success', type: 'object', required: true },
        { id: 'error', name: 'Error', type: 'error' }
      ]
    },
    configSchema: [
      { name: 'path', type: 'text', label: 'Endpoint Path', required: true, placeholder: '/api/endpoint' },
      { name: 'method', type: 'select', label: 'HTTP Method', required: true, options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      { name: 'timeout', type: 'number', label: 'Timeout (ms)', placeholder: '30000' },
      { name: 'enableAuth', type: 'boolean', label: 'Enable Authentication' },
      { name: 'authType', type: 'select', label: 'Auth Type', options: ['none', 'basic', 'bearer', 'apikey'] }
    ]
  },
  {
    type: 'transform',
    label: 'Transform',
    icon: 'Zap',
    category: 'transform',
    defaultData: {
      label: 'Data Transform',
      config: {
        transformType: 'javascript',
        code: '// Transform input data\nreturn {\n  ...input,\n  timestamp: new Date().toISOString()\n};'
      },
      inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
      outputs: [{ id: 'output', name: 'Output', type: 'any', required: true }]
    },
    configSchema: [
      { name: 'transformType', type: 'select', label: 'Transform Type', options: ['javascript', 'jsonpath', 'template'] },
      { name: 'code', type: 'code', label: 'Transform Code', required: true }
    ]
  },
  {
    type: 'connector',
    label: 'Connector',
    icon: 'Link',
    category: 'output',
    defaultData: {
      label: 'External API',
      config: {
        connectorId: '',
        endpointId: '',
        timeout: 30000,
        retries: 3,
        circuitBreaker: true
      },
      inputs: [{ id: 'request', name: 'Request', type: 'object', required: true }],
      outputs: [
        { id: 'response', name: 'Response', type: 'object', required: true },
        { id: 'error', name: 'Error', type: 'error' }
      ]
    },
    configSchema: [
      { name: 'connectorId', type: 'select', label: 'Connector', required: true, options: [] },
      { name: 'endpointId', type: 'select', label: 'Endpoint', required: true, options: [] },
      { name: 'timeout', type: 'number', label: 'Timeout (ms)', placeholder: '30000' },
      { name: 'retries', type: 'number', label: 'Retry Count', placeholder: '3' },
      { name: 'circuitBreaker', type: 'boolean', label: 'Enable Circuit Breaker' }
    ]
  },
  {
    type: 'service-call',
    label: 'Service Call',
    icon: 'Server',
    category: 'logic',
    defaultData: {
      label: 'Internal Service',
      config: {
        serviceName: '',
        methodName: '',
        async: false,
        timeout: 10000
      },
      inputs: [{ id: 'parameters', name: 'Parameters', type: 'object', required: true }],
      outputs: [
        { id: 'result', name: 'Result', type: 'object', required: true },
        { id: 'error', name: 'Error', type: 'error' }
      ]
    },
    configSchema: [
      { name: 'serviceName', type: 'text', label: 'Service Name', required: true, placeholder: 'OrderService' },
      { name: 'methodName', type: 'text', label: 'Method Name', required: true, placeholder: 'processOrder' },
      { name: 'async', type: 'boolean', label: 'Asynchronous Call' },
      { name: 'timeout', type: 'number', label: 'Timeout (ms)', placeholder: '10000' }
    ]
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: 'GitBranch',
    category: 'logic',
    defaultData: {
      label: 'Conditional Logic',
      config: {
        condition: 'input.amount > 1000',
        conditionType: 'javascript'
      },
      inputs: [{ id: 'input', name: 'Input', type: 'any', required: true }],
      outputs: [
        { id: 'true', name: 'True', type: 'any', required: true },
        { id: 'false', name: 'False', type: 'any', required: true }
      ]
    },
    configSchema: [
      { name: 'condition', type: 'code', label: 'Condition Expression', required: true },
      { name: 'conditionType', type: 'select', label: 'Expression Type', options: ['javascript', 'jsonpath'] }
    ]
  },
  {
    type: 'database',
    label: 'Database',
    icon: 'Database',
    category: 'data',
    defaultData: {
      label: 'Database Operation',
      config: {
        operation: 'SELECT',
        table: '',
        query: '',
        dataSource: 'primary'
      },
      inputs: [{ id: 'parameters', name: 'Parameters', type: 'object' }],
      outputs: [
        { id: 'result', name: 'Result', type: 'array', required: true },
        { id: 'error', name: 'Error', type: 'error' }
      ]
    },
    configSchema: [
      { name: 'operation', type: 'select', label: 'Operation', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] },
      { name: 'table', type: 'text', label: 'Table Name', required: true },
      { name: 'query', type: 'code', label: 'SQL Query', required: true },
      { name: 'dataSource', type: 'text', label: 'Data Source', placeholder: 'primary' }
    ]
  },
  {
    type: 'error-handler',
    label: 'Error Handler',
    icon: 'AlertTriangle',
    category: 'logic',
    defaultData: {
      label: 'Error Handler',
      config: {
        strategy: 'retry',
        maxRetries: 3,
        backoffMs: 1000,
        fallbackValue: null
      },
      inputs: [{ id: 'error', name: 'Error', type: 'error', required: true }],
      outputs: [
        { id: 'handled', name: 'Handled', type: 'any', required: true },
        { id: 'unhandled', name: 'Unhandled', type: 'error' }
      ]
    },
    configSchema: [
      { name: 'strategy', type: 'select', label: 'Error Strategy', options: ['retry', 'fallback', 'propagate'] },
      { name: 'maxRetries', type: 'number', label: 'Max Retries', placeholder: '3' },
      { name: 'backoffMs', type: 'number', label: 'Backoff (ms)', placeholder: '1000' },
      { name: 'fallbackValue', type: 'json', label: 'Fallback Value' }
    ]
  }
  ,
  {
    type: 'service-box',
    label: 'Service Box',
    icon: 'Package',
    category: 'logic',
    defaultData: {
      label: 'Service Box',
      config: {
        name: 'Service Box',
        description: 'Container for REST services',
        restServices: []
      },
      inputs: [{ id: 'input', name: 'Input', type: 'object', required: true }],
      outputs: [{ id: 'output', name: 'Output', type: 'object', required: true }]
    },
    configSchema: [
      { name: 'name', type: 'text', label: 'Service Box Name', required: true },
      { name: 'description', type: 'text', label: 'Description' }
    ]
  }
];