import React from 'react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Database, 
  Zap,
  Workflow,
  FileCode,
  FileText
} from 'lucide-react';
import { useFlowStore } from '../../stores/flowStore';
import toast from 'react-hot-toast';

export default function Toolbar() {
  const {
    currentFlow,
    toggleInitialRequestEditor,
    saveFlow,
    exportFlow,
    importFlow,
    togglePropertiesPanel,
    toggleConnectorCatalog,
    toggleSimulator,
    toggleKogitoEditor,
    runSimulation,
    isSimulating
  } = useFlowStore();

  const handleExportFlow = () => {
    if (!currentFlow) {
      toast.error('No flow to export');
      return;
    }

    const flowJson = exportFlow();
    const blob = new Blob([flowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFlow.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Flow exported successfully');
  };

  const handleImportFlow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flowJson = e.target?.result as string;
            importFlow(flowJson);
            toast.success('Flow imported successfully');
          } catch (error) {
            toast.error('Failed to import flow');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveFlow = async () => {
    try {
      await saveFlow();
      toast.success('Flow saved successfully');
    } catch (error) {
      toast.error('Failed to save flow');
    }
  };

  const handleRunSimulation = () => {
    if (!currentFlow || currentFlow.nodes.length === 0) {
      toast.error('Add nodes to the flow before running simulation');
      return;
    }

    // Mock input data
    const inputData = {
      request: {
        id: '12345',
        amount: 100,
        currency: 'USD',
        timestamp: new Date().toISOString()
      }
    };

    runSimulation(inputData);
    toast.success('Running simulation...');
  };

  const handleGenerateCode = () => {
    if (!currentFlow || currentFlow.nodes.length === 0) {
      toast.error('Add nodes to the flow before generating code');
      return;
    }

    // TODO: Implement code generation
    toast.success('Code generation started...');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-text-primary">FlowForge</h1>
          {currentFlow && (
            <span className="text-text-muted">- {currentFlow.name}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Flow Actions */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            <button
              onClick={handleSaveFlow}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handleExportFlow}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Download size={16} />
              Export
            </button>

            <button
              onClick={handleImportFlow}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Upload size={16} />
              Import
            </button>
          </div>

          {/* Simulation & Generation */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isSimulating 
                  ? 'bg-gray-100 text-text-muted cursor-not-allowed' 
                  : 'bg-success text-white hover:bg-green-600'
                }
              `}
            >
              <Play size={16} />
              {isSimulating ? 'Running...' : 'Simulate'}
            </button>

            <button
              onClick={handleGenerateCode}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
            >
              <FileCode size={16} />
              Generate
            </button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleInitialRequestEditor}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileText size={16} />
              Initial Request
            </button>

            <button
              onClick={togglePropertiesPanel}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Settings size={16} />
              Properties
            </button>

            <button
              onClick={toggleConnectorCatalog}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Database size={16} />
              Connectors
            </button>

            <button
              onClick={toggleSimulator}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Zap size={16} />
              Simulator
            </button>

            <button
              onClick={toggleKogitoEditor}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors"
            >
              <Workflow size={16} />
              Kogito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}