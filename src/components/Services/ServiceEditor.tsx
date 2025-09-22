import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useServicesStore } from '../../stores/servicesStore';
import { Service, ServiceFormData } from '../../types/services';
import MonacoEditor from '@monaco-editor/react';
import toast from 'react-hot-toast';

export default function ServiceEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    services,
    isExecuting,
    lastResponse,
    createService,
    updateService,
    executeService,
    loadServices
  } = useServicesStore();

  const [activeTab, setActiveTab] = useState<'request' | 'auth' | 'response'>('request');
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    method: 'GET',
    url: '',
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }, { key: '', value: '', enabled: true }],
    queryParams: [{ key: '', value: '', enabled: true }],
    body: '',
    bodyType: 'none',
    auth: { type: 'none', config: {} },
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [showAuthConfig, setShowAuthConfig] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  // Load service if editing
  useEffect(() => {
    if (id && id !== 'new') {
      loadServices().then(() => {
        const service = services.find(s => s.id === id);
        if (service) {
          setFormData({
            name: service.name,
            description: service.description,
            method: service.method,
            url: service.url,
            headers: Object.entries(service.headers).map(([key, value]) => ({
              key, value, enabled: true
            })).concat([{ key: '', value: '', enabled: true }]),
            queryParams: Object.entries(service.queryParams).map(([key, value]) => ({
              key, value, enabled: true
            })).concat([{ key: '', value: '', enabled: true }]),
            body: service.body,
            bodyType: service.bodyType,
            auth: service.auth,
            tags: service.tags
          });
          setCurrentResponse(service.response);
        }
      });
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        method: 'GET',
        url: 'https://formatjsononline.com/api/users',
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }, { key: '', value: '', enabled: true }],
        queryParams: [{ key: '', value: '', enabled: true }],
        body: '',
        bodyType: 'none',
        auth: { type: 'none', config: {} },
        tags: []
      });
    }
  }, [id, services, loadServices]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    if (!formData.url.trim()) {
      toast.error('URL is required');
      return;
    }

    try {
      if (id && id !== 'new') {
        await updateService(id, formData);
        toast.success('Service updated successfully');
      } else {
        await createService(formData);
        toast.success('Service created successfully');
      }
      navigate('/services');
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleExecute = async () => {
    if (!formData.url.trim()) {
      toast.error('URL is required');
      return;
    }

    // Create a temporary service object for execution
    const tempService: Service = {
      id: id || 'temp',
      name: formData.name || 'Test Service',
      description: formData.description,
      method: formData.method,
      url: formData.url,
      headers: formData.headers.reduce((acc, header) => {
        if (header.enabled && header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {} as Record<string, string>),
      queryParams: formData.queryParams.reduce((acc, param) => {
        if (param.enabled && param.key && param.value) {
          acc[param.key] = param.value;
        }
        return acc;
      }, {} as Record<string, string>),
      body: formData.body,
      bodyType: formData.bodyType,
      auth: formData.auth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: formData.tags
    };

    try {
      const response = await executeService(tempService);
      setCurrentResponse(response);
      setActiveTab('response');
      toast.success('Request executed successfully');
    } catch (error) {
      toast.error('Failed to execute request');
    }
  };

  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '', enabled: true }]
    }));
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) => 
        i === index ? { ...header, [field]: value } : header
      )
    }));
  };

  const removeHeader = (index: number) => {
    setFormData(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index)
    }));
  };

  const addQueryParam = () => {
    setFormData(prev => ({
      ...prev,
      queryParams: [...prev.queryParams, { key: '', value: '', enabled: true }]
    }));
  };

  const updateQueryParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      queryParams: prev.queryParams.map((param, i) => 
        i === index ? { ...param, [field]: value } : param
      )
    }));
  };

  const removeQueryParam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      queryParams: prev.queryParams.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const copyResponse = () => {
    const responseData = currentResponse || lastResponse;
    if (responseData?.body) {
      navigator.clipboard.writeText(responseData.body);
      toast.success('Response copied to clipboard');
    }
  };

  const downloadResponse = () => {
    const responseData = currentResponse || lastResponse;
    if (responseData?.body) {
      const blob = new Blob([responseData.body], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.name || 'response'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Response downloaded');
    }
  };

  const responseData = currentResponse || lastResponse;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/services')}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus-wells"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {id && id !== 'new' ? 'Edit Service' : 'Create Service'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Configure and test your API service
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExecute}
              disabled={isExecuting || !formData.url.trim()}
              className="btn-primary bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 px-6 py-3"
            >
              <Play size={16} />
              {isExecuting ? 'Sending...' : 'Send'}
            </button>

            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="Enter service name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input"
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* URL and Method */}
          <div className="flex gap-4">
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                className="input"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="input"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
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
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="input flex-1"
                placeholder="Add a tag"
              />
              <button
                onClick={addTag}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('request')}
            className={`${
              activeTab === 'request'
                ? 'tab-active'
                : 'tab'
            }`}
          >
            Request
          </button>

          <button
            onClick={() => setActiveTab('auth')}
            className={`${
              activeTab === 'auth'
                ? 'tab-active'
                : 'tab'
            }`}
          >
            Authentication
          </button>

          <button
            onClick={() => setActiveTab('response')}
            className={`${
              activeTab === 'response'
                ? 'tab-active'
                : 'tab'
            }`}
          >
            Response
            {responseData && (
              <span className={`w-2 h-2 rounded-full ${
                responseData.status >= 200 && responseData.status < 300 ? 'bg-green-500' : 'bg-red-500'
              }`} />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {activeTab === 'request' && (
            <div className="p-6 space-y-6">
              {/* Query Parameters */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Query Parameters</h3>
                  <button
                    onClick={addQueryParam}
                    className="btn-primary text-sm px-3 py-2"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.queryParams.map((param, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => updateQueryParam(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                        placeholder="Key"
                        className="input flex-1"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="input flex-1"
                      />
                      <button
                        onClick={() => removeQueryParam(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Headers</h3>
                  <button
                    onClick={addHeader}
                    className="btn-primary text-sm px-3 py-2"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Header value"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              {formData.method !== 'GET' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Request Body</h3>
                    <select
                      value={formData.bodyType}
                      onChange={(e) => setFormData(prev => ({ ...prev, bodyType: e.target.value as any }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="json">JSON</option>
                      <option value="form-data">Form Data</option>
                      <option value="x-www-form-urlencoded">URL Encoded</option>
                      <option value="raw">Raw</option>
                    </select>
                  </div>

                  {formData.bodyType !== 'none' && (
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="300px"
                        language={formData.bodyType === 'json' ? 'json' : 'text'}
                        value={formData.body}
                        onChange={(value) => setFormData(prev => ({ ...prev, body: value || '' }))}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                          formatOnPaste: true,
                          formatOnType: formData.bodyType === 'json'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Authentication Type
                </label>
                <select
                  value={formData.auth.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    auth: { type: e.target.value as any, config: {} }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Authentication</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="api-key">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>

              {formData.auth.type === 'bearer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Bearer Token
                  </label>
                  <div className="relative">
                    <input
                      type={showAuthConfig ? 'text' : 'password'}
                      value={formData.auth.config.token || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        auth: { ...prev.auth, config: { ...prev.auth.config, token: e.target.value } }
                      }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter bearer token"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthConfig(!showAuthConfig)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showAuthConfig ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {formData.auth.type === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.auth.config.username || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        auth: { ...prev.auth, config: { ...prev.auth.config, username: e.target.value } }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthConfig ? 'text' : 'password'}
                        value={formData.auth.config.password || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          auth: { ...prev.auth, config: { ...prev.auth.config, password: e.target.value } }
                        }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthConfig(!showAuthConfig)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showAuthConfig ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formData.auth.type === 'api-key' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={formData.auth.config.key || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        auth: { ...prev.auth, config: { ...prev.auth.config, key: e.target.value } }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="X-API-Key"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      API Key Value
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthConfig ? 'text' : 'password'}
                        value={formData.auth.config.value || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          auth: { ...prev.auth, config: { ...prev.auth.config, value: e.target.value } }
                        }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthConfig(!showAuthConfig)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showAuthConfig ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {formData.auth.type === 'oauth2' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={formData.auth.config.clientId || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          auth: { ...prev.auth, config: { ...prev.auth.config, clientId: e.target.value } }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter client ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showAuthConfig ? 'text' : 'password'}
                          value={formData.auth.config.clientSecret || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            auth: { ...prev.auth, config: { ...prev.auth.config, clientSecret: e.target.value } }
                          }))}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter client secret"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthConfig(!showAuthConfig)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showAuthConfig ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Authorization URL
                    </label>
                    <input
                      type="url"
                      value={formData.auth.config.authUrl || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        auth: { ...prev.auth, config: { ...prev.auth.config, authUrl: e.target.value } }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://oauth.example.com/authorize"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Token URL
                    </label>
                    <input
                      type="url"
                      value={formData.auth.config.tokenUrl || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        auth: { ...prev.auth, config: { ...prev.auth.config, tokenUrl: e.target.value } }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://oauth.example.com/token"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div className="p-6">
              {responseData ? (
                <div className="space-y-6">
                  {/* Response Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {responseData.status >= 200 && responseData.status < 300 ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                        <span className={`text-lg font-semibold ${
                          responseData.status >= 200 && responseData.status < 300 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {responseData.status} {responseData.statusText}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock size={16} />
                        <span>{responseData.responseTime}ms</span>
                      </div>
                      
                      <div className="text-gray-600 dark:text-gray-400">
                        {(responseData.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyResponse}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                      
                      <button
                        onClick={downloadResponse}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  </div>

                  {/* Response Headers */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Response Headers</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {Object.entries(responseData.headers).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-4 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response Body */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Response Body</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <MonacoEditor
                        height="400px"
                        language="json"
                        value={responseData.body}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          scrollBeyondLastLine: false
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No response yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click "Send" to execute the request and see the response
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}