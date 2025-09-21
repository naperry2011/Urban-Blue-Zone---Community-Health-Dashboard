// Design tokens for consistent styling across the Urban Blue Zone application

export const colors = {
  // Primary brand colors
  primary: {
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

  // Blue Zone health colors
  health: {
    excellent: '#10b981', // Green for excellent health
    good: '#3b82f6',      // Blue for good health
    fair: '#f59e0b',      // Amber/orange for fair health
    poor: '#ef4444',      // Red for poor health
    critical: '#dc2626',  // Dark red for critical
  },

  // Cohort-specific colors
  cohorts: {
    senior: {
      primary: '#8b5cf6',   // Purple
      light: '#f3e8ff',
      dark: '#6d28d9',
    },
    adult: {
      primary: '#3b82f6',   // Blue
      light: '#dbeafe',
      dark: '#1d4ed8',
    },
    teen: {
      primary: '#10b981',   // Green
      light: '#d1fae5',
      dark: '#047857',
    },
    chronic: {
      primary: '#ef4444',   // Red
      light: '#fecaca',
      dark: '#dc2626',
    },
  },

  // UBZI score colors
  ubzi: {
    excellent: '#10b981', // 80-100
    good: '#3b82f6',      // 60-79
    fair: '#f59e0b',      // 40-59
    poor: '#ef4444',      // 20-39
    critical: '#dc2626',  // 0-19
  },

  // Alert severity colors
  alerts: {
    critical: '#dc2626',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#10b981',
  },

  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Menlo', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Utility functions for consistent styling
export const getUBZIColor = (score: number) => {
  if (score >= 80) return colors.ubzi.excellent;
  if (score >= 60) return colors.ubzi.good;
  if (score >= 40) return colors.ubzi.fair;
  if (score >= 20) return colors.ubzi.poor;
  return colors.ubzi.critical;
};

export const getUBZIBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-50';
  if (score >= 60) return 'bg-blue-50';
  if (score >= 40) return 'bg-yellow-50';
  if (score >= 20) return 'bg-orange-50';
  return 'bg-red-50';
};

export const getUBZITextColor = (score: number) => {
  if (score >= 80) return 'text-green-700';
  if (score >= 60) return 'text-blue-700';
  if (score >= 40) return 'text-yellow-700';
  if (score >= 20) return 'text-orange-700';
  return 'text-red-700';
};

export const getCohortColor = (cohort: string) => {
  switch (cohort) {
    case 'senior':
      return colors.cohorts.senior;
    case 'adult':
      return colors.cohorts.adult;
    case 'teen':
      return colors.cohorts.teen;
    case 'chronic':
      return colors.cohorts.chronic;
    default:
      return colors.primary;
  }
};

export const getAlertColor = (severity: 'critical' | 'warning' | 'info') => {
  return colors.alerts[severity];
};

// Component variants for consistent styling
export const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
};

export const cardVariants = {
  default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  elevated: 'bg-white border border-gray-200 rounded-lg shadow-md',
  interactive: 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer',
  success: 'bg-green-50 border border-green-200 rounded-lg',
  warning: 'bg-yellow-50 border border-yellow-200 rounded-lg',
  error: 'bg-red-50 border border-red-200 rounded-lg',
  info: 'bg-blue-50 border border-blue-200 rounded-lg',
};

export const badgeVariants = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

// Animation and transition utilities
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
};

// Responsive breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Accessibility utilities
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-offset-2';

export const srOnly = 'sr-only';

// Common class combinations
export const commonClasses = {
  // Buttons
  button: `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${focusRing} ${transitions.normal}`,
  iconButton: `inline-flex items-center justify-center rounded-md p-2 ${focusRing} ${transitions.normal}`,

  // Form elements
  input: `block w-full rounded-md border-gray-300 shadow-sm ${focusRing} focus:border-blue-500 focus:ring-blue-500`,
  select: `block w-full rounded-md border-gray-300 shadow-sm ${focusRing} focus:border-blue-500 focus:ring-blue-500`,

  // Cards
  card: `${cardVariants.default} p-6`,
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardBody: 'p-6',
  cardFooter: 'px-6 py-4 border-t border-gray-200',

  // Layout
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  section: 'py-8',

  // Text
  heading1: 'text-3xl font-bold text-gray-900',
  heading2: 'text-2xl font-semibold text-gray-900',
  heading3: 'text-lg font-semibold text-gray-900',
  bodyText: 'text-gray-600',
  caption: 'text-sm text-gray-500',
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  buttonVariants,
  cardVariants,
  badgeVariants,
  transitions,
  breakpoints,
  focusRing,
  srOnly,
  commonClasses,
  getUBZIColor,
  getUBZIBgColor,
  getUBZITextColor,
  getCohortColor,
  getAlertColor,
};