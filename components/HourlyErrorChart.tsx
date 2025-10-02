"use client";

import { useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid } from "recharts";
import { Tooltip } from "@components/atoms/Tooltip";
import { toCsv, downloadCsv, downloadChartAsPdf } from "@lib/csv";

type Props = {
  title: string;
  data: { date: string; failedRequests: number; errorType?: string }[];
  exportName: string;
  heightClass?: string;
  help?: string;
};

export function HourlyErrorChart({ title, data, exportName, heightClass = "h-96", help }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Use the actual date/time from data with error types from the data
  const hourlyData = data.map((item) => {
    return {
      ...item,
      hour: item.date, // Use the actual date from the data
      time: item.date, // Use the actual date from the data
      primaryErrorType: item.errorType || 'No Error' // Use error type from data or default
    };
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="card-title flex items-center gap-2">
          <span>{title}</span>
          {help ? (
            <Tooltip content={help} />
          ) : (
            <Tooltip content="Hourly error count over the last 24 hours. Shows error patterns throughout the day." />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            aria-label="Download Chart"
            onClick={() => downloadChartAsPdf(chartRef, `${exportName}.pdf`)}
          >
            Download Chart
          </button>
          <button
            className="btn btn-secondary"
            aria-label="Export CSV"
            onClick={() => downloadCsv(`${exportName}.csv`, toCsv(hourlyData))}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div ref={chartRef} className={`mt-3 ${heightClass}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toString()}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
            />
            <RTooltip 
              labelFormatter={(label) => `Error Type: ${hourlyData.find(d => d.time === label)?.primaryErrorType || 'Unknown'}`}
              formatter={(value: number) => [
                `${value} errors`, 
                'Count'
              ]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="failedRequests" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              label={{ position: 'top', fontSize: 10, fill: '#666' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
