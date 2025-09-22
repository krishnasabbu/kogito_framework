import React from 'react';
import { X, Workflow, Code2, Download } from 'lucide-react';
import { useFlowStore } from '../../stores/flowStore';

export default function KogitoPanel() {
  const { toggleKogitoEditor } = useFlowStore();

  const handleGeneratePojos = () => {
    // TODO: Implement POJO generation
    console.log('Generating POJOs for Kogito integration...');
  };

  const handleGenerateServices = () => {
    // TODO: Implement service class generation
    console.log('Generating service classes for Kogito integration...');
  };

  const handleGenerateAdapters = () => {
    // TODO: Implement adapter generation
    console.log('Generating Kogito adapters...');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-96 bg-white border-t border-gray-200 shadow-wells-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Workflow size={20} />
          Kogito Integration
        </h3>
        <button
          onClick={toggleKogitoEditor}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* BPMN Editor Placeholder */}
        <div className="flex-1 border-r border-gray-200 p-4">
          <div className="h-full bg-surface rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <Workflow size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">BPMN Process Editor</p>
              <p className="text-sm">
                Integration with React Kogito-standalone will be embedded here
              </p>
            </div>
          </div>
        </div>

        {/* Integration Controls */}
        <div className="w-80 p-4 space-y-4">
          <div>
            <h4 className="font-medium text-text-primary mb-3">Code Generation</h4>
            <div className="space-y-2">
              <button
                onClick={handleGeneratePojos}
                className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-white hover:bg-primary-600 rounded-md transition-colors"
              >
                <Code2 size={16} />
                Generate POJOs
              </button>

              <button
                onClick={handleGenerateServices}
                className="w-full flex items-center gap-2 px-4 py-3 bg-secondary text-text-primary hover:bg-yellow-300 rounded-md transition-colors"
              >
                <Code2 size={16} />
                Generate Services
              </button>

              <button
                onClick={handleGenerateAdapters}
                className="w-full flex items-center gap-2 px-4 py-3 bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"
              >
                <Workflow size={16} />
                Generate Adapters
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-text-primary mb-3">Integration Options</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="integration-mode"
                  value="http"
                  defaultChecked
                  className="text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm">HTTP Service Calls</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="integration-mode"
                  value="embedded"
                  className="text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-sm">Embedded Service Beans</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-text-primary mb-3">Export</h4>
            
            <button className="w-full flex items-center gap-2 px-4 py-2 bg-surface hover:bg-gray-100 border border-gray-200 rounded-md transition-colors">
              <Download size={16} />
              Download Integration Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}