"use client";

import React, { useState } from "react";

interface DateRangePickerProps {
  onDateChange: (start: Date, end: Date, preset?: string) => void;
  initialPreset?: "7d" | "30d" | "90d" | "custom";
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onDateChange,
  initialPreset = "7d",
}) => {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (preset: "7d" | "30d" | "90d" | "custom") => {
    setSelectedPreset(preset);

    if (preset === "custom") {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const end = new Date();
    const start = new Date();

    switch (preset) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
    }

    onDateChange(start, end, preset);
  };

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      onDateChange(new Date(customStart), new Date(customEnd), "custom");
    }
  };

  const presets = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset.value as "7d" | "30d" | "90d" | "custom")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPreset === preset.value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomDateChange}
            disabled={!customStart || !customEnd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;