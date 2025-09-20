"use client";

import React, { useState } from "react";

interface CohortFilterProps {
  cohorts: Array<{ id: string; name: string }>;
  selectedCohorts: string[];
  onFilterChange: (selectedIds: string[]) => void;
  sortBy: string;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

const CohortFilter: React.FC<CohortFilterProps> = ({
  cohorts,
  selectedCohorts,
  onFilterChange,
  sortBy,
  onSortChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleCohortToggle = (cohortId: string) => {
    const updated = selectedCohorts.includes(cohortId)
      ? selectedCohorts.filter((id) => id !== cohortId)
      : [...selectedCohorts, cohortId];
    onFilterChange(updated);
  };

  const handleSelectAll = () => {
    onFilterChange(cohorts.map((c) => c.id));
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const handleSortChange = (newSortBy: string) => {
    const newOrder = sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    onSortChange(newSortBy, newOrder);
  };

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "ubzi", label: "UBZI Score" },
    { value: "alerts", label: "Active Alerts" },
    { value: "members", label: "Member Count" },
  ];

  return (
    <div className="flex items-center space-x-4">
      {/* Cohort Multi-Select */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span>
            Filter Cohorts
            {selectedCohorts.length > 0 && ` (${selectedCohorts.length})`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              showDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-2 border-b border-gray-200">
              <div className="flex justify-between">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {cohorts.map((cohort) => (
                <label
                  key={cohort.id}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCohorts.includes(cohort.id)}
                    onChange={() => handleCohortToggle(cohort.id)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cohort.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Sort by:</span>
        <div className="flex space-x-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center space-x-2 border-l pl-4">
        <span className="text-sm text-gray-600">Quick filters:</span>
        <button
          onClick={() => onFilterChange(["seniors", "adults", "teens"])}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200"
        >
          Age Groups
        </button>
        <button
          onClick={() => onFilterChange(["chronic"])}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200"
        >
          At Risk
        </button>
      </div>
    </div>
  );
};

export default CohortFilter;