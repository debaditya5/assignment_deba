"use client";

import { useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
import { toCsv, downloadCsv, downloadChartAsPdf } from "@lib/csv";
import { CleanKPIData } from "@lib/cleanKpiData";

type Props = {
  title: string;
  data: CleanKPIData[];
  average: number;
  unit: string;
  color: string;
};

export function CleanKPITimeline({ title, data, average, unit, color }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const formatValue = (value: number) => {
    return value.toFixed(1);
  };

  const generateYAxisTicks = () => {
    const dataValues = data.map(d => d.value);
    const minDataValue = Math.min(...dataValues);
    const maxDataValue = Math.max(...dataValues);
    const padding = (maxDataValue - minDataValue) * 0.1;
    const minValue = Math.max(0, minDataValue - padding);
    const maxValue = unit === "%" 
      ? Math.min(100, maxDataValue + padding)
      : maxDataValue + padding;
    
    const tickCount = 5;
    const step = (maxValue - minValue) / (tickCount - 1);
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      ticks.push(minValue + (step * i));
    }
    return ticks;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => downloadChartAsPdf(chartRef, `${title.toLowerCase().replace(/\s+/g, '-')}-timeline.pdf`)}
            aria-label="Download Chart"
          >
            Download Chart
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => downloadCsv(`${title.toLowerCase().replace(/\s+/g, '-')}-timeline.csv`, toCsv(data))}
            aria-label="Export CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div ref={chartRef} style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => formatValue(value)}
              domain={(() => {
                const dataValues = data.map(d => d.value);
                const minDataValue = Math.min(...dataValues);
                const maxDataValue = Math.max(...dataValues);
                const padding = (maxDataValue - minDataValue) * 0.1;
                const minValue = Math.max(0, minDataValue - padding);
                const maxValue = unit === "%" 
                  ? Math.min(100, maxDataValue + padding)
                  : maxDataValue + padding;
                return [minValue, maxValue];
              })()}
              ticks={generateYAxisTicks()}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              contentStyle={{ fontSize: 12 }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11 }}
            />
            
            {/* RED DOTTED LINE - TRUE MATHEMATICAL AVERAGE */}
            <ReferenceLine 
              y={average} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ 
                value: `TRUE AVG: ${formatValue(average)}${unit}`, 
                position: 'right', 
                fontSize: 10, 
                fill: '#ef4444',
                fontWeight: 'bold'
              }}
            />
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
