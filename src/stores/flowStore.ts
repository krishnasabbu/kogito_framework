import { create } from 'zustand';
import { Flow, FlowNode, FlowEdge, Connector, SimulationResult } from '../types/flow';
import { InitialRequestConfig } from '../types/flow';
import { v4 as uuidv4 } from 'uuid';

interface FlowState {
  // Current flow
  currentFlow: Flow | null;
  selectedNode: FlowNode | null;
  selectedEdge: FlowEdge | null;
  
  // Initial Request Configuration
  initialRequestConfig: InitialRequestConfig | null;
  showInitialRequestEditor: boolean;
  showRestServiceConfig: boolean;
  
  // Connectors
  connectors: Connector[];
  
  // UI state
  showPropertiesPanel: boolean;
  showConnectorCatalog: boolean;
  showSimulator: boolean;
  showKogitoEditor: boolean;
  
  // Simulation
  simulationResults: SimulationResult | null;
  isSimulating: boolean;
  
  // Actions
  setCurrentFlow: (flow: Flow) => void;
  updateFlowNodes: (nodes: FlowNode[]) => void;
  updateFlowEdges: (edges: FlowEdge[]) => void;
  selectNode: (node: FlowNode | null) => void;
  selectEdge: (edge: FlowEdge | null) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNode['data']>) => void;
  updateEdgeData: (edgeId: string, data: Partial<FlowEdge['data']>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Initial Request actions
  setInitialRequestConfig: (config: InitialRequestConfig) => void;
  toggleInitialRequestEditor: () => void;
  toggleRestServiceConfig: () => void;
  
  // UI actions
  togglePropertiesPanel: () => void;
  toggleConnectorCatalog: () => void;
  toggleSimulator: () => void;
  toggleKogitoEditor: () => void;
  
  // Connectors
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, connector: Partial<Connector>) => void;
  deleteConnector: (id: string) => void;
  
  // Flow management
  createNewFlow: (name: string) => void;
  saveFlow: () => Promise<void>;
  loadFlow: (id: string) => Promise<void>;
  exportFlow: () => string;
  importFlow: (flowJson: string) => void;
  
  // Simulation
  runSimulation: (inputData: any) => Promise<void>;
  clearSimulationResults: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  // Initial state
  currentFlow: null,
  selectedNode: null,
  selectedEdge: null,
  initialRequestConfig: null,
  showInitialRequestEditor: false,
  showRestServiceConfig: false,
  connectors: [],
  showPropertiesPanel: false,
  showConnectorCatalog: false,
  showSimulator: false,
  showKogitoEditor: false,
  simulationResults: null,
  isSimulating: false,

  // Flow actions
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
  
  updateFlowNodes: (nodes) => set((state) => ({
    currentFlow: state.currentFlow ? { ...state.currentFlow, nodes } : null
  })),
  
  updateFlowEdges: (edges) => set((state) => ({
    currentFlow: state.currentFlow ? { ...state.currentFlow, edges } : null
  })),
  
  selectNode: (node) => set({ selectedNode: node, selectedEdge: null }),
  
  selectEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),
  
  updateNodeData: (nodeId, data) => set((state) => {
    if (!state.currentFlow) return state;
    
    const nodes = state.currentFlow.nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    );
    
    return {
      currentFlow: { ...state.currentFlow, nodes },
      selectedNode: state.selectedNode?.id === nodeId 
        ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } }
        : state.selectedNode
    };
  }),
  
  updateEdgeData: (edgeId, data) => set((state) => {
    if (!state.currentFlow) return state;
    
    const edges = state.currentFlow.edges.map(edge =>
      edge.id === edgeId ? { ...edge, data: { ...edge.data, ...data } } : edge
    );
    
    return {
      currentFlow: { ...state.currentFlow, edges },
      selectedEdge: state.selectedEdge?.id === edgeId
        ? { ...state.selectedEdge, data: { ...state.selectedEdge.data, ...data } }
        : state.selectedEdge
    };
  }),
  
  deleteNode: (nodeId) => set((state) => {
    if (!state.currentFlow) return state;
    
    const nodes = state.currentFlow.nodes.filter(node => node.id !== nodeId);
    const edges = state.currentFlow.edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    );
    
    return {
      currentFlow: { ...state.currentFlow, nodes, edges },
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
    };
  }),
  
  deleteEdge: (edgeId) => set((state) => {
    if (!state.currentFlow) return state;
    
    const edges = state.currentFlow.edges.filter(edge => edge.id !== edgeId);
    
    return {
      currentFlow: { ...state.currentFlow, edges },
      selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge
    };
  }),
  
  duplicateNode: (nodeId) => set((state) => {
    if (!state.currentFlow) return state;
    
    const originalNode = state.currentFlow.nodes.find(node => node.id === nodeId);
    if (!originalNode) return state;
    
    const newNode: FlowNode = {
      ...originalNode,
      id: uuidv4(),
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50
      },
      data: {
        ...originalNode.data,
        label: `${originalNode.data.label} (Copy)`
      }
    };
    
    const nodes = [...state.currentFlow.nodes, newNode];
    
    return {
      currentFlow: { ...state.currentFlow, nodes }
    };
  }),
  
  // Initial Request actions
  setInitialRequestConfig: (config) => set({ initialRequestConfig: config }),
  
  toggleInitialRequestEditor: () => set((state) => ({ 
    showInitialRequestEditor: !state.showInitialRequestEditor 
  })),
  
  toggleRestServiceConfig: () => set((state) => ({ 
    showRestServiceConfig: !state.showRestServiceConfig 
  })),
  
  // UI actions
  togglePropertiesPanel: () => set((state) => ({ 
    showPropertiesPanel: !state.showPropertiesPanel 
  })),
  
  toggleConnectorCatalog: () => set((state) => ({ 
    showConnectorCatalog: !state.showConnectorCatalog 
  })),
  
  toggleSimulator: () => set((state) => ({ 
    showSimulator: !state.showSimulator 
  })),
  
  toggleKogitoEditor: () => set((state) => ({ 
    showKogitoEditor: !state.showKogitoEditor 
  })),
  
  // Connector actions
  addConnector: (connector) => set((state) => ({
    connectors: [...state.connectors, connector]
  })),
  
  updateConnector: (id, updates) => set((state) => ({
    connectors: state.connectors.map(connector =>
      connector.id === id ? { ...connector, ...updates } : connector
    )
  })),
  
  deleteConnector: (id) => set((state) => ({
    connectors: state.connectors.filter(connector => connector.id !== id)
  })),
  
  // Flow management
  createNewFlow: (name) => {
    const newFlow: Flow = {
      id: uuidv4(),
      name,
      description: '',
      version: '1.0.0',
      nodes: [],
      edges: [],
      config: {
        timeout: 30000,
        retries: 3,
        errorHandling: 'propagate'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set({ currentFlow: newFlow });
  },
  
  saveFlow: async () => {
    const { currentFlow } = get();
    if (!currentFlow) return;
    
    // TODO: Implement API call to save flow
    console.log('Saving flow:', currentFlow);
  },
  
  loadFlow: async (id) => {
    // TODO: Implement API call to load flow
    console.log('Loading flow:', id);
  },
  
  exportFlow: () => {
    const { currentFlow } = get();
    return currentFlow ? JSON.stringify(currentFlow, null, 2) : '';
  },
  
  importFlow: (flowJson) => {
    try {
      const flow = JSON.parse(flowJson);
      set({ currentFlow: flow });
    } catch (error) {
      console.error('Failed to import flow:', error);
    }
  },
  
  // Simulation
  runSimulation: async (inputData) => {
    const { currentFlow } = get();
    if (!currentFlow) return;
    
    set({ isSimulating: true });
    
    try {
      // TODO: Implement simulation logic
      const mockResult: SimulationResult = {
        flowId: currentFlow.id,
        executionId: uuidv4(),
        status: 'success',
        steps: [],
        duration: 1500
      };
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      set({ simulationResults: mockResult, isSimulating: false });
    } catch (error) {
      set({ 
        simulationResults: {
          flowId: currentFlow.id,
          executionId: uuidv4(),
          status: 'error',
          steps: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: 0
        },
        isSimulating: false 
      });
    }
  },
  
  clearSimulationResults: () => set({ simulationResults: null })
}));