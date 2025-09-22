import React, { useState, useEffect } from 'react';
import { X, Save, Code, Eye, FileText, Upload } from 'lucide-react';
import { InitialRequestConfig } from '../../types/kogito';
import MonacoEditor from '@monaco-editor/react';
import toast from 'react-hot-toast';

interface InitialRequestEditorProps {
  config: InitialRequestConfig | null;
  onSave: (config: InitialRequestConfig) => void;
  onClose: () => void;
}

export default function InitialRequestEditor({ config, onSave, onClose }: InitialRequestEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [jsonContent, setJsonContent] = useState('{}');
  const [name, setName] = useState('');

  useEffect(() => {
    if (config) {
      setJsonContent(config.jsonSchema || '{}');
      setName(config.name || '');
    }
  }, [config]);

  const handleSave = () => {
    try {
      // Validate JSON
      const parsed = JSON.parse(jsonContent);
      
      const newConfig: InitialRequestConfig = {
        id: config?.id || Date.now().toString(),
        name: name || 'Initial Request',
        jsonSchema: jsonContent,
        sampleData: parsed
      };
      
      onSave(newConfig);
      toast.success('Initial request configuration saved');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setJsonContent(JSON.stringify(parsed, null, 2));
          if (!name) {
            setName(file.name.replace('.json', ''));
          }
          toast.success('JSON file loaded successfully');
        } catch (error) {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const defaultSchema = `{
  "orderId": "ORD-12345",
  "customer": {
    "id": "CUST-789",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123"
  },
  "items": [
    {
      "productId": "PROD-456",
      "name": "Premium Widget",
      "quantity": 2,
      "price": 125.00,
      "category": "electronics"
    }
  ],
  "payment": {
    "method": "credit_card",
    "status": "pending",
    "amount": 250.00,
    "currency": "USD"
  },
  "shipping": {
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "method": "standard",
    "trackingNumber": null
  },
  "metadata": {
    "source": "web",
    "timestamp": "2024-01-25T10:30:00Z",
    "version": "1.0"
  }
}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initial Request Configuration</h2>
            <p className="text-gray-600 dark:text-gray-400">Define the base JSON object for your workflow</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Configuration Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Initial Request"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Upload JSON File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label
                  htmlFor="json-upload"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Upload size={16} />
                  Choose JSON File
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'editor'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Code size={16} />
            JSON Editor
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Eye size={16} />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            <div className="h-full flex">
              <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">JSON Schema</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Define the structure of your initial request object</p>
                </div>
                <MonacoEditor
                  height="400px"
                  language="json"
                  value={jsonContent}
                  onChange={(value) => setJsonContent(value || '{}')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    formatOnPaste: true,
                    formatOnType: true
                  }}
                />
              </div>

              <div className="w-80 bg-gray-50 dark:bg-gray-900">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">Template</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use this as a starting point</p>
                </div>
                <div className="p-4">
                  <button
                    onClick={() => setJsonContent(defaultSchema)}
                    className="w-full px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors mb-4"
                  >
                    Use Template
                  </button>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-auto max-h-80 text-gray-900 dark:text-white">
                    {defaultSchema}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">JSON Structure Preview</h3>
                <pre className="text-sm bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-600 overflow-auto max-h-96 text-gray-900 dark:text-white">
                  {JSON.stringify(JSON.parse(jsonContent || '{}'), null, 2)}
                </pre>
              </div>

              <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-300 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• This JSON object serves as the master input for your entire workflow</li>
                  <li>• Each service in your workflow can map fields from this initial request</li>
                  <li>• Services can also enrich this object with their response data</li>
                  <li>• The final enriched object becomes your workflow output</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}