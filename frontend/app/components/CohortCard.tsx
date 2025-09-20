"use client";

import React from "react";
import { CohortCardProps } from "../types/cohorts";
import UBZIGauge from "./UBZIGauge";
import Sparkline from "./Sparkline";

const CohortCard: React.FC<CohortCardProps> = ({
  cohort,
  isSelected = false,
  onSelect,
  comparisonMode = false,
  systemAverage = 72,
}) => {
  const { metrics, trends } = cohort;
  const vsSystem = metrics.avgUBZI - systemAverage;

  const getAlertColor = (count: number) => {
    if (count === 0) return "text-green-600";
    if (count <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getIconForCohort = (name: string) => {
    switch (name.toLowerCase()) {
      case "seniors":
        return "👴";
      case "adults":
        return "👨";
      case "teens":
        return "👦";
      case "chronic conditions":
        return "❤️";
      default:
        return "👥";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 cursor-pointer
        ${isSelected ? "ring-2 ring-blue-500" : "hover:shadow-lg"}
        ${comparisonMode ? "border-2 border-gray-200" : ""}`}
      onClick={() => onSelect?.(cohort.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="text-3xl mr-3">{getIconForCohort(cohort.name)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{cohort.name}</h3>
            <p className="text-sm text-gray-500">{metrics.memberCount} members</p>
          </div>
        </div>
        {comparisonMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(cohort.id)}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* UBZI Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <UBZIGauge
            value={metrics.avgUBZI}
            label="Avg UBZI"
            size="small"
            showTrend={false}
          />
        </div>
        <div className="flex-1 ml-4">
          <div className="text-sm text-gray-600 mb-1">7-Day Trend</div>
          <Sparkline
            data={trends.daily.map(t => ({ value: t.value }))}
            height={50}
            showTooltip={true}
          />
          <div className="flex items-center mt-1">
            {metrics.ubziTrend !== 0 && (
              <>
                <span className={`text-sm font-medium ${
                  metrics.ubziTrend > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {metrics.ubziTrend > 0 ? "↑" : "↓"} {Math.abs(metrics.ubziTrend)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600">Active Alerts</div>
          <div className={`text-lg font-semibold ${getAlertColor(metrics.activeAlerts)}`}>
            {metrics.activeAlerts}
          </div>
          <div className="text-xs text-gray-500">
            {metrics.criticalAlerts} critical
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-xs text-gray-600">vs System Avg</div>
          <div className={`text-lg font-semibold ${
            vsSystem >= 0 ? "text-green-600" : "text-amber-600"
          }`}>
            {vsSystem >= 0 ? "+" : ""}{vsSystem.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {/* Key Health Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Avg Heart Rate</span>
          <span className="font-medium">{metrics.avgHeartRate} bpm</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Avg BP</span>
          <span className="font-medium">
            {metrics.avgBloodPressure.systolic}/{metrics.avgBloodPressure.diastolic}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Movement Score</span>
          <span className="font-medium">{metrics.avgMovementScore}%</span>
        </div>
      </div>

      {/* Habit Completion Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Habit Completion</div>
        <div className="space-y-1">
          {Object.entries(metrics.habitCompletion).map(([habit, percentage]) => (
            <div key={habit} className="flex items-center">
              <span className="text-xs text-gray-500 w-20 capitalize">
                {habit.replace(/_/g, " ")}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 ml-2">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CohortCard;