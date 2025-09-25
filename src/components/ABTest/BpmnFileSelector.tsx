import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Code,
  Settings,
  Zap
} from 'lucide-react';
import { BpmnFile, ProjectScanResult, ABTestArm } from '../../types/abtest';
import { projectScanner } from '../../services/projectScanner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import toast from 'react-hot-toast';

interface BpmnFileSelectorProps {
  projectPath: string;
  selectedArms: ABTestArm[];
  generateListener: boolean;
  onArmsChange: (arms: ABTestArm[]) => void;
  onGenerateListenerChange: (generate: boolean) => void;
  onProjectPathChange: (path: string) => void;
}

export default function BpmnFileSelector({
  projectPath,
  selectedArms,
  generateListener,
  onArmsChange,
  onGenerateListenerChange,
  onProjectPathChange
}: BpmnFileSelectorProps) {
  const [scanResult, setScanResult] = useState<ProjectScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<BpmnFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-scan when project path changes
  useEffect(() => {
    if (projectPath.trim()) {
      handleScanProject();
    }
  }, [projectPath]);

  // Auto-select first two files if available
  useEffect(() => {
    if (scanResult?.bpmnFiles && scanResult.bpmnFiles.length >= 2 && selectedArms.length === 0) {
      const [firstFile, secondFile] = scanResult.bpmnFiles;
      const newArms: ABTestArm[] = [
        {
          armKey: 'a',
          armName: firstFile.friendlyName,
          bpmnFile: firstFile.path,
          processDefinitionKey: firstFile.processDefinitionKey
        },
        {
          armKey: 'b',
          armName: secondFile.friendlyName,
          bpmnFile: secondFile.path,
          processDefinitionKey: secondFile.processDefinitionKey
        }
      ];
      onArmsChange(newArms);
      toast.success('Auto-selected first two BPMN files');
    }
  }, [scanResult, selectedArms.length, onArmsChange]);

  const handleScanProject = async () => {
    if (!projectPath.trim()) {
      setScanError('Project path is required');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await projectScanner.scanProject(projectPath);
      setScanResult(result);
      
      if (result.bpmnFiles.length === 0) {
        setScanError('No BPMN files found in the project');
        toast.error('No BPMN files found');
      } else {
        toast.success(`Found ${result.bpmnFiles.length} BPMN files`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setScanError(errorMessage);
      toast.error(`Scan failed: ${errorMessage}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (armKey: string, file: BpmnFile) => {
    const newArms = selectedArms.map(arm => 
      arm.armKey === armKey 
        ? {
            ...arm,
            armName: arm.customLabel || file.friendlyName,
            bpmnFile: file.path,
            processDefinitionKey: file.processDefinitionKey
          }
        : arm
    );

    // If this is a new arm, add it
    if (!selectedArms.find(arm => arm.armKey === armKey)) {
      newArms.push({
        armKey,
        armName: file.friendlyName,
        bpmnFile: file.path,
        processDefinitionKey: file.processDefinitionKey
      });
    }

    onArmsChange(newArms);
  };

  const handleCustomLabelChange = (armKey: string, customLabel: string) => {
    const newArms = selectedArms.map(arm =>
      arm.armKey === armKey
        ? { ...arm, customLabel, armName: customLabel || getFileNameFromPath(arm.bpmnFile) }
        : arm
    );
    onArmsChange(newArms);
  };

  const getFileNameFromPath = (path: string): string => {
    return path.split('/').pop() || path;
  };

  const getAvailableFiles = (excludeArmKey: string): BpmnFile[] => {
    if (!scanResult) return [];
    
    const selectedPaths = selectedArms
      .filter(arm => arm.armKey !== excludeArmKey)
      .map(arm => arm.bpmnFile);
    
    return scanResult.bpmnFiles.filter(file => !selectedPaths.includes(file.path));
  };

  const handlePreviewFile = async (file: BpmnFile) => {
    try {
      const content = await projectScanner.readBpmnFile(file.path);
      setPreviewFile({ ...file, content });
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to load BPMN file content');
    }
  };

  const getSelectedFile = (armKey: string): BpmnFile | null => {
    const arm = selectedArms.find(a => a.armKey === armKey);
    if (!arm) return null;
    
    return scanResult?.bpmnFiles.find(f => f.path === arm.bpmnFile) || null;
  };

  const validateSelection = (): string[] => {
    const errors: string[] = [];
    
    if (selectedArms.length < 2) {
      errors.push('Please select BPMN files for both test arms');
    }
    
    if (selectedArms.length >= 2) {
      const [armA, armB] = selectedArms;
      if (armA.bpmnFile === armB.bpmnFile) {
        errors.push('Both test arms cannot use the same BPMN file');
      }
    }
    
    return errors;
  };

  const errors = validateSelection();

  return (
    <div className="space-y-8">
      {/* Project Path Input */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
            <FolderOpen size={24} className="text-blue-600" />
            Spring Boot Project Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectPath" className="text-blue-800 dark:text-blue-200 font-medium">
              Project Root Directory *
            </Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="projectPath"
                value={projectPath}
                onChange={(e) => onProjectPathChange(e.target.value)}
                placeholder="/path/to/your/spring-boot-project"
                className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-300 dark:border-blue-700"
              />
              <Button
                type="button"
                onClick={handleScanProject}
                disabled={isScanning || !projectPath.trim()}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              >
                {isScanning ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  'Scan Project'
                )}
              </Button>
            </div>
            
            {scanError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium">{scanError}</span>
                </div>
              </motion.div>
            )}
            
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">
                    Found {scanResult.bpmnFiles.length} BPMN files in {scanResult.resourcesPath}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BPMN File Selection */}
      {scanResult && scanResult.bpmnFiles.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-900 dark:text-purple-100">
              <FileText size={24} className="text-purple-600" />
              Select BPMN Files for Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Arm A Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    First Test Arm
                  </h3>
                </div>

                <div>
                  <Label className="text-blue-800 dark:text-blue-200 font-medium">BPMN File *</Label>
                  <select
                    value={selectedArms.find(a => a.armKey === 'a')?.bpmnFile || ''}
                    onChange={(e) => {
                      const file = scanResult.bpmnFiles.find(f => f.path === e.target.value);
                      if (file) handleFileSelect('a', file);
                    }}
                    className="w-full mt-2 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Select BPMN file...</option>
                    {getAvailableFiles('a').map(file => (
                      <option key={file.path} value={file.path}>
                        {file.friendlyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-blue-800 dark:text-blue-200 font-medium">Custom Label (Optional)</Label>
                  <Input
                    value={selectedArms.find(a => a.armKey === 'a')?.customLabel || ''}
                    onChange={(e) => handleCustomLabelChange('a', e.target.value)}
                    placeholder="e.g., Standard Flow"
                    className="mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-300 dark:border-blue-700"
                  />
                </div>

                {getSelectedFile('a') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Selected: {getSelectedFile('a')?.friendlyName}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewFile(getSelectedFile('a')!)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        <Eye size={14} />
                        Preview
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                      {getSelectedFile('a')?.path}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Arm B Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Second Test Arm
                  </h3>
                </div>

                <div>
                  <Label className="text-green-800 dark:text-green-200 font-medium">BPMN File *</Label>
                  <select
                    value={selectedArms.find(a => a.armKey === 'b')?.bpmnFile || ''}
                    onChange={(e) => {
                      const file = scanResult.bpmnFiles.find(f => f.path === e.target.value);
                      if (file) handleFileSelect('b', file);
                    }}
                    className="w-full mt-2 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-green-300 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Select BPMN file...</option>
                    {getAvailableFiles('b').map(file => (
                      <option key={file.path} value={file.path}>
                        {file.friendlyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-green-800 dark:text-green-200 font-medium">Custom Label (Optional)</Label>
                  <Input
                    value={selectedArms.find(a => a.armKey === 'b')?.customLabel || ''}
                    onChange={(e) => handleCustomLabelChange('b', e.target.value)}
                    placeholder="e.g., Optimized Flow"
                    className="mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-300 dark:border-green-700"
                  />
                </div>

                {getSelectedFile('b') && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Selected: {getSelectedFile('b')?.friendlyName}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewFile(getSelectedFile('b')!)}
                        className="text-green-600 border-green-300 hover:bg-green-100"
                      >
                        <Eye size={14} />
                        Preview
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                      {getSelectedFile('b')?.path}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Validation Errors</h4>
                    <ul className="space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700 dark:text-red-300">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Listener Generation Options */}
      {scanResult && selectedArms.length >= 2 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-900 dark:text-amber-100">
              <Zap size={24} className="text-amber-600" />
              Listener Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-amber-800 dark:text-amber-200 font-medium">
                  Generate and inject listener class
                </Label>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Automatically creates a ProcessEventListener to capture AB test metrics
                </p>
              </div>
              <Switch
                checked={generateListener}
                onCheckedChange={onGenerateListenerChange}
              />
            </div>

            {generateListener && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="p-4 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                    <Code size={16} />
                    Generated Listener Details
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Package:</span>
                      <span className="font-mono text-amber-900 dark:text-amber-100">
                        com.flowforge.listener
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">Class:</span>
                      <span className="font-mono text-amber-900 dark:text-amber-100">
                        ABTestListener
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 dark:text-amber-300">File Path:</span>
                      <span className="font-mono text-amber-900 dark:text-amber-100 text-xs">
                        {projectPath}/src/main/java/com/flowforge/listener/ABTestListener.java
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">What will be monitored:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Process execution start/end times</li>
                    <li>• Activity-level performance metrics</li>
                    <li>• Request/response payloads</li>
                    <li>• Error tracking and categorization</li>
                    <li>• Retry counts and queue times</li>
                    <li>• SLA compliance monitoring</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* BPMN Preview Modal */}
      <AnimatePresence>
        {showPreview && previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    BPMN File Preview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {previewFile.friendlyName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-white">File Path</Label>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                      {previewFile.path}
                    </p>
                  </div>

                  {previewFile.processDefinitionKey && (
                    <div>
                      <Label className="font-medium text-gray-900 dark:text-white">Process Definition Key</Label>
                      <p className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                        {previewFile.processDefinitionKey}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="font-medium text-gray-900 dark:text-white">BPMN Content (First 500 characters)</Label>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-64 text-gray-900 dark:text-gray-100 mt-2">
                      {previewFile.content?.substring(0, 500)}...
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}