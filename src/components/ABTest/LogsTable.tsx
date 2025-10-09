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

export default function LogsTable({ logs, title, testId }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [optionFilter, setOptionFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  const filteredLogs = logs.filter(log => {
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

  const getOptionBadge = (armKey: 'a' | 'b') => {
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
        armKey === 'a' || armKey === 'A'
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
      }`}>
        {armKey ? armKey.toUpperCase() : 'N/A'}
      </span>
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-48 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={optionFilter} onValueChange={setOptionFilter}>
                  <SelectTrigger className="w-32 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Option" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Execution ID
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Option
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Service
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Timestamp
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                      >
                        <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-mono">
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center gap-2 hover:text-wells-red transition-colors font-medium"
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                            {log.id.substring(0, 12)}...
                          </button>
                        </td>
                        <td className="py-4 px-6">
                          {getOptionBadge(log.option || log.armKey)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm text-gray-900 dark:text-white capitalize font-medium">
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">
                          {log.duration}ms
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {log.serviceName || '-'}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-wells-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm"
                          >
                            <Eye size={14} />
                            Details
                          </button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Log Details */}
                      {expandedLogs.has(log.id) && (
                        <tr>
                          <td colSpan={7} className="px-6 pb-6">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 ml-8 border border-gray-200 dark:border-gray-700 shadow-inner">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-wells-red rounded-full"></div>
                                Execution Details
                              </h4>
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Execution ID</p>
                                    <p className="text-sm font-mono text-gray-900 dark:text-white">{log.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.duration}ms</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(log.status)}
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{log.status}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timestamp</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}</p>
                                  </div>
                                  {log.errorMessage && (
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Error Message</p>
                                      <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                        {log.errorMessage}
                                      </p>
                                    </div>
                                  )}
                                </div>
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
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No logs found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-3 h-3 bg-wells-red rounded-full shadow-sm"></div>
                  Execution Journey
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  {getOptionBadge(selectedLog.option || selectedLog.armKey)}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    <span className="text-sm text-gray-900 dark:text-white capitalize font-medium">
                      {selectedLog.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Total Duration: {selectedLog.duration}ms
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {selectedLog.id}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedLog(null)}
                className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Execution Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Execution ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {selectedLog.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Test ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {selectedLog.testId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedLog.duration}ms</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedLog.status)}
                      <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedLog.status}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Arm/Option</p>
                    {getOptionBadge(selectedLog.option || selectedLog.armKey)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timestamp</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(selectedLog.timestamp), 'MMM d, yyyy HH:mm:ss.SSS')}
                    </p>
                  </div>
                  {selectedLog.errorMessage && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Error Message</p>
                      <div className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        {selectedLog.errorMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Execution completed in {selectedLog.duration}ms</span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2 bg-wells-red text-white hover:bg-red-700 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}