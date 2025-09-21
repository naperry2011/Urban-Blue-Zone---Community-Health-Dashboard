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
      className={`bg-white rounded-lg shadow-md border border-gray-100 p-6 transition-all duration-200 cursor-pointer min-h-[500px] w-full
        ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-lg hover:border-gray-200"}
        ${comparisonMode ? "border-2 border-gray-300" : ""}`}
      onClick={() => onSelect?.(cohort.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center min-w-0 flex-1">
          <div className="text-3xl mr-3 flex-shrink-0">{getIconForCohort(cohort.name)}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{cohort.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{metrics.memberCount} members</p>
          </div>
        </div>
        {comparisonMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(cohort.id)}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0 ml-3"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* UBZI Score Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex-1 max-w-[50%] overflow-hidden">
            <UBZIGauge
              value={metrics.avgUBZI}
              label="Avg UBZI"
              size="small"
              showTrend={false}
            />
          </div>
          <div className="flex-1 ml-4 min-w-0">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">7-Day Trend</div>
            <div className="bg-white rounded-md p-2 shadow-sm">
              <Sparkline
                data={trends.daily.map(t => ({ value: t.value }))}
                height={50}
                showTooltip={true}
              />
            </div>
            <div className="flex items-center justify-center mt-3">
              {metrics.ubziTrend !== 0 && (
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                  metrics.ubziTrend > 0
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}>
                  {metrics.ubziTrend > 0 ? "↗" : "↘"} {Math.abs(metrics.ubziTrend)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Alerts</div>
            <div className="text-xs text-gray-400">🚨</div>
          </div>
          <div className={`text-2xl font-bold ${getAlertColor(metrics.activeAlerts)} mb-1`}>
            {metrics.activeAlerts}
          </div>
          <div className="text-xs text-gray-500">
            {metrics.criticalAlerts} critical
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">vs System Avg</div>
            <div className="text-xs text-gray-400">📊</div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${
            vsSystem >= 0 ? "text-green-600" : "text-amber-600"
          }`}>
            {vsSystem >= 0 ? "+" : ""}{vsSystem.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {/* Key Health Metrics */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
          <span>Health Metrics</span>
          <span className="ml-2 text-gray-400">❤️</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600 font-medium flex items-center">
              <span className="text-red-500 mr-2">💓</span>
              Heart Rate
            </span>
            <span className="font-bold text-gray-900 text-lg">{metrics.avgHeartRate} bpm</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
            <span className="text-gray-600 font-medium flex items-center">
              <span className="text-blue-500 mr-2">🩸</span>
              Blood Pressure
            </span>
            <span className="font-bold text-gray-900 text-lg">
              {metrics.avgBloodPressure.systolic}/{metrics.avgBloodPressure.diastolic}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 font-medium flex items-center">
              <span className="text-green-500 mr-2">🏃</span>
              Movement Score
            </span>
            <span className="font-bold text-gray-900 text-lg">{metrics.avgMovementScore}%</span>
          </div>
        </div>
      </div>

      {/* Habit Completion Section */}
      <div className="pt-6 border-t-2 border-gray-200">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
          <span>Blue Zone Habits</span>
          <span className="ml-2 text-gray-400">🌿</span>
        </div>
        <div className="space-y-4">
          {Object.entries(metrics.habitCompletion).map(([habit, percentage]) => {
            const getHabitIcon = (habitName: string) => {
              switch (habitName) {
                case 'moai': return '👥';
                case 'ikigai': return '🎯';
                case 'hara_hachi_bu': return '🍽️';
                case 'plant_slant': return '🥬';
                case 'movement': return '🚶';
                default: return '✨';
              }
            };

            return (
              <div key={habit} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize flex items-center">
                    <span className="mr-2">{getHabitIcon(habit)}</span>
                    {habit.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-blue-500' :
                      percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CohortCard;