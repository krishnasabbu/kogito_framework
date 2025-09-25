interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface CreateABTestRequest {
  name: string;
  description?: string;
  springProjectPath: string;
  arms: {
    armKey: string;
    armName: string;
    bpmnFile: string;
    customLabel?: string;
    processDefinitionKey?: string;
  }[];
  trafficSplit: number;
  generateListener: boolean;
}

interface CreateABTestResponse {
  success: boolean;
  testId: string;
  message: string;
  listenerGenerated?: boolean;
  listenerPath?: string;
  errors?: string[];
}

interface ProjectScanRequest {
  projectPath: string;
}

interface ProjectScanResponse {
  success: boolean;
  message: string;
  bpmnFiles: Array<{
    path: string;
    filename: string;
    friendlyName: string;
    processDefinitionKey?: string;
  }>;
  resourcesPath: string;
  processesPath?: string;
}

interface GetMetricsResponse {
  testId: string;
  metrics: any;
  lastUpdated: string;
}

interface GetLogsResponse {
  testId: string;
  logs: any[];
  totalCount: number;
  page: number;
  pageSize: number;
}

class ABTestApiService {
  private baseUrl: string;
  private useMockData: boolean;

  constructor(baseUrl: string = '/api/ab-tests', useMockData: boolean = true) {
    this.baseUrl = baseUrl;
    this.useMockData = useMockData;
  }

  // Configuration method to switch between mock and real API
  setApiMode(useMock: boolean, realApiUrl?: string) {
    this.useMockData = useMock;
    if (!useMock && realApiUrl) {
      this.baseUrl = realApiUrl;
    }
  }

  // Generic API call method
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    mockResponse?: () => Promise<T>
  ): Promise<T> {
    if (this.useMockData && mockResponse) {
      // Add realistic delay for mock responses
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
      return mockResponse();
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // AB Test CRUD Operations
  async getAllABTests(): Promise<ApiResponse<any[]>> {
    return this.apiCall(
      '',
      { method: 'GET' },
      async () => ({
        success: true,
        data: [
          {
            id: 'test-1',
            name: 'Order Processing Optimization',
            description: 'Testing standard vs optimized order processing flow',
            springProjectPath: '/home/project/spring-boot-app',
            arms: [
              {
                armKey: 'a',
                armName: 'Standard Flow',
                bpmnFile: 'order-processing-v1.bpmn',
                processDefinitionKey: 'order_processing_v1'
              },
              {
                armKey: 'b',
                armName: 'Optimized Flow',
                bpmnFile: 'order-processing-v2.bpmn',
                processDefinitionKey: 'order_processing_v2'
              }
            ],
            trafficSplit: 50,
            status: 'running',
            generateListener: true,
            listenerConfig: {
              packageName: 'com.flowforge.listener',
              className: 'OrderProcessingABTestListener',
              filePath: '/home/project/spring-boot-app/src/main/java/com/flowforge/listener/OrderProcessingABTestListener.java',
              generated: true
            },
            createdAt: '2024-01-20T10:00:00Z',
            updatedAt: '2024-01-25T15:30:00Z'
          },
          {
            id: 'test-2',
            name: 'Payment Gateway Comparison',
            description: 'Comparing different payment gateway implementations',
            springProjectPath: '/home/project/payment-service',
            arms: [
              {
                armKey: 'a',
                armName: 'Payment Gateway A',
                bpmnFile: 'payment-flow-standard.bpmn',
                processDefinitionKey: 'payment_flow_standard'
              },
              {
                armKey: 'b',
                armName: 'Payment Gateway B',
                bpmnFile: 'payment-flow-optimized.bpmn',
                processDefinitionKey: 'payment_flow_optimized'
              }
            ],
            trafficSplit: 30,
            status: 'stopped',
            generateListener: true,
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-22T11:45:00Z'
          }
        ]
      })
    );
  }

  async getABTest(testId: string): Promise<ApiResponse<any>> {
    return this.apiCall(
      `/${testId}`,
      { method: 'GET' },
      async () => {
        const tests = await this.getAllABTests();
        const test = tests.data?.find(t => t.id === testId);
        return {
          success: !!test,
          data: test,
          message: test ? 'Test found' : 'Test not found'
        };
      }
    );
  }

  async createABTest(request: CreateABTestRequest): Promise<ApiResponse<CreateABTestResponse>> {
    return this.apiCall(
      '',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      async () => ({
        success: true,
        data: {
          success: true,
          testId: `test-${Date.now()}`,
          message: 'A/B test created successfully',
          listenerGenerated: request.generateListener,
          listenerPath: request.generateListener 
            ? `${request.springProjectPath}/src/main/java/com/flowforge/listener/ABTestListener.java`
            : undefined
        }
      })
    );
  }

  async updateABTest(testId: string, updates: Partial<any>): Promise<ApiResponse<any>> {
    return this.apiCall(
      `/${testId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      async () => ({
        success: true,
        data: { ...updates, id: testId, updatedAt: new Date().toISOString() },
        message: 'Test updated successfully'
      })
    );
  }

  async deleteABTest(testId: string): Promise<ApiResponse<void>> {
    return this.apiCall(
      `/${testId}`,
      { method: 'DELETE' },
      async () => ({
        success: true,
        message: 'Test deleted successfully'
      })
    );
  }

  // Test Control Operations
  async startABTest(testId: string): Promise<ApiResponse<void>> {
    return this.apiCall(
      `/${testId}/start`,
      { method: 'POST' },
      async () => ({
        success: true,
        message: 'Test started successfully'
      })
    );
  }

  async stopABTest(testId: string): Promise<ApiResponse<void>> {
    return this.apiCall(
      `/${testId}/stop`,
      { method: 'POST' },
      async () => ({
        success: true,
        message: 'Test stopped successfully'
      })
    );
  }

  // Project Scanning
  async scanProject(request: ProjectScanRequest): Promise<ApiResponse<ProjectScanResponse>> {
    return this.apiCall(
      '/scan-project',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      async () => ({
        success: true,
        data: {
          success: true,
          message: 'Project scanned successfully',
          bpmnFiles: [
            {
              path: 'src/main/resources/processes/order-processing-v1.bpmn',
              filename: 'order-processing-v1.bpmn',
              friendlyName: 'Order Processing V1',
              processDefinitionKey: 'order_processing_v1'
            },
            {
              path: 'src/main/resources/processes/order-processing-v2.bpmn',
              filename: 'order-processing-v2.bpmn',
              friendlyName: 'Order Processing V2',
              processDefinitionKey: 'order_processing_v2'
            },
            {
              path: 'src/main/resources/processes/payment-flow-standard.bpmn',
              filename: 'payment-flow-standard.bpmn',
              friendlyName: 'Payment Flow Standard',
              processDefinitionKey: 'payment_flow_standard'
            },
            {
              path: 'src/main/resources/processes/payment-flow-optimized.bpmn',
              filename: 'payment-flow-optimized.bpmn',
              friendlyName: 'Payment Flow Optimized',
              processDefinitionKey: 'payment_flow_optimized'
            },
            {
              path: 'src/main/resources/user-onboarding.bpmn',
              filename: 'user-onboarding.bpmn',
              friendlyName: 'User Onboarding',
              processDefinitionKey: 'user_onboarding'
            },
            {
              path: 'src/main/resources/inventory-management.bpmn2',
              filename: 'inventory-management.bpmn2',
              friendlyName: 'Inventory Management',
              processDefinitionKey: 'inventory_management'
            }
          ],
          resourcesPath: 'src/main/resources',
          processesPath: 'src/main/resources/processes'
        }
      })
    );
  }

  // Metrics API
  async getMetrics(testId: string, timeFilter: string = '24h'): Promise<ApiResponse<GetMetricsResponse>> {
    return this.apiCall(
      `/${testId}/metrics?timeFilter=${timeFilter}`,
      { method: 'GET' },
      async () => {
        const totalRuns = Math.floor(Math.random() * 10000) + 5000;
        const armASuccessRate = 0.85 + Math.random() * 0.10;
        const armBSuccessRate = 0.90 + Math.random() * 0.09;
        
        // Generate realistic time series data
        const timeSeriesData = Array.from({ length: 24 }, (_, i) => {
          const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
          const baseRequests = 50 + Math.sin(i * 0.3) * 30 + Math.random() * 20;
          
          const aRequests = Math.floor(baseRequests * 0.6);
          const bRequests = Math.floor(baseRequests * 0.4);
          const aSuccess = Math.floor(aRequests * armASuccessRate);
          const bSuccess = Math.floor(bRequests * armBSuccessRate);
          const aErrors = aRequests - aSuccess;
          const bErrors = bRequests - bSuccess;
          
          return {
            timestamp,
            aRequests,
            bRequests,
            aSuccess,
            bSuccess,
            aErrors,
            bErrors,
            aAvgDuration: 1200 + Math.sin(i * 0.2) * 200 + Math.random() * 100,
            bAvgDuration: 950 + Math.sin(i * 0.25) * 150 + Math.random() * 80,
            armData: {
              a: {
                requests: aRequests,
                success: aSuccess,
                errors: aErrors,
                avgDuration: 1200 + Math.sin(i * 0.2) * 200
              },
              b: {
                requests: bRequests,
                success: bSuccess,
                errors: bErrors,
                avgDuration: 950 + Math.sin(i * 0.25) * 150
              }
            }
          };
        });

        return {
          success: true,
          data: {
            testId,
            metrics: {
              testId,
              totalRuns,
              armStats: {
                a: {
                  armKey: 'a',
                  armName: 'Standard Flow',
                  runs: Math.floor(totalRuns * 0.6),
                  successRate: armASuccessRate,
                  errorRate: 1 - armASuccessRate,
                  avgDuration: 1200 + Math.random() * 300,
                  minDuration: 200 + Math.random() * 100,
                  maxDuration: 2500 + Math.random() * 500,
                  totalDuration: Math.floor(totalRuns * 0.6) * 1200,
                  retryCount: Math.floor(totalRuns * 0.6 * 0.05),
                  queueTime: 50 + Math.random() * 100
                },
                b: {
                  armKey: 'b',
                  armName: 'Optimized Flow',
                  runs: Math.floor(totalRuns * 0.4),
                  successRate: armBSuccessRate,
                  errorRate: 1 - armBSuccessRate,
                  avgDuration: 950 + Math.random() * 200,
                  minDuration: 180 + Math.random() * 80,
                  maxDuration: 2000 + Math.random() * 400,
                  totalDuration: Math.floor(totalRuns * 0.4) * 950,
                  retryCount: Math.floor(totalRuns * 0.4 * 0.03),
                  queueTime: 40 + Math.random() * 80
                }
              },
              timeSeriesData,
              serviceExecutions: [
                {
                  serviceName: 'User Validation Service',
                  armCounts: {
                    a: 1200 + Math.floor(Math.random() * 300),
                    b: 800 + Math.floor(Math.random() * 200)
                  }
                },
                {
                  serviceName: 'Payment Processing Service',
                  armCounts: {
                    a: 1100 + Math.floor(Math.random() * 250),
                    b: 750 + Math.floor(Math.random() * 180)
                  }
                },
                {
                  serviceName: 'Inventory Service',
                  armCounts: {
                    a: 900 + Math.floor(Math.random() * 200),
                    b: 600 + Math.floor(Math.random() * 150)
                  }
                },
                {
                  serviceName: 'Notification Service',
                  armCounts: {
                    a: 800 + Math.floor(Math.random() * 180),
                    b: 550 + Math.floor(Math.random() * 120)
                  }
                }
              ],
              latencyPercentiles: {
                p50: { a: 800, b: 650 },
                p90: { a: 1500, b: 1200 },
                p95: { a: 2000, b: 1600 },
                p99: { a: 3000, b: 2400 }
              },
              throughputMetrics: {
                rps: { a: 25.5, b: 18.3 },
                peakRps: { a: 85.2, b: 62.1 },
                avgRps: { a: 32.1, b: 23.7 },
                totalRequests: { a: Math.floor(totalRuns * 0.6), b: Math.floor(totalRuns * 0.4) }
              },
              slaMetrics: {
                slaThreshold: 2000,
                breaches: { a: 45, b: 23 },
                complianceRate: { a: 0.94, b: 0.97 },
                avgResponseTime: { a: 1200, b: 950 }
              },
              concurrencyMetrics: {
                maxConcurrent: { a: 15, b: 12 },
                avgConcurrent: { a: 8.5, b: 6.2 },
                queueTime: { a: 85, b: 62 },
                waitTime: { a: 120, b: 95 }
              },
              errorBreakdown: [
                {
                  errorType: 'TimeoutException',
                  count: { a: 25, b: 12 },
                  percentage: { a: 2.1, b: 1.5 }
                },
                {
                  errorType: 'ValidationError',
                  count: { a: 18, b: 8 },
                  percentage: { a: 1.5, b: 1.0 }
                },
                {
                  errorType: 'NetworkError',
                  count: { a: 12, b: 5 },
                  percentage: { a: 1.0, b: 0.6 }
                }
              ],
              activityPerformance: [
                {
                  activityId: 'validate_request',
                  activityName: 'Validate Request',
                  avgDuration: { a: 250, b: 180 },
                  errorRate: { a: 0.02, b: 0.01 },
                  executionCount: { a: 1150, b: 780 }
                },
                {
                  activityId: 'process_payment',
                  activityName: 'Process Payment',
                  avgDuration: { a: 800, b: 650 },
                  errorRate: { a: 0.05, b: 0.03 },
                  executionCount: { a: 1120, b: 770 }
                },
                {
                  activityId: 'send_notification',
                  activityName: 'Send Notification',
                  avgDuration: { a: 150, b: 120 },
                  errorRate: { a: 0.01, b: 0.005 },
                  executionCount: { a: 1100, b: 760 }
                }
              ]
            },
            lastUpdated: new Date().toISOString()
          }
        };
      }
    );
  }

  async getLogs(
    testId: string, 
    page: number = 0, 
    pageSize: number = 50,
    armKey?: string,
    status?: string
  ): Promise<ApiResponse<GetLogsResponse>> {
    return this.apiCall(
      `/${testId}/logs?page=${page}&pageSize=${pageSize}${armKey ? `&armKey=${armKey}` : ''}${status ? `&status=${status}` : ''}`,
      { method: 'GET' },
      async () => {
        const armKeys = ['a', 'b'];
        const armNames = ['Standard Flow', 'Optimized Flow'];
        const errorTypes = ['TimeoutException', 'ValidationError', 'NetworkError', 'BusinessRuleViolation'];
        const services = ['User Validation Service', 'Payment Processing Service', 'Inventory Service', 'Notification Service'];
        
        const logs = Array.from({ length: pageSize }, (_, i) => {
          const armIndex = Math.random() > 0.6 ? 0 : 1;
          const selectedArmKey = armKeys[armIndex];
          const selectedArmName = armNames[armIndex];
          const logStatus = Math.random() > 0.1 ? 'success' : 'error';
          const selectedService = services[Math.floor(Math.random() * services.length)];
          
          return {
            id: `log-${testId}-${Date.now()}-${i}`,
            testId,
            armKey: selectedArmKey,
            armName: selectedArmName,
            option: selectedArmKey.toUpperCase(),
            status: logStatus,
            duration: Math.floor(Math.random() * 2000) + 200,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            errorMessage: logStatus === 'error' ? 'Service execution failed' : undefined,
            errorType: logStatus === 'error' ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : undefined,
            serviceName: selectedService,
            retryCount: logStatus === 'error' ? Math.floor(Math.random() * 3) : 0,
            queueTime: Math.floor(Math.random() * 100),
            processInstanceId: `pi-${Math.floor(Math.random() * 10000)}`,
            serviceSteps: [
              {
                id: `step-${i}-1`,
                serviceName: 'User Validation Service',
                method: 'POST',
                url: 'https://api.example.com/validate-user',
                status: 'success',
                duration: Math.floor(Math.random() * 200) + 50,
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                retryCount: 0,
                request: {
                  userId: `user-${Math.floor(Math.random() * 1000)}`,
                  email: 'user@example.com'
                },
                response: {
                  valid: true,
                  tier: 'premium'
                }
              },
              {
                id: `step-${i}-2`,
                serviceName: selectedService,
                method: 'POST',
                url: `https://api.example.com/${selectedService.toLowerCase().replace(/\s+/g, '-')}`,
                status: logStatus,
                duration: Math.floor(Math.random() * 500) + 100,
                timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                retryCount: logStatus === 'error' ? Math.floor(Math.random() * 3) : 0,
                errorType: logStatus === 'error' ? errorTypes[Math.floor(Math.random() * errorTypes.length)] : undefined,
                request: {
                  amount: 99.99,
                  currency: 'USD'
                },
                response: logStatus === 'success' ? {
                  transactionId: `txn-${Math.floor(Math.random() * 10000)}`,
                  status: 'completed'
                } : {
                  error: 'Service failed',
                  code: 'SERVICE_ERROR'
                }
              }
            ],
            activityExecutions: [
              {
                activityId: 'start_event',
                activityName: 'Start Event',
                status: 'success',
                startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 50).toISOString(),
                duration: 50,
                inputData: { processStarted: true }
              },
              {
                activityId: 'validate_request',
                activityName: 'Validate Request',
                status: 'success',
                startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 50).toISOString(),
                endTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000 + 250).toISOString(),
                duration: 200,
                inputData: { requestData: 'sample' },
                outputData: { validated: true }
              }
            ]
          };
        }).filter(log => {
          if (armKey && log.armKey !== armKey) return false;
          if (status && log.status !== status) return false;
          return true;
        });

        return {
          success: true,
          data: {
            testId,
            logs,
            totalCount: logs.length * 10, // Simulate more total records
            page,
            pageSize
          }
        };
      }
    );
  }

  // Listener Reporting Endpoints (for generated listeners to call)
  async reportExecutionStart(data: any): Promise<ApiResponse<void>> {
    return this.apiCall(
      '/executions/start',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => ({
        success: true,
        message: 'Execution start recorded'
      })
    );
  }

  async reportExecutionComplete(data: any): Promise<ApiResponse<void>> {
    return this.apiCall(
      '/executions/complete',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => ({
        success: true,
        message: 'Execution completion recorded'
      })
    );
  }

  async reportActivityStart(data: any): Promise<ApiResponse<void>> {
    return this.apiCall(
      '/activities/start',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => ({
        success: true,
        message: 'Activity start recorded'
      })
    );
  }

  async reportActivityComplete(data: any): Promise<ApiResponse<void>> {
    return this.apiCall(
      '/activities/complete',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => ({
        success: true,
        message: 'Activity completion recorded'
      })
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.apiCall(
      '/health',
      { method: 'GET' },
      async () => ({
        success: true,
        data: {
          status: 'UP',
          timestamp: new Date().toISOString()
        }
      })
    );
  }
}

// Create singleton instance
export const abTestApiService = new ABTestApiService();

// Export for easy configuration
export { ABTestApiService };
export type { 
  ApiResponse, 
  CreateABTestRequest, 
  CreateABTestResponse, 
  ProjectScanRequest, 
  ProjectScanResponse,
  GetMetricsResponse,
  GetLogsResponse
};