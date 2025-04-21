"use client";

import { useState } from "react";

export function Chart() {
  const [period, setPeriod] = useState<"1w" | "1m" | "3m" | "1y">("1m");
  
  // Would normally come from a data API
  const data = {
    "1w": [
      { day: "M", value: 75 },
      { day: "T", value: 60 },
      { day: "W", value: 80 },
      { day: "T", value: 65 },
      { day: "F", value: 90 },
      { day: "S", value: 70 },
      { day: "S", value: 55 },
    ],
    "1m": [
      { day: "W1", value: 65 },
      { day: "W2", value: 75 },
      { day: "W3", value: 45 },
      { day: "W4", value: 85 },
    ],
    "3m": [
      { day: "Jan", value: 50 },
      { day: "Feb", value: 65 },
      { day: "Mar", value: 80 },
    ],
    "1y": [
      { day: "Q1", value: 55 },
      { day: "Q2", value: 70 },
      { day: "Q3", value: 65 },
      { day: "Q4", value: 90 },
    ],
  };

  // Find the max value for scaling
  const maxValue = Math.max(...data[period].map(item => item.value));
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-center sm:justify-end space-x-2">
        {(["1w", "1m", "3m", "1y"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2 py-1 rounded text-xs ${
              period === p
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      
      <div className="h-40 sm:h-56 w-full">
        <div className="flex h-full items-end justify-between px-2">
          {data[period].map((item, index) => (
            <div key={index} className="flex h-full flex-col items-center justify-end">
              <div 
                className="w-5 sm:w-8 bg-blue-500 rounded-t-sm transition-all duration-300"
                style={{ 
                  height: `${(item.value / maxValue) * 80}%`,
                  opacity: 0.6 + (item.value / maxValue) * 0.4,
                }}
              />
              <div className="mt-2 text-[10px] sm:text-xs text-gray-500">{item.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 