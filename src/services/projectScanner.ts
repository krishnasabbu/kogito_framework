import { BpmnFile, ProjectScanResult } from '../types/abtest';

export class ProjectScannerService {
  private static readonly BPMN_EXTENSIONS = ['.bpmn', '.bpmn2', '.bpmn.xml'];
  private static readonly IGNORE_FOLDERS = ['target', 'build', 'node_modules', '.git'];

  /**
   * Scans a Spring Boot project for BPMN files
   */
  async scanProject(projectPath: string): Promise<ProjectScanResult> {
    try {
      // Validate project path
      if (!projectPath || !projectPath.trim()) {
        throw new Error('Project path is required');
      }

      const normalizedPath = this.normalizePath(projectPath);
      
      // Try primary lookup paths
      const primaryPaths = [
        `${normalizedPath}/src/main/resources`,
        `${normalizedPath}/src/main/resources/processes`
      ];

      let resourcesPath = '';
      let bpmnFiles: BpmnFile[] = [];

      // Check primary paths first
      for (const path of primaryPaths) {
        if (await this.pathExists(path)) {
          resourcesPath = path;
          bpmnFiles = await this.scanDirectory(path, path);
          break;
        }
      }

      // Fallback to recursive scan if no primary path found
      if (bpmnFiles.length === 0) {
        resourcesPath = normalizedPath;
        bpmnFiles = await this.recursiveScan(normalizedPath);
      }

      // Deduplicate and sort
      const uniqueFiles = this.deduplicateFiles(bpmnFiles);
      
      return {
        projectPath: normalizedPath,
        bpmnFiles: uniqueFiles,
        resourcesPath,
        processesPath: primaryPaths[1]
      };
    } catch (error) {
      console.error('Project scan failed:', error);
      throw new Error(`Failed to scan project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reads BPMN file content and extracts process definition key
   */
  async readBpmnFile(filePath: string): Promise<string> {
    try {
      // In a real implementation, this would read from the file system
      // For now, return mock BPMN content
      return this.getMockBpmnContent(filePath);
    } catch (error) {
      console.error(`Failed to read BPMN file ${filePath}:`, error);
      throw new Error(`Failed to read BPMN file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts process definition key from BPMN content
   */
  extractProcessDefinitionKey(bpmnContent: string): string | null {
    try {
      // Simple regex to extract process id from BPMN XML
      const processMatch = bpmnContent.match(/<bpmn2?:process[^>]+id="([^"]+)"/);
      return processMatch ? processMatch[1] : null;
    } catch (error) {
      console.error('Failed to extract process definition key:', error);
      return null;
    }
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+$/, '');
  }

  private async pathExists(path: string): Promise<boolean> {
    // Mock implementation - in real app would check file system
    const mockPaths = [
      '/home/project/spring-boot-app/src/main/resources',
      '/home/project/spring-boot-app/src/main/resources/processes',
      '/home/project/demo-project/src/main/resources'
    ];
    return mockPaths.some(mockPath => path.includes(mockPath.split('/').pop() || ''));
  }

  private async scanDirectory(dirPath: string, basePath: string): Promise<BpmnFile[]> {
    // Mock implementation - in real app would scan actual directory
    const mockFiles = [
      'order-processing-v1.bpmn',
      'order-processing-v2.bpmn',
      'payment-flow-standard.bpmn',
      'payment-flow-optimized.bpmn',
      'user-onboarding.bpmn',
      'inventory-management.bpmn',
      'notification-service.bpmn2',
      'audit-process.bpmn.xml'
    ];

    return mockFiles.map(filename => ({
      path: `${dirPath}/${filename}`,
      filename,
      friendlyName: this.generateFriendlyName(filename),
      processDefinitionKey: this.generateProcessKey(filename)
    }));
  }

  private async recursiveScan(rootPath: string): Promise<BpmnFile[]> {
    // Mock recursive scan implementation
    const mockFiles = [
      'processes/order-processing-v1.bpmn',
      'workflows/payment-flow-standard.bpmn',
      'bpmn/user-onboarding.bpmn',
      'definitions/inventory-management.bpmn2'
    ];

    return mockFiles.map(relativePath => {
      const filename = relativePath.split('/').pop() || '';
      return {
        path: `${rootPath}/${relativePath}`,
        filename,
        friendlyName: this.generateFriendlyName(filename),
        processDefinitionKey: this.generateProcessKey(filename)
      };
    });
  }

  private deduplicateFiles(files: BpmnFile[]): BpmnFile[] {
    const seen = new Set<string>();
    return files.filter(file => {
      const key = file.filename.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
  }

  private generateFriendlyName(filename: string): string {
    return filename
      .replace(/\.(bpmn2?|bpmn\.xml)$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private generateProcessKey(filename: string): string {
    return filename
      .replace(/\.(bpmn2?|bpmn\.xml)$/, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
  }

  private getMockBpmnContent(filePath: string): string {
    const filename = filePath.split('/').pop() || '';
    const processKey = this.generateProcessKey(filename);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                   id="${processKey}-definition" 
                   targetNamespace="http://www.omg.org/bpmn20">
  <bpmn2:process id="${processKey}" name="${this.generateFriendlyName(filename)}" isExecutable="true">
    <bpmn2:startEvent id="start-event" name="Start">
      <bpmn2:outgoing>start-to-task</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:serviceTask id="service-task" name="Process Request">
      <bpmn2:incoming>start-to-task</bpmn2:incoming>
      <bpmn2:outgoing>task-to-end</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="end-event" name="End">
      <bpmn2:incoming>task-to-end</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="start-to-task" sourceRef="start-event" targetRef="service-task"/>
    <bpmn2:sequenceFlow id="task-to-end" sourceRef="service-task" targetRef="end-event"/>
  </bpmn2:process>
</bpmn2:definitions>`;
  }
}

export const projectScanner = new ProjectScannerService();