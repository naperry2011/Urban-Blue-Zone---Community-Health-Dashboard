'use client';

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'chart';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  variant = 'rect',
  width,
  height,
  count = 1,
  className = ''
}: SkeletonLoaderProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circle':
        return 'rounded-full';
      case 'card':
        return 'h-48 rounded-lg';
      case 'chart':
        return 'h-64 rounded-lg';
      default:
        return 'rounded-md';
    }
  };

  const renderSkeleton = () => {
    const baseClasses = `bg-gray-200 animate-pulse ${getVariantStyles()} ${className}`;
    const style: React.CSSProperties = {};

    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return <div className={baseClasses} style={style} />;
  };

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    );
  }

  return renderSkeleton();
}

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <SkeletonLoader variant="circle" width={48} height={48} />
      <div className="flex-1">
        <SkeletonLoader variant="text" width="75%" className="mb-2" />
        <SkeletonLoader variant="text" width="50%" height="h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonLoader variant="text" />
      <SkeletonLoader variant="text" width="66%" />
    </div>
  </div>
);

export const SkeletonDashboardCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white overflow-hidden shadow rounded-lg animate-pulse ${className}`}>
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="rounded-md bg-gray-200 p-3 w-12 h-12" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <SkeletonLoader variant="text" width="60%" className="mb-2" />
          <SkeletonLoader height={32} width="40%" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonChartCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
    <SkeletonLoader variant="text" width="25%" className="mb-4" />
    <SkeletonLoader variant="chart" />
  </div>
);