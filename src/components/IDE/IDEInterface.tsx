import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Square, 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown,
  Terminal,
  Send,
  Copy,
  Download,
  ArrowLeft,
  Server,
  Code,
  Settings
} from 'lucide-react';
import { SpringBootProject, ProjectFile } from '../../services/springBootGenerator';
import { springBootGenerator } from '../../services/springBootGenerator';
import MonacoEditor from '@monaco-editor/react';
import toast from 'react-hot-toast';

export default function IDEInterface() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<SpringBootProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isServerRunning, setIsServerRunning] = useState(false);
  
  // Postman-style API testing
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const proj = springBootGenerator.getProject(projectId);
      if (proj) {
        setProject(proj);
        setApiBaseUrl(`http://localhost:${proj.port}`);
        setIsServerRunning(springBootGenerator.isServerRunning(proj.id));
        // Set default request body for execute endpoint
        if (proj.endpoints && proj.endpoints.length > 0) {
          setRequestBody(JSON.stringify(proj.endpoints[0]?.requestBody || {}, null, 2));
        }
        // Auto-select first Java file
        const firstJavaFile = findFirstJavaFile(proj.files);
        if (firstJavaFile) {
          setSelectedFile(firstJavaFile);
        }
      }
    }
  }, [projectId]);

  const findFirstJavaFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (!file.isDirectory && file.type === 'java') {
        return file;
      }
      if (file.isDirectory && file.children) {
        const found = findFirstJavaFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (files: ProjectFile[], level = 0) => {
    return files.map((file) => (
      <div key={file.path} style={{ marginLeft: `${level * 12}px` }}>
        {file.isDirectory ? (
          <div>
            <div
              className="flex items-center gap-1 py-1 px-1 hover:bg-gray-700 cursor-pointer text-gray-300 text-sm"
              onClick={() => toggleFolder(file.path)}
            >
              {expandedFolders.has(file.path) ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <Folder size={12} className="text-blue-400" />
              <span className="text-xs">{file.name}</span>
            </div>
            {expandedFolders.has(file.path) && file.children && (
              <div>
                {renderFileTree(file.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-700 cursor-pointer ${
              selectedFile?.path === file.path ? 'bg-gray-700' : ''
            } text-sm`}
            onClick={() => setSelectedFile(file)}
          >
            <File size={12} className={getFileIconColor(file.type)} />
            <span className="text-xs text-gray-300">{file.name}</span>
          </div>
        )}
      </div>
    ));
  };

  const getFileIconColor = (type: string) => {
    switch (type) {
      case 'java': return 'text-orange-400';
      case 'xml': return 'text-green-400';
      case 'properties': return 'text-yellow-400';
      case 'yaml': return 'text-purple-400';
      case 'json': return 'text-blue-400';
      case 'md': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getEditorLanguage = (type: string) => {
    switch (type) {
      case 'java': return 'java';
      case 'xml': return 'xml';
      case 'properties': return 'properties';
      case 'yaml': return 'yaml';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  const handleRunServer = async () => {
    if (!project) return;

    setTerminalOutput(prev => [...prev, 
      '> Starting Spring Boot application...',
      '> mvn spring-boot:run',
      '',
      '  .   ____          _            __ _ _',
      ' /\\\\ / ___\'_ __ _ _(_)_ __  __ _ \\ \\ \\ \\',
      '( ( )\\___ | \'_ | \'_| | \'_ \\/ _` | \\ \\ \\ \\',
      ' \\\\/  ___)| |_)| | | | | || (_| |  ) ) ) )',
      '  \'  |____| .__|_| |_|_| |_\\__, | / / / /',
      ' =========|_|==============|___/=/_/_/_/',
      ' :: Spring Boot ::                (v3.2.0)',
      '',
      `> Started application on port ${project.port}`,
      `> Server running at http://localhost:${project.port}`,
      '> Ready to accept requests!'
    ]);

    try {
      await springBootGenerator.startProject(project.id);
      setIsServerRunning(true);
      toast.success(`Server started on port ${project.port}`);
    } catch (error) {
      toast.error('Failed to start server');
      setTerminalOutput(prev => [...prev, 
        '> ERROR: Failed to start server',
        `> ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    }
  };

  const handleStopServer = async () => {
    if (!project) return;

    setTerminalOutput(prev => [...prev, 
      '> Stopping Spring Boot application...',
      '> Server stopped successfully'
    ]);

    try {
      await springBootGenerator.stopProject(project.id);
      setIsServerRunning(false);
      toast.success('Server stopped');
    } catch (error) {
      toast.error('Failed to stop server');
    }
  };

  const handleTestAPI = async () => {
    if (!project) {
      toast.error('Project not loaded');
      return;
    }

    if (!springBootGenerator.isServerRunning(project.id)) {
      toast.error('Server must be running to test APIs');
      return;
    }

    setIsLoading(true);
    const endpoint = project.endpoints[selectedEndpoint];
    
    try {
      let requestData = {};
      if (endpoint.method !== 'GET' && requestBody.trim()) {
        try {
          requestData = JSON.parse(requestBody);
        } catch (error) {
          toast.error('Invalid JSON in request body');
          setIsLoading(false);
          return;
        }
      }

      // Use mock server instead of real HTTP call
      const data = await springBootGenerator.callMockAPI(
        project.id, 
        endpoint.method, 
        endpoint.path, 
        requestData
      );
      
      const responseText = JSON.stringify({
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'server': 'Spring Boot Mock Server'
        },
        body: data
      }, null, 2);
      
      setResponseData(responseText);
      toast.success('API call successful');
    } catch (error) {
      const errorResponse = {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: `${apiBaseUrl}${endpoint.path}`,
        timestamp: new Date().toISOString()
      };
      setResponseData(JSON.stringify(errorResponse, null, 2));
      toast.error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseData);
    toast.success('Response copied to clipboard');
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col overflow-hidden z-50">
      {/* Top Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/kogito/workflows')}
            className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Workflows
          </button>
          
          <div className="flex items-center gap-3">
            <Server size={20} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-semibold">{project.projectName}</h1>
              <p className="text-sm text-gray-400">Spring Boot IDE</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm ${
            isServerRunning ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
          }`}>
            {isServerRunning ? '● Running' : '○ Stopped'}
          </div>
          
          {!isServerRunning ? (
            <button
              onClick={handleRunServer}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <Play size={16} />
              Run Server
            </button>
          ) : (
            <button
              onClick={handleStopServer}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
            >
              <Square size={16} />
              Stop Server
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Code size={16} />
              Project Explorer
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-1">
            {renderFileTree(project.files)}
          </div>
        </div>

        {/* Center - Code Editor and API Tester */}
        <div className="flex-1 flex flex-col">
          {/* Top Half - Code Editor */}
          <div className="h-1/2 flex flex-col border-b border-gray-700">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile && (
                  <>
                    <File size={16} className={getFileIconColor(selectedFile.type)} />
                    <span className="text-sm">{selectedFile.name}</span>
                  </>
                )}
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedFile.content)}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                    title="Copy content"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              {selectedFile ? (
                <MonacoEditor
                  height="100%"
                  language={getEditorLanguage(selectedFile.type)}
                  value={selectedFile.content}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    scrollBeyondLastLine: false
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <File size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a file to view its content</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Half - API Tester (Postman-style) */}
          <div className="h-1/2 flex flex-col">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Send size={16} />
                API Tester
              </h3>
            </div>
            
            <div className="flex-1 flex">
              {/* Request Panel */}
              <div className="flex-1 flex flex-col border-r border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Base URL</label>
                      <input
                        type="text"
                        value={apiBaseUrl}
                        onChange={(e) => setApiBaseUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="http://localhost:8080"
                      />
                    </div>
                    
                    <select
                      value={selectedEndpoint}
                      onChange={(e) => {
                        const index = parseInt(e.target.value);
                        setSelectedEndpoint(index);
                        setRequestBody(JSON.stringify(project?.endpoints?.[index]?.requestBody || {}, null, 2));
                      }}
                      className="w-64 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {(project?.endpoints || []).map((endpoint, index) => (
                        <option key={index} value={index}>
                          {endpoint.method} {endpoint.path}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={handleTestAPI}
                      disabled={isLoading || !isServerRunning}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <Send size={16} />
                      {isLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    URL: {apiBaseUrl}{project?.endpoints?.[selectedEndpoint]?.path || ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {project?.endpoints?.[selectedEndpoint]?.description || 'No description available'}
                  </p>
                </div>
                
                <div className="flex-1 p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Request Body</h4>
                  <MonacoEditor
                    height="100%"
                    language="json"
                    value={requestBody}
                    onChange={(value) => setRequestBody(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      scrollBeyondLastLine: false
                    }}
                  />
                </div>
              </div>

              {/* Response Panel */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Response</h4>
                  {responseData && (
                    <button
                      onClick={copyResponse}
                      className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded text-xs transition-colors"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  )}
                </div>
                
                <div className="flex-1 p-4">
                  {responseData ? (
                    <MonacoEditor
                      height="100%"
                      language="json"
                      value={responseData}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        scrollBeyondLastLine: false
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Send size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Send a request to see the response</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Terminal */}
      <div className="h-48 bg-black border-t border-gray-700 flex flex-col flex-shrink-0">
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Terminal size={16} />
            Server Terminal
          </h3>
          
          <button
            onClick={() => setTerminalOutput([])}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition-colors"
          >
            Clear
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {terminalOutput.map((line, index) => (
            <div key={index} className="text-green-400 text-xs leading-relaxed">
              {line}
            </div>
          ))}
          
          {terminalOutput.length === 0 && (
            <div className="text-gray-500 text-xs">
              Terminal output will appear here when you run the server...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}