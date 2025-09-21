'use client';

import React, { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({
  text,
  children,
  position = 'top',
  className = ''
}: TooltipProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <div
        className={`absolute ${getPositionClasses()} px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none`}
        role="tooltip"
      >
        {text}
        <div
          className={`absolute w-0 h-0 border-4 border-transparent ${
            position === 'top'
              ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900'
              : position === 'bottom'
              ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900'
              : position === 'left'
              ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900'
              : 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
          }`}
        />
      </div>
    </div>
  );
}

export function InfoTooltip({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`inline-block group ${className}`}>
      <button
        type="button"
        className="ml-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
        aria-label="More information"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Tooltip text={text} position="top">
        <span />
      </Tooltip>
    </div>
  );
}