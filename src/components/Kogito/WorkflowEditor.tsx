import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, Play, Upload, Plus, Settings, Code, FileText, Eye } from 'lucide-react';
import { useKogitoStore } from '../../stores/kogitoStore';
import { WorkflowDefinition, WorkflowVariable } from '../../types/kogito';
import { InitialRequestConfig } from '../../types/kogito';
import KogitoEditor from './KogitoEditor';
import WorkflowBuilder from './WorkflowBuilder';
import InitialRequestEditor from './InitialRequestEditor';
import toast from 'react-hot-toast';

export default function WorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    saveWorkflowBuilderData,
    getWorkflowBuilderData,
    executeWorkflow
  } = useKogitoStore();

  const [workflowData, setWorkflowData] = useState<Partial<WorkflowDefinition>>({
    name: '',
    description: '',
    version: '1.0.0',
    status: 'draft',
    bpmnContent: '',
    dmnContent: '',
    tags: [],
    variables: [],
    createdBy: 'current-user',
    builderNodes: [],
    builderEdges: [],
    serviceMappings: {},
    initialRequestConfig: undefined
  });

  const [showInitialRequestEditor, setShowInitialRequestEditor] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [kogitoEditorType, setKogitoEditorType] = useState<'bpmn' | 'dmn'>('bpmn');
  
  const [newTag, setNewTag] = useState('');
  const [newVariable, setNewVariable] = useState<Partial<WorkflowVariable>>({
    name: '',
    type: 'string',
    required: false,
    description: ''
  });

  // Load workflow if editing existing one
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    } else {
      setCurrentWorkflow(null);
    }
  }, [id, loadWorkflow, setCurrentWorkflow]);

  useEffect(() => {
    if (currentWorkflow) {
      setWorkflowData({
        ...currentWorkflow,
        bpmnContent: currentWorkflow.bpmnContent || '',
        dmnContent: currentWorkflow.dmnContent || '',
        tags: currentWorkflow.tags || [],
        variables: currentWorkflow.variables || [],
        builderNodes: currentWorkflow.builderNodes || [],
        builderEdges: currentWorkflow.builderEdges || [],
        serviceMappings: currentWorkflow.serviceMappings || {},
        initialRequestConfig: currentWorkflow.initialRequestConfig || undefined
      });
    } else {
      setWorkflowData({
        name: '',
        description: '',
        version: '1.0.0',
        status: 'draft',
        bpmnContent: '',
        dmnContent: '',
        tags: [],
        variables: [],
        createdBy: 'current-user',
        builderNodes: [],
        builderEdges: [],
        serviceMappings: {},
        initialRequestConfig: undefined
      });
    }
  }, [currentWorkflow]);

  const handleSave = async () => {
    try {
      if (!workflowData.name?.trim()) {
        toast.error('Workflow name is required');
        return;
      }

      console.log("Saving workflow ============= "+JSON.stringify(workflowData))

      let savedWorkflow;
      if (currentWorkflow) {
        savedWorkflow = await updateWorkflow(currentWorkflow.id, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        savedWorkflow = await createWorkflow(workflowData as Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>);
        toast.success('Workflow created successfully');
      }
      
      // Generate Spring Boot project
      if (savedWorkflow) {
        try {
          const { springBootGenerator } = await import('../../services/springBootGenerator');
          await springBootGenerator.generateProject(savedWorkflow, workflowData.serviceMappings || {});
          toast.success('Spring Boot project generated successfully');
        } catch (error) {
          console.error('Failed to generate Spring Boot project:', error);
          toast.error('Failed to generate Spring Boot project');
        }
      }
      
      // Navigate back to workflows list
      setTimeout(() => {
        navigate('/kogito/workflows');
      }, 500);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleExecute = async () => {
    if (!currentWorkflow) {
      toast.error('Please save the workflow first');
      return;
    }

    try {
      const inputData = {
        processId: currentWorkflow.id,
        timestamp: new Date().toISOString(),
        variables: workflowData.variables?.reduce((acc, variable) => {
          acc[variable.name] = variable.defaultValue || null;
          return acc;
        }, {} as Record<string, any>) || {}
      };

      await executeWorkflow(currentWorkflow.id, inputData);
      toast.success('Workflow execution started');
    } catch (error) {
      toast.error('Failed to execute workflow');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !workflowData.tags?.includes(newTag.trim())) {
      setWorkflowData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setWorkflowData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleAddVariable = () => {
    if (newVariable.name?.trim()) {
      const variable: WorkflowVariable = {
        name: newVariable.name.trim(),
        type: newVariable.type || 'string',
        required: newVariable.required || false,
        description: newVariable.description?.trim(),
        defaultValue: newVariable.defaultValue
      };

      setWorkflowData(prev => ({
        ...prev,
        variables: [...(prev.variables || []), variable]
      }));

      setNewVariable({
        name: '',
        type: 'string',
        required: false,
        description: ''
      });
    }
  };

  const handleRemoveVariable = (variableName: string) => {
    setWorkflowData(prev => ({
      ...prev,
      variables: prev.variables?.filter(v => v.name !== variableName) || []
    }));
  };

  const handleClose = () => {
    // Clear current workflow state
    setCurrentWorkflow(null);
    navigate('/kogito/workflows');
  };

  return (
    <div className="fixed inset-0 bg-dark-bg z-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 bg-dark-surface border-b border-dark-border">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-dark-text-primary">
              {id && id !== 'new' ? 'Edit Workflow' : 'Create Workflow'}
            </h1>
            <p className="text-sm text-dark-text-secondary">
              {currentWorkflow ? `Editing: ${currentWorkflow.name}` : 'Design your business process'}
            </p>
          </div>
          
          {/* Initial Request JSON Button */}
          <button
            onClick={() => setShowInitialRequestEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-wells-red text-white hover:bg-red-700 rounded-lg transition-all duration-200 shadow-lg"
          >
            <Upload size={16} />
            {workflowData.initialRequestConfig ? 'Edit Initial JSON' : 'Set Initial JSON'}
          </button>
          
          {workflowData.initialRequestConfig && (
            <div className="text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-800">
              ✓ {workflowData.initialRequestConfig.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Workflow Properties */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={workflowData.name || ''}
              onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
              placeholder="Workflow Name"
            />
            
            <select
              value={workflowData.status || 'draft'}
              onChange={(e) => setWorkflowData(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-surface text-dark-text-primary hover:bg-dark-hover border border-dark-border rounded-lg transition-all duration-200"
          >
            <Settings size={16} />
            Properties
          </button>

          <button
            onClick={handleExecute}
            disabled={!currentWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
          >
            <Play size={16} />
            Execute
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-wells-red text-white hover:bg-red-700 rounded-lg transition-all duration-200"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={handleClose}
            className="p-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-hover rounded-lg transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Content - Two Editors Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - React Flow Workflow Builder */}
        <div className="flex-1 flex flex-col border-r border-dark-border">
          <div className="flex items-center justify-between p-4 bg-dark-surface border-b border-dark-border">
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-wells-red" />
              <h2 className="text-lg font-semibold text-dark-text-primary">Workflow Builder</h2>
            </div>
            <div className="text-sm text-dark-text-secondary">
              Drag services to build your workflow
            </div>
          </div>
          
          <div className="flex-1">
            <WorkflowBuilder 
              initialRequestConfig={workflowData.initialRequestConfig || null}
              nodes={workflowData.builderNodes || []}
              edges={workflowData.builderEdges || []}
              serviceMappings={workflowData.serviceMappings || {}}
              onWorkflowChange={(workflow) => {
                console.log('Workflow updated:', JSON.stringify(workflow));
                setWorkflowData(prev => ({
                  ...prev,
                  builderNodes: workflow.nodes,
                  builderEdges: workflow.edges,
                  serviceMappings: workflow.serviceMappings
                }));
              }}
            />
          </div>
        </div>

        {/* Right Side - Kogito BPMN/DMN Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-dark-surface border-b border-dark-border">
            <div className="flex items-center gap-2">
              <Code size={20} className="text-wells-gold" />
              <h2 className="text-lg font-semibold text-dark-text-primary">Kogito Editor</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setKogitoEditorType('bpmn')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  kogitoEditorType === 'bpmn'
                    ? 'bg-wells-red text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text-primary border border-dark-border'
                }`}
              >
                BPMN Process
              </button>
              
              <button
                onClick={() => setKogitoEditorType('dmn')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  kogitoEditorType === 'dmn'
                    ? 'bg-wells-red text-white'
                    : 'bg-dark-surface text-dark-text-secondary hover:text-dark-text-primary border border-dark-border'
                }`}
              >
                DMN Rules
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <KogitoEditor
              content={kogitoEditorType === 'bpmn' ? workflowData.bpmnContent || '' : workflowData.dmnContent || ''}
              onContentChange={(content) => {
                console.log(`${kogitoEditorType.toUpperCase()} content changed:`, content);
                if (kogitoEditorType === 'bpmn') {
                  setWorkflowData(prev => ({ ...prev, bpmnContent: content }));
                } else {
                  setWorkflowData(prev => ({ ...prev, dmnContent: content }));
                }
              }}
              editorType={kogitoEditorType}
              height="100%"
              title={`${kogitoEditorType.toUpperCase()} Editor`}
              onSave={handleSave}
              onExecute={handleExecute}
            />
          </div>
        </div>
      </div>

      {/* Properties Panel Overlay */}
      {showPropertiesPanel && (
        <div className="fixed right-0 top-0 h-full w-96 bg-dark-surface border-l border-dark-border shadow-2xl z-60 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-dark-border">
            <h3 className="text-lg font-semibold text-dark-text-primary flex items-center gap-2">
              <Settings size={20} />
              Workflow Properties
            </h3>
            <button
              onClick={() => setShowPropertiesPanel(false)}
              className="p-1 hover:bg-dark-hover rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Basic Properties */}
            <div>
              <h4 className="font-medium text-dark-text-primary mb-3">Basic Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text-primary mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={workflowData.name || ''}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={workflowData.description || ''}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    placeholder="Describe what this workflow does"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-primary mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={workflowData.version || ''}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="font-medium text-dark-text-primary mb-3">Tags</h4>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {workflowData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full border border-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-100 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-dark-hover text-dark-text-primary hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Variables */}
            <div>
              <h4 className="font-medium text-dark-text-primary mb-3">Process Variables</h4>
              
              {/* Variables List */}
              <div className="space-y-2 mb-4">
                {workflowData.variables?.map((variable) => (
                  <div
                    key={variable.name}
                    className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-dark-border"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-dark-text-primary">{variable.name}</div>
                      <div className="text-xs text-dark-text-secondary">
                        {variable.type} | {variable.required ? 'Required' : 'Optional'}
                      </div>
                      {variable.description && (
                        <div className="text-xs text-dark-text-secondary mt-1">{variable.description}</div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRemoveVariable(variable.name)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Variable Form */}
              <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newVariable.name || ''}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    placeholder="Variable name"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newVariable.type || 'string'}
                      onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as any }))}
                      className="px-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                    </select>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newVariable.required || false}
                        onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                        className="w-4 h-4 text-wells-red focus:ring-wells-red border-dark-border rounded"
                      />
                      <span className="text-sm text-dark-text-primary">Required</span>
                    </label>
                  </div>
                  
                  <input
                    type="text"
                    value={newVariable.description || ''}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border text-dark-text-primary rounded-lg focus:ring-2 focus:ring-wells-red focus:border-transparent"
                    placeholder="Description (optional)"
                  />
                  
                  <button
                    onClick={handleAddVariable}
                    disabled={!newVariable.name?.trim()}
                    className="w-full px-3 py-2 bg-wells-red text-white hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Add Variable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Initial Request Editor Modal */}
      {showInitialRequestEditor && (
        <InitialRequestEditor
          config={workflowData.initialRequestConfig || null}
          onSave={(config) => {
            setWorkflowData(prev => ({ ...prev, initialRequestConfig: config }));
            setShowInitialRequestEditor(false);
            toast.success('Initial Request JSON configured');
          }}
          onClose={() => setShowInitialRequestEditor(false)}
        />
      )}
    </div>
  );
}