'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResidents } from '../../hooks/useResident';
import { ResidentListItem } from '../../types/residents';
import EmptyState from '../../components/EmptyState';
import { SkeletonCard } from '../../components/SkeletonLoader';

export default function ResidentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'ubzi' | 'alerts' | 'lastActivity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { residents, total, isLoading, error, refresh } = useResidents();

  // Filter and sort residents locally for now
  const filteredAndSortedResidents = React.useMemo(() => {
    const filtered = residents.filter((resident: ResidentListItem) => {
      const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCohort = selectedCohorts.length === 0 || selectedCohorts.includes(resident.cohort);
      return matchesSearch && matchesCohort;
    });

    filtered.sort((a, b) => {
      let aVal: string | number | Date = a[sortBy];
      let bVal: string | number | Date = b[sortBy];

      if (sortBy === 'lastActivity') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [residents, searchTerm, selectedCohorts, sortBy, sortOrder]);

  const getCohortIcon = (cohort: string) => {
    switch (cohort) {
      case 'senior': return '👴';
      case 'adult': return '👨';
      case 'teen': return '👦';
      case 'chronic': return '❤️';
      default: return '👤';
    }
  };

  const getCohortLabel = (cohort: string) => {
    switch (cohort) {
      case 'senior': return 'Senior (65+)';
      case 'adult': return 'Adult (25-64)';
      case 'teen': return 'Teen (13-24)';
      case 'chronic': return 'Chronic Conditions';
      default: return 'Unknown';
    }
  };

  const getUBZIColor = (ubzi: number) => {
    if (ubzi >= 80) return 'text-green-600 bg-green-50';
    if (ubzi >= 60) return 'text-blue-600 bg-blue-50';
    if (ubzi >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const cohortOptions = [
    { value: 'senior', label: 'Senior (65+)', icon: '👴' },
    { value: 'adult', label: 'Adult (25-64)', icon: '👨' },
    { value: 'teen', label: 'Teen (13-24)', icon: '👦' },
    { value: 'chronic', label: 'Chronic Conditions', icon: '❤️' }
  ];

  if (error) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Residents</h1>
          <p className="text-gray-600 mb-6">There was an error loading the resident data.</p>
          <button
            onClick={() => refresh()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Residents</h1>
            <p className="mt-2 text-sm text-gray-600">
              Individual resident profiles and detailed metrics • {filteredAndSortedResidents.length} of {total} residents
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cohort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cohorts</label>
            <div className="flex flex-wrap gap-2">
              {cohortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedCohorts(prev =>
                      prev.includes(option.value)
                        ? prev.filter(c => c !== option.value)
                        : [...prev, option.value]
                    );
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                    selectedCohorts.includes(option.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'ubzi' | 'alerts' | 'lastActivity')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="age">Age</option>
              <option value="ubzi">UBZI Score</option>
              <option value="alerts">Alert Count</option>
              <option value="lastActivity">Last Activity</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setSortOrder('asc')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  sortOrder === 'asc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ↑ Asc
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  sortOrder === 'desc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                ↓ Desc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Residents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredAndSortedResidents.length === 0 ? (
        <EmptyState
          icon={
            <div className="text-6xl mb-2">🔍</div>
          }
          title="No residents found"
          description={
            searchTerm || selectedCohorts.length > 0
              ? 'Try adjusting your search criteria or clearing filters.'
              : 'No residents are currently registered in the system.'
          }
          actionLabel={searchTerm || selectedCohorts.length > 0 ? "Clear Filters" : undefined}
          onAction={searchTerm || selectedCohorts.length > 0 ? () => {
            setSearchTerm('');
            setSelectedCohorts([]);
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedResidents.map((resident) => (
            <Link
              key={resident.id}
              href={`/dashboard/residents/${resident.id}`}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer card-hover animate-fade-in"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {resident.profileImage ? (
                    <img
                      src={resident.profileImage}
                      alt={resident.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-medium text-gray-600">
                      {resident.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{resident.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>{getCohortIcon(resident.cohort)}</span>
                    <span>Age {resident.age}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* UBZI Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UBZI Score</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getUBZIColor(resident.currentUBZI)}`}>
                      {resident.currentUBZI}
                    </span>
                    <span className="text-sm">{getTrendIcon(resident.ubziTrend)}</span>
                  </div>
                </div>

                {/* Alerts */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alerts</span>
                  <div className="flex items-center gap-2">
                    {resident.criticalAlerts > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {resident.criticalAlerts} Critical
                      </span>
                    )}
                    <span className="text-sm text-gray-900">{resident.alertCount} total</span>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Activity</span>
                  <span className="text-sm text-gray-900">
                    {new Date(resident.lastActivity).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* View Profile Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <span className="text-sm text-blue-600 font-medium">View Profile →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}