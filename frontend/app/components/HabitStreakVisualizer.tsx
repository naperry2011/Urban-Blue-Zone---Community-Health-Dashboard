'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { HabitStreak, HabitsChartData, HabitMetrics, TimeRange } from '../types/residents';

interface HabitStreakVisualizerProps {
  streaks: HabitStreak[];
  habitsHistory: HabitsChartData;
  currentHabits: HabitMetrics;
  onTimeRangeChange: (timeRange: TimeRange['period']) => void;
  className?: string;
}

const HabitStreakVisualizer: React.FC<HabitStreakVisualizerProps> = ({
  streaks,
  habitsHistory,
  currentHabits,
  onTimeRangeChange,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'streaks' | 'trends' | 'overview'>('overview');

  const timeRangeOptions: { value: TimeRange['period']; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  // Habit configuration with icons and colors
  const habitConfig = {
    movement: {
      icon: '🚶',
      name: 'Movement Score',
      color: '#3b82f6',
      unit: '%',
      target: 80,
      current: currentHabits.movementScore
    },
    plant_slant: {
      icon: '🥗',
      name: 'Plant-Based Meals',
      color: '#10b981',
      unit: '%',
      target: 75,
      current: currentHabits.plantSlantPercentage
    },
    social: {
      icon: '👥',
      name: 'Social Interactions',
      color: '#8b5cf6',
      unit: ' daily',
      target: 3,
      current: currentHabits.socialInteractions
    },
    purpose: {
      icon: '🎯',
      name: 'Purpose Pulse',
      color: '#f59e0b',
      unit: '/10',
      target: 8,
      current: currentHabits.purposePulse
    },
    stress: {
      icon: '😌',
      name: 'Stress Level',
      color: '#ef4444',
      unit: '/10',
      target: 4,
      current: currentHabits.stressLevel,
      inverted: true // Lower is better
    },
    meditation: {
      icon: '🧘',
      name: 'Meditation',
      color: '#6366f1',
      unit: ' min',
      target: 20,
      current: currentHabits.meditationMinutes
    },
    sleep: {
      icon: '😴',
      name: 'Sleep',
      color: '#14b8a6',
      unit: ' hrs',
      target: 8,
      current: currentHabits.sleepHours
    }
  };

  // Prepare streak data for visualization
  const streakData = streaks.map(streak => ({
    habit: habitConfig[streak.habitType]?.name || streak.habitType,
    icon: habitConfig[streak.habitType]?.icon || '📊',
    current: streak.currentStreak,
    longest: streak.longestStreak,
    completion: streak.weeklyCompletion,
    color: habitConfig[streak.habitType]?.color || '#6b7280'
  }));

  // Prepare trends data
  const trendsData = habitsHistory.data.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    movement: day.movementScore,
    plantSlant: day.plantSlantPercentage,
    social: day.socialInteractions * 10, // Scale for visibility
    purpose: day.purposePulse * 10,
    stress: (10 - day.stressLevel) * 10, // Invert stress (higher is better)
    meditation: (day.meditationMinutes / 60) * 100, // Convert to percentage
    sleep: (day.sleepHours / 12) * 100 // Convert to percentage
  }));

  // Current habits overview data
  const overviewData = Object.entries(habitConfig).map(([key, config]) => {
    const progress = config.inverted
      ? ((10 - config.current) / (10 - config.target)) * 100
      : (config.current / config.target) * 100;

    return {
      name: config.name,
      icon: config.icon,
      current: config.current,
      target: config.target,
      unit: config.unit,
      progress: Math.min(100, Math.max(0, progress)),
      color: config.color,
      status: progress >= 80 ? 'excellent' : progress >= 60 ? 'good' : progress >= 40 ? 'fair' : 'needs_improvement'
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderStreaksView = () => (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={streakData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="habit"
            stroke="#666"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="current" name="Current Streak" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="longest" name="Longest Streak" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {streakData.map((streak, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{streak.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{streak.habit}</h4>
                <p className="text-sm text-gray-500">{streak.completion}% weekly completion</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current streak:</span>
                <span className="font-semibold" style={{ color: streak.color }}>
                  {streak.current} days
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Personal best:</span>
                <span className="font-semibold text-gray-600">
                  {streak.longest} days
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrendsView = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                habitsHistory.timeRange.period === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${option.value !== timeRangeOptions[timeRangeOptions.length - 1].value ? 'border-r border-gray-300' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={trendsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="movement" stroke="#3b82f6" name="Movement" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="plantSlant" stroke="#10b981" name="Plant-Based" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="purpose" stroke="#f59e0b" name="Purpose" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Calm" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderOverviewView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progress bars */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-4">Today&apos;s Progress</h4>
        {overviewData.map((habit, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{habit.icon}</span>
                <span className="text-sm font-medium text-gray-700">{habit.name}</span>
              </div>
              <span className="text-sm text-gray-600">
                {habit.current}{habit.unit} / {habit.target}{habit.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${habit.progress}%`,
                  backgroundColor: habit.color
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${
                habit.status === 'excellent' ? 'bg-green-100 text-green-800' :
                habit.status === 'good' ? 'bg-blue-100 text-blue-800' :
                habit.status === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {habit.status === 'excellent' ? '🌟 Excellent' :
                 habit.status === 'good' ? '✅ Good' :
                 habit.status === 'fair' ? '⚠️ Fair' :
                 '🔄 Needs Improvement'}
              </span>
              <span className="text-xs text-gray-500">{Math.round(habit.progress)}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-4">Weekly Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {streaks.filter(s => s.currentStreak >= 7).length}
            </div>
            <div className="text-sm text-gray-600">Habits on track</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(streaks.reduce((sum, s) => sum + s.weeklyCompletion, 0) / streaks.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg completion</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...streaks.map(s => s.currentStreak))}
            </div>
            <div className="text-sm text-gray-600">Best streak</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {overviewData.filter(h => h.status === 'excellent' || h.status === 'good').length}
            </div>
            <div className="text-sm text-gray-600">Goals met today</div>
          </div>
        </div>

        {/* Blue Zone Score */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h5 className="font-semibold text-gray-900 mb-2">Blue Zone Habits Score</h5>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round(overviewData.reduce((sum, h) => sum + h.progress, 0) / overviewData.length)}%
          </div>
          <div className="text-sm text-gray-600">
            Based on movement, plant-based eating, stress management, and social connections
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header with view selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Blue Zone Habits</h3>

        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'streaks', label: 'Streaks' },
            { value: 'trends', label: 'Trends' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedView(option.value as 'overview' | 'streaks' | 'trends')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                selectedView === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${option.value !== 'trends' ? 'border-r border-gray-300' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && renderOverviewView()}
      {selectedView === 'streaks' && renderStreaksView()}
      {selectedView === 'trends' && renderTrendsView()}
    </div>
  );
};

export default HabitStreakVisualizer;