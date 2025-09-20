"use client";

import React, { useEffect, useState } from "react";

interface Alert {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  residentId: string;
  residentName: string;
  message: string;
  metric?: string;
  value?: number;
  threshold?: number;
  resolved: boolean;
}

interface AlertFeedProps {
  alerts: Alert[];
  maxAlerts?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  maxAlerts = 10,
  autoRefresh = true,
  refreshInterval = 15000,
}) => {
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setDisplayAlerts(alerts.slice(0, maxAlerts));
  }, [alerts, maxAlerts]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getSeverityBadge = (severity: Alert["severity"]) => {
    const styles = {
      critical: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[severity]}`}
      >
        {severity.toUpperCase()}
      </span>
    );
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Alert Feed</h3>
          <div className="flex items-center space-x-3">
            {autoRefresh && (
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  className="w-4 h-4 mr-1 animate-pulse text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Live</span>
              </div>
            )}
            <span className="text-sm text-gray-500">
              {displayAlerts.length} active
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No active alerts
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              All systems are operating normally
            </p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                alert.resolved ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.residentName}
                    </p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  {alert.metric && (
                    <p className="mt-1 text-xs text-gray-500">
                      {alert.metric}: {alert.value}
                      {alert.threshold && ` (threshold: ${alert.threshold})`}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {getTimeAgo(alert.timestamp)}
                    </p>
                    {alert.resolved && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {displayAlerts.length > 5 && (
        <div className="px-6 py-3 bg-gray-50 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertFeed;