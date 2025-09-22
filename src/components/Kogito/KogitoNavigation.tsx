import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Workflow, 
  Play, 
  BarChart3, 
  Activity, 
  CheckSquare, 
  BookOpen,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function KogitoNavigation() {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/kogito/workflows', label: 'Workflows', icon: Workflow },
    { path: '/kogito/ab-tests', label: 'A/B Tests', icon: BarChart3 },
  ];

  return (
    <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border shadow-card transition-colors">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-wells-red to-wells-gold rounded-lg flex items-center justify-center shadow-card hover:scale-110 transition-all duration-200 animate-float">
              <Workflow size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-wells-red">
                FlowForge
              </h1>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Kogito Workflow Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-wells-red text-white shadow-card transform scale-105'
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-all duration-200 hover:scale-110"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <button className="p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-all duration-200 hover:scale-110">
              <Settings size={20} />
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-br from-wells-red to-wells-gold rounded-full flex items-center justify-center shadow-card hover:scale-110 transition-all duration-200">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}