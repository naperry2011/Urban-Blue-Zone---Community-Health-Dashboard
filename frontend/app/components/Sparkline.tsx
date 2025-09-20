"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  Tooltip,
} from "recharts";

interface SparklineProps {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
  showTooltip?: boolean;
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = "#10b981",
  height = 40,
  showTooltip = false,
  strokeWidth = 2,
}) => {
  const trend = data.length > 1
    ? data[data.length - 1].value - data[0].value
    : 0;

  const trendColor = trend >= 0 ? color : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "12px",
            }}
            labelStyle={{ display: "none" }}
            formatter={(value: number) => [`${value}`, "UBZI"]}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={trendColor}
          strokeWidth={strokeWidth}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Sparkline;