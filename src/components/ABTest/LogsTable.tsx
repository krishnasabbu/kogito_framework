import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { ExecutionLog } from '../../types/abtest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';

interface LogsTableProps {
  logs: ExecutionLog[];
  title: string;
}

export default function LogsTable({ logs, title }: LogsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [optionFilter, setOptionFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.serviceName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesOption = optionFilter === 'all' || log.option === optionFilter;
    
    return matchesSearch && matchesStatus && matchesOption;
  });

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={optionFilter} onValueChange={setOptionFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Options</SelectItem>
                  <SelectItem value="A">Option A</SelectItem>
                  <SelectItem value="B">Option B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Execution ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Option
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 50).map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {log.id.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-4">
                      {getOptionBadge(log.option)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                      {log.duration}ms
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {log.serviceName || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No logs found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}