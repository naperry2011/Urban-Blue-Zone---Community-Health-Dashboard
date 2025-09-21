// Accessibility utilities for the Urban Blue Zone application
import React from 'react';

// Screen reader only text utility
export const srOnly = 'sr-only';

// Focus management utilities
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
export const focusRingInset = 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500';

// ARIA live region utilities
export const liveRegions = {
  polite: 'aria-live="polite"',
  assertive: 'aria-live="assertive"',
  off: 'aria-live="off"',
};

// Common ARIA attributes
export const ariaAttributes = {
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),
  checked: (isChecked: boolean) => ({ 'aria-checked': isChecked }),
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),
  hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
  label: (label: string) => ({ 'aria-label': label }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  controls: (id: string) => ({ 'aria-controls': id }),
  current: (current: string) => ({ 'aria-current': current }),
  pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),
  invalid: (isInvalid: boolean) => ({ 'aria-invalid': isInvalid }),
  required: (isRequired: boolean) => ({ 'aria-required': isRequired }),
  live: (liveType: 'polite' | 'assertive' | 'off') => ({ 'aria-live': liveType }),
};

// Color contrast utilities
export const contrastColors = {
  // High contrast text combinations
  highContrast: {
    dark: 'text-gray-900',
    light: 'text-white',
  },
  // Medium contrast for secondary text
  mediumContrast: {
    dark: 'text-gray-700',
    light: 'text-gray-200',
  },
  // Light contrast for disabled or less important text
  lightContrast: {
    dark: 'text-gray-500',
    light: 'text-gray-400',
  },
};

// Keyboard navigation utilities
export const keyboardUtils = {
  // Standard keyboard event handlers
  handleEnterSpace: (callback: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },

  handleEscape: (callback: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  },

  handleArrowKeys: (callbacks: {
    up?: () => void;
    down?: () => void;
    left?: () => void;
    right?: () => void;
  }) => (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        callbacks.up?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        callbacks.down?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        callbacks.left?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        callbacks.right?.();
        break;
    }
  },
};

// Form accessibility utilities
export const formUtils = {
  // Generate unique IDs for form elements
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Error message attributes
  errorMessage: (fieldId: string, errorId: string, hasError: boolean) => ({
    id: errorId,
    role: 'alert',
    'aria-live': 'polite' as const,
    ...(hasError && { 'aria-describedby': errorId }),
  }),

  // Field wrapper attributes
  fieldWrapper: (fieldId: string, labelId: string, errorId: string, hasError: boolean) => ({
    id: fieldId,
    'aria-labelledby': labelId,
    'aria-invalid': hasError,
    ...(hasError && { 'aria-describedby': errorId }),
  }),
};

// Skip link utility - see SkipLink component for implementation

// Landmark roles for better screen reader navigation
export const landmarks = {
  main: { role: 'main' },
  navigation: { role: 'navigation' },
  banner: { role: 'banner' },
  contentinfo: { role: 'contentinfo' },
  complementary: { role: 'complementary' },
  search: { role: 'search' },
  region: { role: 'region' },
};

// Announcement utilities for screen readers
export const announcements = {
  // Create a live region for announcements
  createLiveRegion: (type: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', type);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    return liveRegion;
  },

  // Announce a message to screen readers
  announce: (message: string, type: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return;

    const liveRegion = document.querySelector(`[aria-live="${type}"]`) as HTMLElement;
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear the message after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  },
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
};

// Reduced motion preference detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Focus management hook
export const useFocusManagement = () => {
  const focusElementById = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
  };

  const focusFirstFocusableElement = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    focusElementById,
    focusFirstFocusableElement,
    trapFocus,
  };
};

// ARIA live region hook
export const useLiveRegion = () => {
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;

      // Clear the message after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const LiveRegion = React.useCallback(() => {
    return React.createElement('div', {
      ref: liveRegionRef,
      'aria-live': 'polite',
      'aria-atomic': 'true',
      className: 'sr-only'
    });
  }, []);

  return { announce, LiveRegion };
};

export default {
  srOnly,
  focusRing,
  focusRingInset,
  liveRegions,
  ariaAttributes,
  contrastColors,
  keyboardUtils,
  formUtils,
  landmarks,
  announcements,
  useHighContrastMode,
  useReducedMotion,
  useFocusManagement,
  useLiveRegion,
};