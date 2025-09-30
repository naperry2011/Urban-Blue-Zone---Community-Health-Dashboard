'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResident } from '../../../hooks/useResident';
import { TimeRange } from '../../../types/residents';
import VitalSignsChart from '../../../components/VitalSignsChart';
import HabitStreakVisualizer from '../../../components/HabitStreakVisualizer';
import AlertTimeline from '../../../components/AlertTimeline';
import UBZIGauge from '../../../components/UBZIGauge';

export default function ResidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const residentId = params.id as string;
  const [timeRange, setTimeRange] = useState<TimeRange['period']>('7d');

  const { resident, vitalsHistory, habitsHistory, isLoading, error, refresh } = useResident({
    residentId,
    timeRange
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Resident Not Found</h1>
          <p className="text-gray-600 mb-6">
            The resident you&apos;re looking for doesn&apos;t exist or there was an error loading their data.
          </p>
          <button
            onClick={() => router.push('/dashboard/residents')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Residents
          </button>
        </div>
      </div>
    );
  }

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

  const getUBZITrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange['period']) => {
    setTimeRange(newTimeRange);
  };

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/dashboard/residents')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Residents
          </button>
          <button
            onClick={() => refresh()}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {resident.profileImage ? (
                <img
                  src={resident.profileImage}
                  alt={resident.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {resident.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{resident.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  {getCohortIcon(resident.cohort)} {getCohortLabel(resident.cohort)}
                </span>
                <span>Age {resident.age}</span>
                <span className="capitalize">{resident.gender}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ID: {resident.id} • Enrolled: {new Date(resident.enrollmentDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{resident.metrics.currentUBZI}</div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                UBZI {getUBZITrendIcon(resident.metrics.ubziTrend)}
                <span className={`text-xs ${
                  resident.metrics.ubziChange > 0 ? 'text-green-600' :
                  resident.metrics.ubziChange < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {resident.metrics.ubziChange > 0 ? '+' : ''}{resident.metrics.ubziChange}%
                </span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {resident.metrics.currentVitals.bloodPressure.systolic}/
                {resident.metrics.currentVitals.bloodPressure.diastolic}
              </div>
              <div className="text-sm text-gray-600">Blood Pressure</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {resident.metrics.currentVitals.heartRate}
              </div>
              <div className="text-sm text-gray-600">Heart Rate (bpm)</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {resident.metrics.alertCount.unresolved}
              </div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-6">
          {/* UBZI Gauge */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Urban Blue Zone Index</h3>
            <div className="flex justify-center">
              <UBZIGauge
                value={resident.metrics.currentUBZI}
                size="large"
                showTrend={true}
              />
            </div>
          </div>

          {/* Vital Signs Chart */}
          {vitalsHistory && (
            <VitalSignsChart
              data={vitalsHistory}
              onTimeRangeChange={handleTimeRangeChange}
            />
          )}

          {/* Habit Tracking */}
          {habitsHistory && (
            <HabitStreakVisualizer
              streaks={resident.metrics.habitStreaks}
              habitsHistory={habitsHistory}
              currentHabits={resident.metrics.currentHabits}
              onTimeRangeChange={handleTimeRangeChange}
            />
          )}
        </div>

        {/* Right Column - Info & Alerts */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-sm text-gray-900">{resident.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                <p className="text-sm text-gray-900">{resident.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{resident.emergencyContact.phone}</p>
                <p className="text-sm text-gray-600">{resident.emergencyContact.relationship}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Primary Physician</label>
                <p className="text-sm text-gray-900">{resident.medicalInfo.primaryPhysician}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Conditions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resident.medicalInfo.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Medications</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resident.medicalInfo.medications.map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Allergies</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resident.medicalInfo.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Vitals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Vitals</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Heart Rate</span>
                <span className="text-sm font-medium">{resident.metrics.currentVitals.heartRate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Blood Pressure</span>
                <span className="text-sm font-medium">
                  {resident.metrics.currentVitals.bloodPressure.systolic}/
                  {resident.metrics.currentVitals.bloodPressure.diastolic} mmHg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className="text-sm font-medium">{resident.metrics.currentVitals.temperature}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Oxygen Level</span>
                <span className="text-sm font-medium">{resident.metrics.currentVitals.oxygenLevel}%</span>
              </div>
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(resident.metrics.currentVitals.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Timeline - Full Width */}
      <div className="mt-6">
        <AlertTimeline
          alerts={resident.recentAlerts}
          onResolveAlert={(alertId, notes) => {
            console.log('Resolving alert:', alertId, notes);
            // In a real app, this would call an API to resolve the alert
            refresh();
          }}
        />
      </div>
    </div>
  );
}