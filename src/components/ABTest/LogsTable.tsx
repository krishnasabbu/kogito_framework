import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Filter, Search, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { ExecutionLog } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';

interface LogsTableProps {
  logs: ExecutionLog[];
  title: string;
  testId: string;
}

interface ServiceStep {
  id: string;
  serviceName: string;
  method: string;
  url: string;
  status: 'success' | 'error';
  duration: number;
  request: any;
  response: any;
  timestamp: string;
}

interface DetailedLog extends ExecutionLog {
  serviceSteps: ServiceStep[];
}

// Generate mock detailed logs with service steps
const generateDetailedLogs = (logs: ExecutionLog[]): DetailedLog[] => {
  return logs.map(log => ({
    ...log,
    serviceSteps: [
      {
        id: `${log.id}-step-1`,
        serviceName: 'User Validation Service',
        method: 'POST',
        url: 'https://api.example.com/validate-user',
        status: 'success',
        duration: Math.floor(Math.random() * 200) + 50,
        request: {
          userId: 'user-123',
          email: 'user@example.com',
          timestamp: log.timestamp
        },
        response: {
          valid: true,
          userId: 'user-123',
          tier: 'premium'
        },
        timestamp: log.timestamp
      },
      {
        id: `${log.id}-step-2`,
        serviceName: 'Payment Processing Service',
        method: 'POST',
        url: 'https://api.example.com/process-payment',
        status: log.status,
        duration: Math.floor(Math.random() * 500) + 100,
        request: {
          amount: 99.99,
          currency: 'USD',
          userId: 'user-123',
          paymentMethod: 'credit_card'
        },
        response: log.status === 'success' ? {
          transactionId: 'txn-789',
          status: 'completed',
          amount: 99.99
        } : {
          error: 'Payment failed',
          code: 'INSUFFICIENT_FUNDS'
        },
        timestamp: new Date(new Date(log.timestamp).getTime() + 200).toISOString()
      },
      {
        id: `${log.id}-step-3`,
        serviceName: 'Notification Service',
        method: 'POST',
        url: 'https://api.example.com/send-notification',
        status: 'success',
        duration: Math.floor(Math.random() * 100) + 30,
        request: {
          userId: 'user-123',
          type: 'payment_confirmation',
          channel: 'email'
        },
        response: {
          messageId: 'msg-456',
          sent: true
        },
        timestamp: new Date(new Date(log.timestamp).getTime() + 700).toISOString()
      }
    ]
  }));
};

export default function LogsTable({ logs, title, testId }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [optionFilter, setOptionFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<DetailedLog | null>(null);

  const detailedLogs = generateDetailedLogs(logs);

  const filteredLogs = detailedLogs.filter(log => {
    const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesOption = optionFilter === 'all' || log.option === optionFilter;
    
    return matchesSearch && matchesStatus && matchesOption;
  });

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getOptionBadge = (option: 'A' | 'B') => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        option === 'A' 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      }`}>
        Option {option}
      </span>
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-bolt-surface dark:bg-bolt-surface-dark border-bolt-border dark:border-bolt-border-dark">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-bolt-text-primary dark:text-bolt-text-primary-dark">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bolt-text-secondary dark:text-bolt-text-secondary-dark" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48 bg-bolt-bg dark:bg-bolt-bg-dark border-bolt-border dark:border-bolt-border-dark"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-bolt-bg dark:bg-bolt-bg-dark border-bolt-border dark:border-bolt-border-dark">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-bolt-surface dark:bg-bolt-surface-dark border-bolt-border dark:border-bolt-border-dark">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={optionFilter} onValueChange={setOptionFilter}>
                  <SelectTrigger className="w-32 bg-bolt-bg dark:bg-bolt-bg-dark border-bolt-border dark:border-bolt-border-dark">
                    <SelectValue placeholder="Option" />
                  </SelectTrigger>
                  <SelectContent className="bg-bolt-surface dark:bg-bolt-surface-dark border-bolt-border dark:border-bolt-border-dark">
                    <SelectItem value="all">All Options</SelectItem>
                    <SelectItem value="A">Option A</SelectItem>
                    <SelectItem value="B">Option B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-bolt-border dark:border-bolt-border-dark bg-bolt-surface-alt dark:bg-bolt-surface-alt-dark">
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Execution ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Option
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Duration
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 50).map((log, index) => (
                    <React.Fragment key={log.id}>
                      <motion.tr
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-b border-bolt-border dark:border-bolt-border-dark hover:bg-bolt-surface-alt dark:hover:bg-bolt-surface-alt-dark"
                      >
                        <td className="py-3 px-4 text-sm text-bolt-text-primary dark:text-bolt-text-primary-dark font-mono">
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center gap-2 hover:text-wells-red transition-colors"
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                            {log.id.substring(0, 12)}...
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          {getOptionBadge(log.option)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-bolt-text-primary dark:text-bolt-text-primary-dark capitalize">
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-bolt-text-primary dark:text-bolt-text-primary-dark">
                          {log.duration}ms
                        </td>
                        <td className="py-3 px-4 text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                          {log.serviceName || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                          {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-wells-red hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                            Details
                          </button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Service Steps */}
                      {expandedLogs.has(log.id) && (
                        <tr>
                          <td colSpan={7} className="px-4 pb-4">
                            <div className="bg-bolt-surface-alt dark:bg-bolt-surface-alt-dark rounded-lg p-4 ml-8">
                              <h4 className="text-sm font-medium text-bolt-text-primary dark:text-bolt-text-primary-dark mb-3">
                                Service Execution Steps
                              </h4>
                              <div className="space-y-3">
                                {log.serviceSteps.map((step, stepIndex) => (
                                  <div
                                    key={step.id}
                                    className="flex items-start gap-4 p-3 bg-bolt-bg dark:bg-bolt-bg-dark rounded-lg border border-bolt-border dark:border-bolt-border-dark"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-wells-red text-white text-xs flex items-center justify-center font-medium">
                                      {stepIndex + 1}
                                    </div>
                                    
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-3">
                                        <span className="font-medium text-bolt-text-primary dark:text-bolt-text-primary-dark">
                                          {step.serviceName}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(step.method)}`}>
                                          {step.method}
                                        </span>
                                        {getStatusIcon(step.status)}
                                        <span className="text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                                          {step.duration}ms
                                        </span>
                                      </div>
                                      
                                      <div className="text-xs text-bolt-text-secondary dark:text-bolt-text-secondary-dark font-mono">
                                        {step.url}
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <div className="text-xs font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark mb-1">
                                            Request:
                                          </div>
                                          <pre className="text-xs bg-bolt-surface dark:bg-bolt-surface-dark p-2 rounded border border-bolt-border dark:border-bolt-border-dark overflow-auto max-h-32 text-bolt-text-primary dark:text-bolt-text-primary-dark">
                                            {JSON.stringify(step.request, null, 2)}
                                          </pre>
                                        </div>
                                        
                                        <div>
                                          <div className="text-xs font-medium text-bolt-text-secondary dark:text-bolt-text-secondary-dark mb-1">
                                            Response:
                                          </div>
                                          <pre className="text-xs bg-bolt-surface dark:bg-bolt-surface-dark p-2 rounded border border-bolt-border dark:border-bolt-border-dark overflow-auto max-h-32 text-bolt-text-primary dark:text-bolt-text-primary-dark">
                                            {JSON.stringify(step.response, null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-bolt-text-secondary dark:text-bolt-text-secondary-dark">No logs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-bolt-surface dark:bg-bolt-surface-dark rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-bolt-border dark:border-bolt-border-dark">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-bolt-border dark:border-bolt-border-dark">
              <div>
                <h2 className="text-xl font-bold text-bolt-text-primary dark:text-bolt-text-primary-dark">
                  Execution Details: {selectedLog.id}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  {getOptionBadge(selectedLog.option)}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <span className="text-sm text-bolt-text-primary dark:text-bolt-text-primary-dark capitalize">
                      {selectedLog.status}
                    </span>
                  </div>
                  <span className="text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                    Total Duration: {selectedLog.duration}ms
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-bolt-text-secondary dark:text-bolt-text-secondary-dark hover:text-bolt-text-primary dark:hover:text-bolt-text-primary-dark hover:bg-bolt-surface-alt dark:hover:bg-bolt-surface-alt-dark rounded-lg transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {selectedLog.serviceSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className="bg-bolt-bg dark:bg-bolt-bg-dark p-6 rounded-lg border border-bolt-border dark:border-bolt-border-dark"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wells-red text-white text-sm flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-bolt-text-primary dark:text-bolt-text-primary-dark">
                            {step.serviceName}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(step.method)}`}>
                            {step.method}
                          </span>
                          {getStatusIcon(step.status)}
                          <span className="text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                            {step.duration}ms
                          </span>
                        </div>
                        
                        <div className="text-sm text-bolt-text-secondary dark:text-bolt-text-secondary-dark font-mono">
                          {step.url}
                        </div>
                        
                        <div className="text-xs text-bolt-text-secondary dark:text-bolt-text-secondary-dark">
                          {format(new Date(step.timestamp), 'MMM d, yyyy HH:mm:ss.SSS')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-bolt-text-primary dark:text-bolt-text-primary-dark mb-2">
                          Request Payload
                        </h4>
                        <pre className="text-xs bg-bolt-surface dark:bg-bolt-surface-dark p-4 rounded border border-bolt-border dark:border-bolt-border-dark overflow-auto max-h-64 text-bolt-text-primary dark:text-bolt-text-primary-dark">
                          {JSON.stringify(step.request, null, 2)}
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-bolt-text-primary dark:text-bolt-text-primary-dark mb-2">
                          Response Payload
                        </h4>
                        <pre className="text-xs bg-bolt-surface dark:bg-bolt-surface-dark p-4 rounded border border-bolt-border dark:border-bolt-border-dark overflow-auto max-h-64 text-bolt-text-primary dark:text-bolt-text-primary-dark">
                          {JSON.stringify(step.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}