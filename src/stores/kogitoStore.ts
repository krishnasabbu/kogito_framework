import { create } from 'zustand';
import { 
  WorkflowDefinition, 
  WorkflowExecution, 
  ABTest, 
  ProcessInstance, 
  TaskInstance,
  WorkflowTemplate,
  RestServiceConfig
} from '../types/kogito';
import { kogitoService } from '../services/kogitoService';

interface KogitoState {
  // Workflows
  workflows: WorkflowDefinition[];
  currentWorkflow: WorkflowDefinition | null;
  isLoadingWorkflows: boolean;
  
  // Workflow Builder Data
  workflowBuilderData: Record<string, {
    nodes: any[];
    edges: any[];
    serviceMappings: Record<string, RestServiceConfig>;
    initialRequestConfig: any;
  }>;
  
  // Executions
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;
  isExecuting: boolean;
  
  // A/B Tests
  abTests: ABTest[];
  currentABTest: ABTest | null;
  isLoadingABTests: boolean;
  
  // Process Instances
  processInstances: ProcessInstance[];
  currentProcessInstance: ProcessInstance | null;
  
  // Tasks
  tasks: TaskInstance[];
  currentTask: TaskInstance | null;
  
  // Templates
  templates: WorkflowTemplate[];
  
  // UI State
  selectedTab: 'workflows' | 'executions' | 'ab-tests' | 'processes' | 'tasks' | 'templates';
  showWorkflowEditor: boolean;
  showABTestCreator: boolean;
  
  // Actions
  setSelectedTab: (tab: KogitoState['selectedTab']) => void;
  setShowWorkflowEditor: (show: boolean) => void;
  setShowABTestCreator: (show: boolean) => void;
  
  // Workflow Actions
  loadWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createWorkflow: (workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkflow: (id: string, workflow: Partial<WorkflowDefinition>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  setCurrentWorkflow: (workflow: WorkflowDefinition | null) => void;
  
  // Workflow Builder Actions
  saveWorkflowBuilderData: (workflowId: string, data: any) => void;
  getWorkflowBuilderData: (workflowId: string) => any;
  
  // Execution Actions
  loadExecutions: (workflowId?: string) => Promise<void>;
  executeWorkflow: (workflowId: string, inputData: Record<string, any>, abTestId?: string) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;
  
  // A/B Test Actions
  loadABTests: () => Promise<void>;
  loadABTest: (id: string) => Promise<void>;
  createABTest: (abTest: Omit<ABTest, 'id' | 'metrics'>) => Promise<void>;
  updateABTest: (id: string, abTest: Partial<ABTest>) => Promise<void>;
  startABTest: (id: string) => Promise<void>;
  pauseABTest: (id: string) => Promise<void>;
  completeABTest: (id: string) => Promise<void>;
  setCurrentABTest: (abTest: ABTest | null) => void;
  
  // Process Instance Actions
  loadProcessInstances: () => Promise<void>;
  abortProcessInstance: (id: string) => Promise<void>;
  setCurrentProcessInstance: (instance: ProcessInstance | null) => void;
  
  // Task Actions
  loadTasks: (assignee?: string) => Promise<void>;
  claimTask: (id: string, assignee: string) => Promise<void>;
  completeTask: (id: string, outputData: Record<string, any>) => Promise<void>;
  setCurrentTask: (task: TaskInstance | null) => void;
  
  // Template Actions
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Omit<WorkflowTemplate, 'id' | 'usageCount' | 'rating' | 'createdAt'>) => Promise<void>;
}

export const useKogitoStore = create<KogitoState>((set, get) => ({
  // Initial State
  workflows: [],
  currentWorkflow: null,
  isLoadingWorkflows: false,
  workflowBuilderData: {},
  executions: [],
  currentExecution: null,
  isExecuting: false,
  abTests: [],
  currentABTest: null,
  isLoadingABTests: false,
  processInstances: [],
  currentProcessInstance: null,
  tasks: [],
  currentTask: null,
  templates: [],
  selectedTab: 'workflows',
  showWorkflowEditor: false,
  showABTestCreator: false,

  // UI Actions
  setSelectedTab: (tab) => set({ selectedTab: tab }),
  setShowWorkflowEditor: (show) => set({ showWorkflowEditor: show }),
  setShowABTestCreator: (show) => set({ showABTestCreator: show }),

  // Workflow Actions
  loadWorkflows: async () => {
    set({ isLoadingWorkflows: true });
    try {
      const workflows = await kogitoService.getWorkflows();
      set({ workflows, isLoadingWorkflows: false });
    } catch (error) {
      console.error('Failed to load workflows:', error);
      set({ isLoadingWorkflows: false });
    }
  },

  loadWorkflow: async (id) => {
    try {
      const workflow = await kogitoService.getWorkflow(id);
      set({ currentWorkflow: workflow });
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  },

  createWorkflow: async (workflow) => {
    try {
      const newWorkflow = await kogitoService.createWorkflow(workflow);
      set((state) => ({ 
        workflows: [...state.workflows, newWorkflow],
        currentWorkflow: newWorkflow 
      }));
      // Force reload workflows to ensure UI updates
      await get().loadWorkflows();
      return newWorkflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  updateWorkflow: async (id, workflow) => {
    try {
      const updatedWorkflow = await kogitoService.updateWorkflow(id, workflow);
      set((state) => ({
        workflows: state.workflows.map(w => w.id === id ? updatedWorkflow : w),
        currentWorkflow: state.currentWorkflow?.id === id ? updatedWorkflow : state.currentWorkflow
      }));
      // Force reload workflows to ensure UI updates
      await get().loadWorkflows();
      return updatedWorkflow;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  deleteWorkflow: async (id) => {
    try {
      await kogitoService.deleteWorkflow(id);
      set((state) => ({
        workflows: state.workflows.filter(w => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow
      }));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

  // Workflow Builder Actions
  saveWorkflowBuilderData: (workflowId, data) => set((state) => ({
    workflowBuilderData: {
      ...state.workflowBuilderData,
      [workflowId]: data
    }
  })),

  getWorkflowBuilderData: (workflowId) => {
    const state = get();
    return state.workflowBuilderData[workflowId] || null;
  },

  // Execution Actions
  loadExecutions: async (workflowId) => {
    try {
      const executions = await kogitoService.getExecutions(workflowId);
      set({ executions });
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  },

  executeWorkflow: async (workflowId, inputData, abTestId) => {
    set({ isExecuting: true });
    try {
      const execution = await kogitoService.executeWorkflow(workflowId, inputData, abTestId);
      set((state) => ({ 
        executions: [execution, ...state.executions],
        currentExecution: execution,
        isExecuting: false 
      }));
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      set({ isExecuting: false });
      throw error;
    }
  },

  cancelExecution: async (executionId) => {
    try {
      await kogitoService.cancelExecution(executionId);
      set((state) => ({
        executions: state.executions.map(e => 
          e.id === executionId ? { ...e, status: 'cancelled' as const } : e
        )
      }));
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      throw error;
    }
  },

  setCurrentExecution: (execution) => set({ currentExecution: execution }),

  // A/B Test Actions
  loadABTests: async () => {
    set({ isLoadingABTests: true });
    try {
      const abTests = await kogitoService.getABTests();
      set({ abTests, isLoadingABTests: false });
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
      set({ isLoadingABTests: false });
    }
  },

  loadABTest: async (id) => {
    try {
      const abTest = await kogitoService.getABTest(id);
      set({ currentABTest: abTest });
    } catch (error) {
      console.error('Failed to load A/B test:', error);
    }
  },

  createABTest: async (abTest) => {
    try {
      const newABTest = await kogitoService.createABTest(abTest);
      set((state) => ({ 
        abTests: [...state.abTests, newABTest],
        currentABTest: newABTest 
      }));
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      throw error;
    }
  },

  updateABTest: async (id, abTest) => {
    try {
      const updatedABTest = await kogitoService.updateABTest(id, abTest);
      set((state) => ({
        abTests: state.abTests.map(t => t.id === id ? updatedABTest : t),
        currentABTest: state.currentABTest?.id === id ? updatedABTest : state.currentABTest
      }));
    } catch (error) {
      console.error('Failed to update A/B test:', error);
      throw error;
    }
  },

  startABTest: async (id) => {
    try {
      const abTest = await kogitoService.startABTest(id);
      set((state) => ({
        abTests: state.abTests.map(t => t.id === id ? abTest : t),
        currentABTest: state.currentABTest?.id === id ? abTest : state.currentABTest
      }));
    } catch (error) {
      console.error('Failed to start A/B test:', error);
      throw error;
    }
  },

  pauseABTest: async (id) => {
    try {
      const abTest = await kogitoService.pauseABTest(id);
      set((state) => ({
        abTests: state.abTests.map(t => t.id === id ? abTest : t),
        currentABTest: state.currentABTest?.id === id ? abTest : state.currentABTest
      }));
    } catch (error) {
      console.error('Failed to pause A/B test:', error);
      throw error;
    }
  },

  completeABTest: async (id) => {
    try {
      const abTest = await kogitoService.completeABTest(id);
      set((state) => ({
        abTests: state.abTests.map(t => t.id === id ? abTest : t),
        currentABTest: state.currentABTest?.id === id ? abTest : state.currentABTest
      }));
    } catch (error) {
      console.error('Failed to complete A/B test:', error);
      throw error;
    }
  },

  setCurrentABTest: (abTest) => set({ currentABTest: abTest }),

  // Process Instance Actions
  loadProcessInstances: async () => {
    try {
      const processInstances = await kogitoService.getProcessInstances();
      set({ processInstances });
    } catch (error) {
      console.error('Failed to load process instances:', error);
    }
  },

  abortProcessInstance: async (id) => {
    try {
      await kogitoService.abortProcessInstance(id);
      set((state) => ({
        processInstances: state.processInstances.map(p => 
          p.id === id ? { ...p, status: 'aborted' as const } : p
        )
      }));
    } catch (error) {
      console.error('Failed to abort process instance:', error);
      throw error;
    }
  },

  setCurrentProcessInstance: (instance) => set({ currentProcessInstance: instance }),

  // Task Actions
  loadTasks: async (assignee) => {
    try {
      const tasks = await kogitoService.getTasks(assignee);
      set({ tasks });
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  },

  claimTask: async (id, assignee) => {
    try {
      const task = await kogitoService.claimTask(id, assignee);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? task : t)
      }));
    } catch (error) {
      console.error('Failed to claim task:', error);
      throw error;
    }
  },

  completeTask: async (id, outputData) => {
    try {
      const task = await kogitoService.completeTask(id, outputData);
      set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? task : t)
      }));
    } catch (error) {
      console.error('Failed to complete task:', error);
      throw error;
    }
  },

  setCurrentTask: (task) => set({ currentTask: task }),

  // Template Actions
  loadTemplates: async () => {
    try {
      const templates = await kogitoService.getTemplates();
      set({ templates });
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  },

  createTemplate: async (template) => {
    try {
      const newTemplate = await kogitoService.createTemplate(template);
      set((state) => ({ 
        templates: [...state.templates, newTemplate] 
      }));
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }
}));