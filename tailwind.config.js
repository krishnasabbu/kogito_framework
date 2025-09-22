/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Wells Fargo Brand Colors
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#d92d20', // Wells Fargo Red
          600: '#c53030',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
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
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        // Text colors for dark theme
        'text-primary': '#f9fafb',
        'text-secondary': '#d1d5db',
        'text-muted': '#9ca3af',
        // Surface colors
        surface: '#f8fafc',
        'surface-dark': '#1e293b',
      },
      boxShadow: {
        'wells': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'wells-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'wells-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'wells': '0.5rem',
      },
      fontFamily: {
        'wells': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};