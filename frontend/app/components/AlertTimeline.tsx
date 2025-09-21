'use client';

import React, { useState } from 'react';
import { Alert } from '../types/residents';

interface AlertTimelineProps {
  alerts: Alert[];
  className?: string;
  onResolveAlert?: (alertId: string, notes: string) => void;
}

const AlertTimeline: React.FC<AlertTimelineProps> = ({
  alerts,
  className = '',
  onResolveAlert
}) => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info' | 'unresolved'>('all');

  // Filter alerts based on selected filter
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !alert.resolved;
    return alert.type === filter;
  });

  // Sort alerts by timestamp (most recent first)
  const sortedAlerts = [...filteredAlerts].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getAlertIcon = (alert: Alert) => {
    switch (alert.category) {
      case 'vitals':
        return '❤️';
      case 'habits':
        return '🏃';
      case 'system':
        return '⚙️';
      case 'wellness':
        return '🌟';
      default:
        return '📋';
    }
  };

  const getAlertColor = (alert: Alert) => {
    switch (alert.type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          dot: 'bg-red-500',
          icon: '🚨'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          dot: 'bg-yellow-500',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          dot: 'bg-blue-500',
          icon: 'ℹ️'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          dot: 'bg-gray-500',
          icon: '📋'
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getSeverityBadge = (severity: number) => {
    const badges = [
      { label: 'Low', color: 'bg-gray-100 text-gray-800' },
      { label: 'Minor', color: 'bg-blue-100 text-blue-800' },
      { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
      { label: 'High', color: 'bg-orange-100 text-orange-800' },
      { label: 'Critical', color: 'bg-red-100 text-red-800' }
    ];

    const badge = badges[severity - 1] || badges[0];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleResolveAlert = (alertId: string) => {
    if (onResolveAlert && resolutionNotes.trim()) {
      onResolveAlert(alertId, resolutionNotes);
      setSelectedAlert(null);
      setResolutionNotes('');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Alert History</h3>
          <p className="text-sm text-gray-600">
            {sortedAlerts.length} alerts • {sortedAlerts.filter(a => !a.resolved).length} unresolved
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All', count: alerts.length },
            { value: 'unresolved', label: 'Unresolved', count: alerts.filter(a => !a.resolved).length },
            { value: 'critical', label: 'Critical', count: alerts.filter(a => a.type === 'critical').length },
            { value: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning').length },
            { value: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as 'all' | 'critical' | 'warning' | 'info' | 'unresolved')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No alerts to show</h4>
          <p className="text-gray-600">
            {filter === 'all' ? 'This resident has no alerts.' : `No ${filter} alerts found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert, index) => {
            const colors = getAlertColor(alert);
            const isLast = index === sortedAlerts.length - 1;

            return (
              <div key={alert.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200" />
                )}

                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className={`relative flex-shrink-0 w-8 h-8 ${colors.dot} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{colors.icon}</span>
                  </div>

                  {/* Alert content */}
                  <div className={`flex-1 ${colors.bg} ${colors.border} border rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getAlertIcon(alert)}</span>
                        <div>
                          <h4 className={`font-medium ${colors.text}`}>{alert.message}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getSeverityBadge(alert.severity)}
                            <span className="text-xs text-gray-500 capitalize">
                              {alert.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center gap-2">
                        {alert.resolved ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            🔄 Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Alert description */}
                    {alert.description && (
                      <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                    )}

                    {/* Resolution info */}
                    {alert.resolved && alert.resolvedAt && (
                      <div className="bg-white bg-opacity-60 rounded p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-green-700">Resolved by:</span>
                          <span className="text-sm text-gray-700">{alert.resolvedBy || 'System'}</span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(alert.resolvedAt)}
                          </span>
                        </div>
                        {alert.resolutionNotes && (
                          <p className="text-sm text-gray-600 italic">&quot;{alert.resolutionNotes}&quot;</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons for unresolved alerts */}
                    {!alert.resolved && onResolveAlert && (
                      <div className="mt-3">
                        {selectedAlert === alert.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              placeholder="Add resolution notes..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                disabled={!resolutionNotes.trim()}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Mark Resolved
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAlert(null);
                                  setResolutionNotes('');
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAlert(alert.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.type === 'critical' && !a.resolved).length}
              </div>
              <div className="text-sm text-gray-600">Critical Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.type === 'warning' && !a.resolved).length}
              </div>
              <div className="text-sm text-gray-600">Warning Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.resolved).length}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((alerts.filter(a => a.resolved).length / alerts.length) * 100) || 0}%
              </div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertTimeline;