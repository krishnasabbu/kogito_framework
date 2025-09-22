import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-bolt-bg-surface border-b border-bolt-divider px-6 py-4 shadow-bolt backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-bolt-hover rounded-lg transition-all duration-200 lg:hidden hover:scale-110"
          >
            <Menu size={20} className="text-bolt-text-secondary" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-bolt-text-primary font-wells">
              Workflow Platform
            </h2>
            <p className="text-sm text-bolt-text-secondary">Professional workflow management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-bolt-hover rounded-lg transition-all duration-200 hover:scale-110"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-bolt-text-secondary" />
            ) : (
              <Sun size={20} className="text-bolt-text-secondary" />
            )}
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-bolt-accent-red to-bolt-accent-gold rounded-full flex items-center justify-center shadow-bolt hover:scale-110 transition-all duration-200">
            <span className="text-white text-sm font-semibold">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;