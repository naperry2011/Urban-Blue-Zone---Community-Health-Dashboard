'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { VitalsChartData, TimeRange } from '../types/residents';

interface VitalSignsChartProps {
  data: VitalsChartData;
  onTimeRangeChange: (timeRange: TimeRange['period']) => void;
  className?: string;
}

const VitalSignsChart: React.FC<VitalSignsChartProps> = ({
  data,
  onTimeRangeChange,
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'heartRate' | 'bloodPressure' | 'temperature' | 'oxygen'>('all');

  const timeRangeOptions: { value: TimeRange['period']; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Vitals' },
    { value: 'heartRate', label: 'Heart Rate' },
    { value: 'bloodPressure', label: 'Blood Pressure' },
    { value: 'temperature', label: 'Temperature' },
    { value: 'oxygen', label: 'Oxygen Level' }
  ];

  // Format data for chart display
  const chartData = data.data.map(item => ({
    ...item,
    time: data.timeRange.period === '24h'
      ? new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bloodPressure: item.systolic, // For single line display
    bloodPressureLow: item.diastolic
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'heartRate' && ' bpm'}
              {entry.dataKey === 'systolic' && ' mmHg'}
              {entry.dataKey === 'diastolic' && ' mmHg'}
              {entry.dataKey === 'temperature' && '°F'}
              {entry.dataKey === 'oxygenLevel' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render different chart configurations based on selected metric
  const renderChart = () => {
    if (selectedMetric === 'heartRate') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              domain={[50, 120]}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={60} stroke="#ff6b6b" strokeDasharray="2 2" label="Low" />
            <ReferenceLine y={100} stroke="#ff6b6b" strokeDasharray="2 2" label="High" />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Heart Rate (bpm)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (selectedMetric === 'bloodPressure') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              domain={[60, 180]}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={120} stroke="#ff6b6b" strokeDasharray="2 2" label="Systolic Normal" />
            <ReferenceLine y={80} stroke="#fbbf24" strokeDasharray="2 2" label="Diastolic Normal" />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#ef4444"
              strokeWidth={2}
              name="Systolic (mmHg)"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Diastolic (mmHg)"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (selectedMetric === 'temperature') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              domain={[97, 102]}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={98.6} stroke="#10b981" strokeDasharray="2 2" label="Normal" />
            <ReferenceLine y={100.4} stroke="#ff6b6b" strokeDasharray="2 2" label="Fever" />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Temperature (°F)"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (selectedMetric === 'oxygen') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#666"
              fontSize={12}
            />
            <YAxis
              domain={[90, 100]}
              stroke="#666"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={95} stroke="#ff6b6b" strokeDasharray="2 2" label="Low" />
            <Line
              type="monotone"
              dataKey="oxygenLevel"
              stroke="#10b981"
              strokeWidth={2}
              name="Oxygen Level (%)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // All vitals view
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            yAxisId="left"
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#666"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="heartRate"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Heart Rate"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="systolic"
            stroke="#ef4444"
            strokeWidth={2}
            name="Systolic BP"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="Temperature"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="oxygenLevel"
            stroke="#10b981"
            strokeWidth={2}
            name="Oxygen Level"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Metric selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {metricOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Time range selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            {timeRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  data.timeRange.period === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${option.value !== timeRangeOptions[timeRangeOptions.length - 1].value ? 'border-r border-gray-300' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(chartData.reduce((sum, item) => sum + item.heartRate, 0) / chartData.length)}
          </div>
          <div className="text-sm text-gray-600">Avg HR (bpm)</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {Math.round(chartData.reduce((sum, item) => sum + item.systolic, 0) / chartData.length)}/
            {Math.round(chartData.reduce((sum, item) => sum + item.diastolic, 0) / chartData.length)}
          </div>
          <div className="text-sm text-gray-600">Avg BP (mmHg)</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {(chartData.reduce((sum, item) => sum + item.temperature, 0) / chartData.length).toFixed(1)}°F
          </div>
          <div className="text-sm text-gray-600">Avg Temp</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(chartData.reduce((sum, item) => sum + item.oxygenLevel, 0) / chartData.length)}%
          </div>
          <div className="text-sm text-gray-600">Avg O2</div>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsChart;