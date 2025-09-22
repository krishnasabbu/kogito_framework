import { create } from 'zustand';
import { WorkflowOrchestration, ServiceBox, RestService, InitialRequest, ExecutionResult } from '../types/orchestrator';
import { v4 as uuidv4 } from 'uuid';

interface OrchestratorState {
  // Current workflow
  currentWorkflow: WorkflowOrchestration | null;
  selectedServiceBox: ServiceBox | null;
  selectedRestService: RestService | null;
  
  // UI state
  showInitialRequestEditor: boolean;
  showServiceBoxConfig: boolean;
  showRestServiceConfig: boolean;
  showExecutionResults: boolean;
  
  // Execution
  executionResults: ExecutionResult | null;
  isExecuting: boolean;
  
  // Actions
  setCurrentWorkflow: (workflow: WorkflowOrchestration) => void;
  createNewWorkflow: (name: string) => void;
  updateInitialRequest: (initialRequest: Partial<InitialRequest>) => void;
  
  // Service Box actions
  addServiceBox: (position: { x: number; y: number }) => void;
  updateServiceBox: (id: string, updates: Partial<ServiceBox>) => void;
  deleteServiceBox: (id: string) => void;
  selectServiceBox: (serviceBox: ServiceBox | null) => void;
  
  // REST Service actions
  addRestService: (serviceBoxId: string) => void;
  updateRestService: (serviceBoxId: string, serviceId: string, updates: Partial<RestService>) => void;
  deleteRestService: (serviceBoxId: string, serviceId: string) => void;
  selectRestService: (restService: RestService | null) => void;
  
  // UI actions
  toggleInitialRequestEditor: () => void;
  toggleServiceBoxConfig: () => void;
  toggleRestServiceConfig: () => void;
  toggleExecutionResults: () => void;
  
  // Execution
  executeWorkflow: (inputData: Record<string, any>) => Promise<void>;
  clearExecutionResults: () => void;
}

export const useOrchestratorStore = create<OrchestratorState>((set, get) => ({
  // Initial state
  currentWorkflow: null,
  selectedServiceBox: null,
  selectedRestService: null,
  showInitialRequestEditor: false,
  showServiceBoxConfig: false,
  showRestServiceConfig: false,
  showExecutionResults: false,
  executionResults: null,
  isExecuting: false,

  // Workflow actions
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  createNewWorkflow: (name) => {
    const newWorkflow: WorkflowOrchestration = {
      id: uuidv4(),
      name,
      description: '',
      initialRequest: {
        id: uuidv4(),
        name: 'Initial Request',
        description: 'Base JSON object shared across all services',
        jsonSchema: '{}',
        sampleData: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      serviceBoxes: [],
      connections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ currentWorkflow: newWorkflow });
  },
  
  updateInitialRequest: (updates) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        initialRequest: {
          ...state.currentWorkflow.initialRequest,
          ...updates,
          updatedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }
    };
  }),

  // Service Box actions
  addServiceBox: (position) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    const newServiceBox: ServiceBox = {
      id: uuidv4(),
      name: `Service ${state.currentWorkflow.serviceBoxes.length + 1}`,
      description: '',
      position,
      restServices: [],
      order: state.currentWorkflow.serviceBoxes.length
    };
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes: [...state.currentWorkflow.serviceBoxes, newServiceBox],
        updatedAt: new Date().toISOString()
      }
    };
  }),
  
  updateServiceBox: (id, updates) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    const serviceBoxes = state.currentWorkflow.serviceBoxes.map(box =>
      box.id === id ? { ...box, ...updates } : box
    );
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes,
        updatedAt: new Date().toISOString()
      },
      selectedServiceBox: state.selectedServiceBox?.id === id 
        ? { ...state.selectedServiceBox, ...updates }
        : state.selectedServiceBox
    };
  }),
  
  deleteServiceBox: (id) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes: state.currentWorkflow.serviceBoxes.filter(box => box.id !== id),
        updatedAt: new Date().toISOString()
      },
      selectedServiceBox: state.selectedServiceBox?.id === id ? null : state.selectedServiceBox
    };
  }),
  
  selectServiceBox: (serviceBox) => set({ selectedServiceBox: serviceBox }),

  // REST Service actions
  addRestService: (serviceBoxId) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    const newRestService: RestService = {
      id: uuidv4(),
      name: 'New REST Service',
      description: '',
      method: 'POST',
      url: '',
      headers: { 'Content-Type': 'application/json' },
      authType: 'none',
      authConfig: {},
      requestBody: '{}',
      requestMapping: [],
      responseMapping: []
    };
    
    const serviceBoxes = state.currentWorkflow.serviceBoxes.map(box =>
      box.id === serviceBoxId 
        ? { ...box, restServices: [...box.restServices, newRestService] }
        : box
    );
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes,
        updatedAt: new Date().toISOString()
      }
    };
  }),
  
  updateRestService: (serviceBoxId, serviceId, updates) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    const serviceBoxes = state.currentWorkflow.serviceBoxes.map(box =>
      box.id === serviceBoxId 
        ? {
            ...box,
            restServices: box.restServices.map(service =>
              service.id === serviceId ? { ...service, ...updates } : service
            )
          }
        : box
    );
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes,
        updatedAt: new Date().toISOString()
      },
      selectedRestService: state.selectedRestService?.id === serviceId
        ? { ...state.selectedRestService, ...updates }
        : state.selectedRestService
    };
  }),
  
  deleteRestService: (serviceBoxId, serviceId) => set((state) => {
    if (!state.currentWorkflow) return state;
    
    const serviceBoxes = state.currentWorkflow.serviceBoxes.map(box =>
      box.id === serviceBoxId 
        ? { ...box, restServices: box.restServices.filter(service => service.id !== serviceId) }
        : box
    );
    
    return {
      currentWorkflow: {
        ...state.currentWorkflow,
        serviceBoxes,
        updatedAt: new Date().toISOString()
      },
      selectedRestService: state.selectedRestService?.id === serviceId ? null : state.selectedRestService
    };
  }),
  
  selectRestService: (restService) => set({ selectedRestService: restService }),

  // UI actions
  toggleInitialRequestEditor: () => set((state) => ({ 
    showInitialRequestEditor: !state.showInitialRequestEditor 
  })),
  
  toggleServiceBoxConfig: () => set((state) => ({ 
    showServiceBoxConfig: !state.showServiceBoxConfig 
  })),
  
  toggleRestServiceConfig: () => set((state) => ({ 
    showRestServiceConfig: !state.showRestServiceConfig 
  })),
  
  toggleExecutionResults: () => set((state) => ({ 
    showExecutionResults: !state.showExecutionResults 
  })),

  // Execution
  executeWorkflow: async (inputData) => {
    const { currentWorkflow } = get();
    if (!currentWorkflow) return;
    
    set({ isExecuting: true });
    
    try {
      // Mock execution - in real implementation, this would call backend
      const executionResult: ExecutionResult = {
        id: uuidv4(),
        workflowId: currentWorkflow.id,
        status: 'running',
        startTime: new Date().toISOString(),
        initialData: inputData,
        serviceResults: []
      };
      
      set({ executionResults: executionResult });
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      executionResult.status = 'completed';
      executionResult.endTime = new Date().toISOString();
      executionResult.finalData = { ...inputData, processed: true };
      
      set({ executionResults: executionResult, isExecuting: false });
    } catch (error) {
      set({ isExecuting: false });
    }
  },
  
  clearExecutionResults: () => set({ executionResults: null })
}));