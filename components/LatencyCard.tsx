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
          <button className="btn btn-secondary" onClick={() => downloadCsv(`${exportName}.csv`, toCsv(data))}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadPdf}>
            Download Chart
          </button>
        </div>
      </div>
      <div ref={chartRef} className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="date" />
            <YAxis />
            <RTooltip />
            <Legend />
            <Area dataKey="p50" name="p50" fill="#93c5fd" stroke="#60a5fa" />
            <Line dataKey="p95" name="p95" stroke="#ef4444" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


