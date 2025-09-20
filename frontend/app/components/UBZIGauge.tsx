"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface UBZIGaugeProps {
  value: number;
  label?: string;
  size?: "small" | "medium" | "large";
  showTrend?: boolean;
  trendValue?: number;
}

const UBZIGauge: React.FC<UBZIGaugeProps> = ({
  value,
  label = "UBZI Score",
  size = "medium",
  showTrend = true,
  trendValue = 0,
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const getColor = (val: number) => {
    if (val < 40) return "#ef4444";
    if (val < 70) return "#f59e0b";
    return "#10b981";
  };

  const sizeConfig = {
    small: { width: 150, height: 150, fontSize: "text-2xl" },
    medium: { width: 250, height: 250, fontSize: "text-4xl" },
    large: { width: 350, height: 350, fontSize: "text-6xl" },
  };

  const config = sizeConfig[size];
  const color = getColor(normalizedValue);

  const data = [
    { name: "value", value: normalizedValue },
    { name: "remainder", value: 100 - normalizedValue },
  ];

  const renderCustomLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className={`fill-current ${config.fontSize} font-bold`}
        style={{ fill: color }}
      >
        {Math.round(normalizedValue)}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={config.width} height={config.height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`${config.fontSize} font-bold`} style={{ color }}>
              {Math.round(normalizedValue)}
            </div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        </div>
      </div>

      {showTrend && trendValue !== 0 && (
        <div className="flex items-center mt-2">
          <svg
            className={`w-4 h-4 mr-1 ${
              trendValue > 0 ? "text-green-500" : "text-red-500"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {trendValue > 0 ? (
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <span
            className={`text-sm font-medium ${
              trendValue > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(trendValue)}% from yesterday
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center space-x-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span className="text-gray-600">Low (&lt;40)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-gray-600">Moderate (40-70)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span className="text-gray-600">Good (&gt;70)</span>
        </div>
      </div>
    </div>
  );
};

export default UBZIGauge;