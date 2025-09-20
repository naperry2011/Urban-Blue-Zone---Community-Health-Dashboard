"use client";

import React, { useState, useEffect } from "react";
import { useCohorts } from "../../hooks/useCohorts";
import { Cohort } from "../../types/cohorts";
import CohortCard from "../../components/CohortCard";
import DateRangePicker from "../../components/DateRangePicker";
import CohortFilter from "../../components/CohortFilter";

export default function CohortsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [filteredCohorts, setFilteredCohorts] = useState<Cohort[]>([]);

  const { cohorts, systemStats, isLoading, isError } = useCohorts({
    dateRange,
    sortBy,
  });

  // Initialize selected cohorts when data loads
  useEffect(() => {
    if (cohorts.length > 0 && selectedCohorts.length === 0) {
      setSelectedCohorts(cohorts.map(c => c.id));
    }
  }, [cohorts, selectedCohorts.length]);

  // Filter cohorts based on selection
  useEffect(() => {
    if (selectedCohorts.length > 0) {
      setFilteredCohorts(cohorts.filter(c => selectedCohorts.includes(c.id)));
    } else {
      setFilteredCohorts(cohorts);
    }
  }, [cohorts, selectedCohorts]);

  const handleDateChange = (start: Date, end: Date, preset?: string) => {
    setDateRange(preset || "custom");
  };

  const handleSortChange = (newSortBy: string, _order: "asc" | "desc") => {
    setSortBy(newSortBy);
  };

  const handleCohortSelect = (cohortId: string) => {
    if (comparisonMode) {
      setSelectedCohorts(prev =>
        prev.includes(cohortId)
          ? prev.filter(id => id !== cohortId)
          : [...prev, cohortId]
      );
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(filteredCohorts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `cohort-data-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isError) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load cohort data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cohort Analysis</h1>
        <p className="mt-2 text-sm text-gray-600">
          Compare wellness metrics across different population groups
        </p>
      </div>

      {/* System Statistics */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Residents</div>
            <div className="text-2xl font-bold text-gray-900">
              {systemStats.totalResidents}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">System Average UBZI</div>
            <div className="text-2xl font-bold text-blue-600">
              {systemStats.avgSystemUBZI}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Active Alerts</div>
            <div className="text-2xl font-bold text-yellow-600">
              {systemStats.totalAlerts}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
            <div className="text-2xl font-bold text-red-600">
              {systemStats.criticalAlerts}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="space-y-4">
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <DateRangePicker
              onDateChange={handleDateChange}
              initialPreset={dateRange as "7d" | "30d" | "90d" | "custom"}
            />
          </div>

          {/* Cohort Filter and Sort */}
          <div className="flex items-center justify-between">
            <CohortFilter
              cohorts={cohorts}
              selectedCohorts={selectedCohorts}
              onFilterChange={setSelectedCohorts}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  comparisonMode
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {comparisonMode ? "Exit Comparison" : "Compare Cohorts"}
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading cohort data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              cohort={cohort}
              isSelected={comparisonMode && selectedCohorts.includes(cohort.id)}
              onSelect={handleCohortSelect}
              comparisonMode={comparisonMode}
              systemAverage={systemStats.avgSystemUBZI}
            />
          ))}
        </div>
      )}

      {/* Comparison Summary (shown in comparison mode) */}
      {comparisonMode && selectedCohorts.length > 1 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Comparison Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCohorts
              .filter(c => selectedCohorts.includes(c.id))
              .map(cohort => (
                <div key={cohort.id} className="bg-white rounded p-3">
                  <div className="font-medium text-gray-900">{cohort.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    UBZI: {cohort.metrics.avgUBZI} | Alerts: {cohort.metrics.activeAlerts}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}