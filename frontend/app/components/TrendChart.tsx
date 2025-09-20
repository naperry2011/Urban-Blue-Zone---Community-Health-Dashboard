"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface TrendChartProps {
  data: Array<{
    date: string;
    value: number;
    cohortAvg?: number;
  }>;
  title?: string;
  height?: number;
  showCohortComparison?: boolean;
  type?: "line" | "area";
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title = "UBZI Trend",
  height = 300,
  showCohortComparison = false,
  type = "line",
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const filterDataByRange = (range: string) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return data.slice(-days);
  };

  const filteredData = filterDataByRange(timeRange);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === "area" ? AreaChart : LineChart;
  const DataComponent = type === "area" ? Area : Line;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as "7d" | "30d" | "90d")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={filteredData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <DataComponent
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={type === "area" ? 0.3 : 0}
            name="UBZI Score"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {showCohortComparison && (
            <DataComponent
              type="monotone"
              dataKey="cohortAvg"
              stroke="#10b981"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={type === "area" ? 0.3 : 0}
              name="Cohort Average"
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          )}

          {[40, 70].map((threshold) => (
            <line
              key={threshold}
              x1={0}
              y1={threshold}
              x2="100%"
              y2={threshold}
              stroke={threshold === 40 ? "#f59e0b" : "#10b981"}
              strokeDasharray="3 3"
              opacity={0.5}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-gray-500">Current</p>
          <p className="text-2xl font-semibold text-gray-900">
            {filteredData[filteredData.length - 1]?.value || 0}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Average</p>
          <p className="text-2xl font-semibold text-gray-900">
            {Math.round(
              filteredData.reduce((sum, d) => sum + d.value, 0) / filteredData.length
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Change</p>
          <p
            className={`text-2xl font-semibold ${
              filteredData[filteredData.length - 1]?.value >
              filteredData[0]?.value
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {filteredData.length > 1
              ? `${
                  filteredData[filteredData.length - 1]?.value >
                  filteredData[0]?.value
                    ? "+"
                    : ""
                }${Math.round(
                  ((filteredData[filteredData.length - 1]?.value -
                    filteredData[0]?.value) /
                    filteredData[0]?.value) *
                    100
                )}%`
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;