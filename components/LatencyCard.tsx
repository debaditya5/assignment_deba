"use client";

import { useRef } from "react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip as RTooltip, Legend, CartesianGrid } from "recharts";
import { Tooltip as Help } from "@components/atoms/Tooltip";
import { toCsv, downloadCsv, downloadChartAsPdf } from "@lib/csv";

type Row = { date: string; p50: number; p95: number };

export function LatencyCard({ data, exportName }: { data: Row[]; exportName: string }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    downloadChartAsPdf(chartRef, `${exportName}.pdf`);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="card-title flex items-center gap-2">
          <span>Latency p50 / p95 (ms)</span>
          <Help content="p50: Half of requests finish faster than this time. p95: 95 out of 100 requests finish faster than this time (only 5% are slower). Lower numbers mean a faster experience." />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={handleDownloadPdf} aria-label="Download Chart">
            Download Chart
          </button>
          <button className="btn btn-secondary" onClick={() => downloadCsv(`${exportName}.csv`, toCsv(data))}>
            Export CSV
          </button>
        </div>
      </div>
      <div ref={chartRef} className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, dy: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <RTooltip 
              formatter={(value: number, name: string) => [
                `${value}ms`, 
                name === 'p50' ? 'Latency p50' : 'Latency p95'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '12px'
              }}
            />
            <Legend />
            
            
            <Area 
              dataKey="p50" 
              name="p50" 
              fill="#93c5fd" 
              stroke="#60a5fa"
              dot={{ fill: "#60a5fa", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, fill: "#60a5fa", strokeWidth: 2, stroke: "#fff" }}
            />
            <Line 
              dataKey="p95" 
              name="p95" 
              stroke="#ef4444" 
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 8, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


