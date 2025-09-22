import React, { useState, useEffect } from 'react';
import { X, Save, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Service } from '../../types/services';
import { InitialRequestConfig, RestServiceConfig, FieldMapping } from '../../types/kogito';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface ServiceMappingModalProps {
  nodeId: string;
  service: Service;
  initialRequestConfig: InitialRequestConfig | null;
  existingMapping: RestServiceConfig | null;
  onSave: (nodeId: string, mappingConfig: RestServiceConfig) => void;
  onClose: () => void;
}

export default function ServiceMappingModal({
  nodeId,
  service, 
  initialRequestConfig, 
  existingMapping,
  onSave, 
  onClose 
}: ServiceMappingModalProps) {
  const [mappingConfig, setMappingConfig] = useState<RestServiceConfig>({
    name: service.name,
    method: service.method,
    url: service.url,
    headers: service.headers,
    requestBody: service.body || '{}',
    requestMapping: [],
    responseMapping: []
  });

  const [serviceFields, setServiceFields] = useState<string[]>([]);
  const [initialFields, setInitialFields] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const extractFieldsFromJson = (obj: any, prefix: string): string[] => {
    const fields: string[] = [];
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        fields.push(fieldPath);
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          fields.push(...extractFieldsFromJson(value, fieldPath));
        }
      }
    }
    return fields;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  useEffect(() => {
    if (hasInitialized) return;
    console.log("existing mapping  ==== "+JSON.stringify(existingMapping));
    if (existingMapping) {
      setMappingConfig({
        ...existingMapping,
        requestMapping: existingMapping.requestMapping || [],
        responseMapping: existingMapping.responseMapping || []
      });
    } else {
      try {
        const serviceJson = JSON.parse(service.body || '{}');
        const fields = extractFieldsFromJson(serviceJson, '');
        setServiceFields(fields);

        if (!mappingConfig.requestMapping || mappingConfig.requestMapping.length === 0) {
          const autoMappings: FieldMapping[] = fields.map(field => ({
            id: uuidv4(),
            sourceField: '',
            targetField: field,
            type: 'direct'
          }));
          setMappingConfig(prev => ({ ...prev, requestMapping: autoMappings }));
        }
      } catch {
        setServiceFields([]);
      }

      
    }

    if (initialRequestConfig) {
      try {
        const initialJson = JSON.parse(initialRequestConfig.jsonSchema);
        const fields = extractFieldsFromJson(initialJson, '');
        setInitialFields(fields);
      } catch {
        setInitialFields([]);
      }
    }

    setHasInitialized(true);
  }, [service, initialRequestConfig, existingMapping, hasInitialized]);

  const updateMapping = (mappingId: string, updates: Partial<FieldMapping>) => {
    setMappingConfig(prev => ({
      ...prev,
      requestMapping: prev.requestMapping.map(mapping =>
        mapping.id === mappingId ? { ...mapping, ...updates } : mapping
      )
    }));
  };

  const clearMapping = (mappingId: string) => {
    setMappingConfig(prev => ({
      ...prev,
      requestMapping: prev.requestMapping.map(mapping =>
        mapping.id === mappingId ? { ...mapping, sourceField: '', staticValue: '' } : mapping
      )
    }));
  };

  const handleSave = () => {
    if (!initialRequestConfig) {
      toast.error('Initial Request JSON is required for mapping');
      return;
    }

    const validMappings = mappingConfig.requestMapping.filter(m => m.sourceField || m.staticValue);
    if (validMappings.length === 0) {
      toast.error('Please map at least one field before saving');
      return;
    }

    // Pass full mappingConfig along with nodeId
    onSave(nodeId, mappingConfig);
    onClose();
    toast.success('Field mapping saved successfully');
  };

  if (!initialRequestConfig) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <LinkIcon size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Initial Request Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please configure the Initial Request JSON first to enable field mapping.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <LinkIcon size={24} className="text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Field Mapping</h2>
              <p className="text-gray-600 dark:text-gray-400">Map Initial Request → {service.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save size={16} />
              Save Mapping
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0 h-full">
            {/* Left - Initial Request Fields */}
            <div className="border-r border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Initial Request Fields
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag these fields to the service fields on the right
              </p>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700">
                {initialFields.length > 0 ? (
                  <div className="space-y-2">
                    {initialFields.map(field => (
                      <div
                        key={field}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', field);
                          e.currentTarget.classList.add('opacity-50');
                        }}
                        onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50')}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-sm font-mono text-gray-900 dark:text-white font-medium">{field}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Value: {(() => {
                              const value = getNestedValue(initialRequestConfig.sampleData, field);
                              if (value === undefined || value === null) return 'undefined';
                              if (typeof value === 'object') return JSON.stringify(value);
                              return String(value);
                            })()}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          drag
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <div className="text-2xl mb-2">📝</div>
                    <p>No fields found in initial request</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Service Fields */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Service Request Fields
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drop initial request fields here to map them
              </p>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {mappingConfig.requestMapping.map((mapping) => (
                  <div key={mapping.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Service Field</label>
                        <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <span className="text-sm font-mono text-gray-900 dark:text-white">{mapping.targetField}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-6">
                        <ArrowRight size={20} className="text-gray-400" />
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Initial Request Field</label>
                        <div
                          className={`min-h-[44px] px-3 py-2 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200
                            ${mapping.sourceField ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                          `}
                          onDrop={(e) => {
                            e.preventDefault();
                            const droppedField = e.dataTransfer.getData('text/plain');
                            if (droppedField) {
                              const initialData = initialRequestConfig?.sampleData || {};
                              const fieldValue = getNestedValue(initialData, droppedField);

                              updateMapping(mapping.id, { 
                                sourceField: droppedField,
                                staticValue: fieldValue !== undefined ? String(fieldValue) : `{{${droppedField}}}`
                              });

                              toast.success(`Mapped ${droppedField} to ${mapping.targetField}`);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                          }}
                        >
                          {mapping.sourceField ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex-1">
                                <div className="text-sm font-mono text-green-600 dark:text-green-400 font-medium">{mapping.sourceField}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Value: {mapping.staticValue || `{{${mapping.sourceField}}}`}
                                </div>
                              </div>
                              <button
                                onClick={() => clearMapping(mapping.id)}
                                className="text-gray-400 hover:text-red-500 ml-2 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Drop initial request field here</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {mappingConfig.requestMapping.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <LinkIcon size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No Service Fields Found</p>
                    <p className="text-sm">The service request body doesn't contain any fields to map</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">💡 How to Map Fields</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Drag fields from the left panel</li>
                  <li>• Drop them onto service field drop zones</li>
                  <li>• Values are automatically extracted</li>
                  <li>• Click X to clear a mapping</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">✅ Mapping Benefits</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Automatic data flow between services</li>
                  <li>• Type-safe field mapping</li>
                  <li>• Visual workflow representation</li>
                  <li>• Easy debugging and maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}