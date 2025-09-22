import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Workflow, 
  Server,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navItems = [
    { path: '/kogito/workflows', label: 'Kogito Workflows', icon: Workflow },
    { path: '/services', label: 'Services', icon: Server },
    { path: '/kogito/ab-tests', label: 'A/B Tests', icon: BarChart3 },
  ];

  return (
    <div className={`
      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
      transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-h-[73px]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-wells rounded-xl flex items-center justify-center shadow-wells">
              <Workflow size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-wells">
                FlowForge
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Workflow Platform</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-10 h-10 gradient-wells rounded-xl flex items-center justify-center shadow-wells mx-auto">
            <Workflow size={24} className="text-white" />
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus-wells"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate transition-all duration-200">{label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {label}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl font-medium border border-gray-200 dark:border-gray-700">
            FlowForge Platform v1.0.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;