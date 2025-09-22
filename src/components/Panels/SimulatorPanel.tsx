import React, { useState } from 'react';
import { X, Play, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useFlowStore } from '../../stores/flowStore';
import MonacoEditor from '@monaco-editor/react';

export default function SimulatorPanel() {
  const { 
    currentFlow,
    simulationResults, 
    isSimulating, 
    runSimulation, 
    clearSimulationResults,
    toggleSimulator 
  } = useFlowStore();

  const [inputData, setInputData] = useState(`{
  "orderId": "12345",
  "amount": 250.00,
  "currency": "USD",
  "customerId": "cust_789",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "price": 125.00
    }
  ]
}`);

  const handleRunSimulation = () => {
    try {
      const parsed = JSON.parse(inputData);
      runSimulation(parsed);
    } catch (error) {
      console.error('Invalid JSON input:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-success" size={16} />;
      case 'error':
        return <AlertCircle className="text-error" size={16} />;
      default:
        return <Clock className="text-warning" size={16} />;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-wells-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Play size={20} />
          Flow Simulator
        </h3>
        <button
          onClick={toggleSimulator}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Input Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-text-primary">Test Input</h4>
            <div className="flex gap-2">
              <button
                onClick={clearSimulationResults}
                className="px-3 py-1 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating || !currentFlow}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${isSimulating || !currentFlow
                    ? 'bg-gray-100 text-text-muted cursor-not-allowed'
                    : 'bg-success text-white hover:bg-green-600'
                  }
                `}
              >
                <Play size={14} />
                {isSimulating ? 'Running...' : 'Run Test'}
              </button>
            </div>
          </div>

          <div className="border border-gray-300 rounded-md overflow-hidden">
            <MonacoEditor
              height="150px"
              language="json"
              value={inputData}
              onChange={(value) => setInputData(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!simulationResults && !isSimulating && (
            <div className="text-center text-text-muted py-8">
              <Play size={48} className="mx-auto mb-4 opacity-30" />
              <p>Run a simulation to see execution results</p>
            </div>
          )}

          {isSimulating && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-text-muted">Executing flow simulation...</p>
            </div>
          )}

          {simulationResults && (
            <div className="space-y-4">
              {/* Execution Summary */}
              <div className="bg-surface p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-text-primary">Execution Summary</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(simulationResults.status)}
                    <span className={`text-sm font-medium ${
                      simulationResults.status === 'success' ? 'text-success' : 'text-error'
                    }`}>
                      {simulationResults.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Duration:</span>
                    <span className="ml-2 font-medium">{simulationResults.duration}ms</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Steps:</span>
                    <span className="ml-2 font-medium">{simulationResults.steps.length}</span>
                  </div>
                </div>

                {simulationResults.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-error font-medium">Error:</p>
                    <p className="text-sm text-error">{simulationResults.error}</p>
                  </div>
                )}
              </div>

              {/* Step Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Execution Steps</h4>
                
                {simulationResults.steps.length === 0 ? (
                  <div className="text-center text-text-muted py-4">
                    <p>No execution steps recorded</p>
                  </div>
                ) : (
                  simulationResults.steps.map((step, index) => (
                    <div key={step.nodeId} className="bg-surface p-3 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-text-primary">
                          Step {index + 1}: {step.nodeId}
                        </span>
                        {getStatusIcon(step.status)}
                      </div>
                      
                      <div className="text-sm text-text-muted mb-2">
                        Duration: {step.duration}ms
                      </div>

                      {step.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                          <p className="text-sm text-error">{step.error}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <p className="text-xs font-medium text-text-muted mb-1">Input:</p>
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(step.input, null, 2)}
                          </pre>
                        </div>
                        
                        {step.output && (
                          <div>
                            <p className="text-xs font-medium text-text-muted mb-1">Output:</p>
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}