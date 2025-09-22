/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Flat keys for gradient utilities
        'bolt-alt': '#1E1E1E',
        'bolt-surface': '#1A1A1A',
        'bolt-surfaceAlt': '#2A2A2A',
        'bolt-divider': '#2A2A2A',
        'bolt-hover': 'rgba(255,255,255,0.08)',
        'bolt-active': 'rgba(255,255,255,0.16)',
        // Wells Fargo Bolt Theme
        bolt: {
          // Background Colors
          'bg-primary': '#121212',
          
          // Text Colors
          'text-primary': '#FFFFFF',
          'text-default': '#E0E0E0',
          'text-secondary': '#B0B0B0',
          'text-disabled': '#666666',
          
          // Accent Colors (Wells Fargo)
          'accent-red': '#C40404',
          'accent-red-hover': '#E03535',
          'accent-gold': '#FFD700',
          
          // Borders/States
        },
        // Wells Fargo Brand Colors
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#3b82f6', // Changed to blue for better UI
          600: '#c53030',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Wells Fargo Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Professional Dark Theme (bolt.new inspired)
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // Main dark background
          900: '#111827', // Darker background
          950: '#0a0e1a', // Darkest background
        },
        // Dark theme colors (bolt.new inspired)
        'dark-bg': '#0a0e1a',
        'dark-surface': '#111827',
        'dark-hover': '#1f2937',
        'dark-border': '#374151',
        'dark-text-primary': '#f9fafb',
        'dark-text-secondary': '#d1d5db',
        'wells-red': '#d92d20',
        'wells-gold': '#f59e0b',
        // Success, Warning, Error
      }
      width: {
        'card': '28rem',
      },
      width: {
        'card': '28rem',
      },
      borderRadius: {
        'card': '1.25rem',
      },
      boxShadow: {
        'wells': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'wells-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'wells-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'bolt': '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 8px 16px -8px rgba(0, 0, 0, 0.6)',
        'bolt-lg': '0 32px 64px -12px rgba(0, 0, 0, 0.9), 0 16px 32px -8px rgba(0, 0, 0, 0.7)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.4)',
      },
      borderRadius: {
        'wells': '0.75rem',
      },
      fontFamily: {
        'wells': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};