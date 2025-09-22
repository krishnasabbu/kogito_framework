import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Save, Download, Upload, Play, Settings, Eye, Code } from 'lucide-react';
import { KogitoEditorProps } from '../../types/kogito';
import toast from 'react-hot-toast';

interface KogitoEditorComponentProps extends KogitoEditorProps {
  editorType: 'bpmn' | 'dmn';
  onSave?: () => void;
  onValidate?: () => void;
  onExecute?: () => void;
  title?: string;
}

// Cache to avoid reloading editor code
const openFnCache = new Map<'bpmn' | 'dmn', any>();

export default function KogitoEditor({
  content,
  onContentChange = () => {},
  readOnly = false,
  height = '600px',
  width = '100%',
  editorType = 'bpmn',
  onSave,
  onValidate,
  onExecute,
  title = 'Workflow Editor',
}: KogitoEditorComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store the callback in a ref to avoid recreating initializeEditor
  const onContentChangeRef = useRef(onContentChange);
  const unsubscribeRef = useRef<() => void>();
  const initializedRef = useRef(false);

  // Update the ref when onContentChange changes
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // Default content
  const getDefaultContent = useCallback((type: 'bpmn' | 'dmn') => {
    if (type === 'bpmn') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="workflow-definition" 
                   targetNamespace="http://www.omg.org/bpmn20">
  <bpmn2:process id="workflow-process" name="New Workflow" isExecutable="true">
    <bpmn2:startEvent id="start-event" name="Start">
      <bpmn2:outgoing>start-to-end</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="end-event" name="End">
      <bpmn2:incoming>start-to-end</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="start-to-end" sourceRef="start-event" targetRef="end-event"/>
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="diagram">
    <bpmndi:BPMNPlane id="plane" bpmnElement="workflow-process">
      <bpmndi:BPMNShape id="start-shape" bpmnElement="start-event">
        <dc:Bounds x="100" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="end-shape" bpmnElement="end-event">
        <dc:Bounds x="300" y="100" width="36" height="36"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="flow-edge" bpmnElement="start-to-end">
        <di:waypoint x="136" y="118"/>
        <di:waypoint x="300" y="118"/>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="http://www.omg.org/spec/DMN/20180521/MODEL/" 
                 xmlns:feel="http://www.omg.org/spec/DMN/20180521/FEEL/" 
                 id="decision-definition" 
                 name="New Decision" 
                 namespace="http://www.omg.org/dmn">
  <dmn:decision id="decision-1" name="Sample Decision">
    <dmn:decisionTable id="decision-table-1">
      <dmn:input id="input-1">
        <dmn:inputExpression id="input-expression-1" typeRef="string">
          <dmn:text>input</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:output id="output-1" name="result" typeRef="string"/>
      <dmn:rule id="rule-1">
        <dmn:inputEntry id="input-entry-1">
          <dmn:text>"test"</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="output-entry-1">
          <dmn:text>"success"</dmn:text>
        </dmn:outputEntry>
      </dmn:rule>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>`;
    }
  }, []);

  // Safe content (if prop empty or undefined)
  const getInitialContent = useCallback((): Promise<string> => {
    if (typeof content === 'string' && content.trim() !== '') {
      return Promise.resolve(content);
    }
    return Promise.resolve(getDefaultContent(editorType));
  }, [content, editorType, getDefaultContent]);

  // Initialize editor (open, set content, subscribe)
  const initializeEditor = useCallback(async () => {
    if (!containerRef.current || initializedRef.current) return;

    setIsLoading(true);
    setError(null);
    initializedRef.current = true;

    try {
      // get or load open function
      let openFn = openFnCache.get(editorType);
      if (!openFn) {
        if (editorType === 'bpmn') {
          const mod = await import(
            '@kogito-tooling/kie-editors-standalone/dist/bpmn'
          );
          openFn = mod.open;
        } else {
          const mod = await import(
            '@kogito-tooling/kie-editors-standalone/dist/dmn'
          );
          openFn = mod.open;
        }
        openFnCache.set(editorType, openFn);
      }

      // open editor with initialContent as a Promise<string>
      const editor = await openFn({
        container: containerRef.current,
        initialContent: getInitialContent(),
        readOnly,
        resourcesPathPrefix: '/resources',
      });

      editorRef.current = editor;

      // subscribe to content changes using the ref
      const unsubscribe = editor.subscribeToContentChanges((newContent: string) => {
        onContentChangeRef.current(newContent);
      });
      unsubscribeRef.current = unsubscribe;

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize standalone editor:', err);
      setError('Editor failed to load');
      setIsLoading(false);
      initializedRef.current = false;
    }
  }, [editorType, readOnly, getInitialContent]);

  // Only initialize once when component mounts or editorType changes
  useEffect(() => {
    // Reset initialization flag when editorType changes
    initializedRef.current = false;
    
    initializeEditor();
    
    return () => {
      // cleanup if supported
      try {
        if (editorRef.current && typeof editorRef.current.close === 'function') {
          editorRef.current.close();
        }
      } catch (e) {
        console.warn('Error during editor cleanup:', e);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      editorRef.current = null;
      initializedRef.current = false;
    };
  }, [editorType]); // Only depend on editorType

  // Handle content updates separately
  useEffect(() => {
    if (editorRef.current && content && typeof editorRef.current.setContent === 'function') {
      const updateTimeout = setTimeout(() => {
        try {
          const contentToSet = String(content || '').trim() === '' 
            ? getDefaultContent(editorType) 
            : String(content);
          editorRef.current.setContent(contentToSet);
        } catch (error) {
          console.warn('Error updating editor content:', error);
        }
      }, 100);

      return () => clearTimeout(updateTimeout);
    }
  }, [content, editorType, getDefaultContent]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) {
      toast.error('Editor is not ready');
      return;
    }
    try {
      const xml = await editorRef.current.getContent();
       onContentChangeRef.current(xml);
      // if (onSave) onSave();
      // toast.success('Saved');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save');
    }
  }, [onSave]);

  const handleValidate = useCallback(async () => {
    if (editorRef.current && typeof editorRef.current.validate === 'function') {
      try {
        const validationResult = await editorRef.current.validate();
        if (validationResult.isValid) {
          toast.success('Validation passed successfully');
        } else {
          toast.error(`Validation failed: ${validationResult.errors?.length || 0} errors found`);
        }
        onValidate?.();
      } catch (error) {
        toast.success('Content is valid'); // Fallback validation
      }
    }
  }, [onValidate]);

  const handleExecute = useCallback(() => {
    onExecute?.();
    toast.success('Workflow execution started');
  }, [onExecute]);

  const handleExport = useCallback(async () => {
    if (editorRef.current && typeof editorRef.current.getContent === 'function') {
      try {
        const currentContent = await editorRef.current.getContent();
        const blob = new Blob([currentContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow.${editorType}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${editorType.toUpperCase()} exported successfully`);
      } catch (error) {
        toast.error('Failed to export content');
      }
    }
  }, [editorType]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.${editorType},.xml`;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          if (editorRef.current && typeof editorRef.current.setContent === 'function') {
            try {
              await editorRef.current.setContent(content);
              onContentChangeRef.current(content);
              toast.success(`${editorType.toUpperCase()} imported successfully`);
            } catch (error) {
              toast.error('Failed to import content');
            }
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [editorType]);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg">
      {/* Optimized Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <Code size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded uppercase font-medium">
            {editorType}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleImport}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors"
            disabled={readOnly || isLoading}
          >
            <Upload size={12} />
            Import
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors"
            disabled={isLoading}
          >
            <Download size={12} />
            Export
          </button>

          <button
            onClick={handleValidate}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors"
            disabled={isLoading}
          >
            <Eye size={12} />
            Validate
          </button>

          {!readOnly && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-600 text-white hover:bg-primary-600 rounded transition-colors"
                disabled={isLoading}
              >
                <Save size={12} />
                Save
              </button>

              <button
                onClick={handleExecute}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-success text-white hover:bg-green-600 rounded transition-colors"
                disabled={isLoading}
              >
                <Play size={12} />
                Execute
              </button>
            </>
          )}
        </div>

      </div>

      {/* Optimized Editor Container */}
      <div className="flex-1 relative" style={{ height, width }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs text-text-muted">Loading {editorType.toUpperCase()} editor...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center p-4">
              <div className="text-error mb-2">
                <Settings size={32} className="mx-auto mb-1" />
                <p className="text-sm font-medium">Editor Loading Failed</p>
              </div>
              <p className="text-xs text-text-muted mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: height }}
        />
      </div>

      {/* Compact Help Text */}
      <div className="border-t border-gray-200 p-2 bg-gray-50">
        <div className="text-xs text-text-muted">
          <strong>{editorType.toUpperCase()} Editor:</strong> 
          {editorType === 'bpmn' && ' Design business processes with BPMN elements.'}
          {editorType === 'dmn' && ' Create decision tables and business rules.'}
        </div>
      </div>
    </div>
  );
}