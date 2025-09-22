import React from 'react';
import { X, Server, Globe, Clock, Tag } from 'lucide-react';
import { Service } from '../../types/services';

interface ServiceInfoModalProps {
  service: Service;
  onClose: () => void;
}

export default function ServiceInfoModal({ service, onClose }: ServiceInfoModalProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const parseJsonSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Server size={24} className="text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getMethodColor(service.method)}`}>
                      {service.method}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Method</span>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe size={16} className="text-gray-500 dark:text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">URL</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">{service.url}</p>
                    </div>
                  </div>

                  {service.response && (
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Last Response</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {service.response.status} {service.response.statusText} • {service.response.responseTime}ms
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Authentication</h3>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Type: {service.auth.type === 'none' ? 'No Authentication' : service.auth.type.toUpperCase()}
                </p>
                {service.auth.type !== 'none' && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Authentication is configured for this service
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Request Schema */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Request Schema</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Headers</h4>
                <div className="space-y-2">
                  {Object.entries(service.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-mono text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="text-gray-900 dark:text-white ml-4">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {service.body && service.bodyType !== 'none' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Request Body ({service.bodyType})
                  </h4>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-auto max-h-60 text-gray-900 dark:text-white">
                    {typeof parseJsonSafely(service.body) === 'object' 
                      ? JSON.stringify(parseJsonSafely(service.body), null, 2)
                      : service.body
                    }
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Response Schema */}
          {service.response && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Response Schema</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response Headers</h4>
                  <div className="space-y-2">
                    {Object.entries(service.response.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-mono text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="text-gray-900 dark:text-white ml-4 truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response Body</h4>
                  <pre className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 overflow-auto max-h-40 text-gray-900 dark:text-white">
                    {typeof parseJsonSafely(service.response.body) === 'object' 
                      ? JSON.stringify(parseJsonSafely(service.response.body), null, 2)
                      : service.response.body
                    }
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}