"use client";

import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid, LabelList } from "recharts";
import { downloadChartAsPdf, toCsv, downloadCsv } from "@lib/csv";

type Row = { channel: string; share: number; csat: number };

export function ChannelMix({ data }: { data: Row[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    downloadChartAsPdf(chartRef, "channel-mix-chart.pdf");
  };

  const formatChannelName = (channel: string) => {
    return channel
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          className="btn btn-secondary"
          onClick={handleDownloadPdf}
          aria-label="Download Chart"
        >
          Download Chart
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => downloadCsv("channel-mix.csv", toCsv(data))}
          aria-label="Export CSV"
        >
          Export CSV
        </button>
      </div>
      <div ref={chartRef} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="channel" tickFormatter={formatChannelName} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="share" name="Share (%)" fill="#22c55e">
              <LabelList dataKey="share" position="insideTop" fill="#ffffff" formatter={(v: any) => `${v}%`} />
            </Bar>
            <Bar dataKey="csat" name="CSAT (0-100)" fill="#6366f1">
              <LabelList dataKey="csat" position="insideTop" fill="#ffffff" formatter={(v: any) => String(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


