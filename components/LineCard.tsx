"use client";

import { useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip, Legend, CartesianGrid } from "recharts";
import { Tooltip } from "@components/atoms/Tooltip";
import { toCsv, downloadCsv, downloadChartAsPdf } from "@lib/csv";

type Props = {
  title: string;
  data: { date: string; requests?: number; approvals?: number; failedRequests?: number }[];
  colorA?: string;
  colorB?: string;
  exportName: string;
  heightClass?: string;
  help?: string;
};

export function LineCard({ title, data, colorA = "#2563eb", colorB = "#16a34a", exportName, heightClass = "h-64", help }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    downloadChartAsPdf(chartRef, `${exportName}.pdf`);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="card-title flex items-center gap-2">
          <span>{title}</span>
          {help ? (
            <Tooltip content={help} />
          ) : (
            <Tooltip content="Requests: how many people started an action. Approvals: how many were successfully approved. This shows how demand compares to successful outcomes each day." />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary"
            aria-label="Export CSV"
            onClick={() => downloadCsv(`${exportName}.csv`, toCsv(data))}
          >
            Export CSV
          </button>
          <button
            className="btn btn-secondary"
            aria-label="Download Chart as PDF"
            onClick={handleDownloadPdf}
          >
            Download Chart
          </button>
        </div>
      </div>
      <div ref={chartRef} className={`mt-3 ${heightClass}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="date" />
            <YAxis />
            <RTooltip />
            <Legend />
            {data.some((d) => d.requests !== undefined) ? (
              <Line type="monotone" dataKey="requests" stroke={colorA} dot={false} name="Requests" />
            ) : null}
            {data.some((d) => d.failedRequests !== undefined) ? (
              <Line type="monotone" dataKey="failedRequests" stroke={colorA} dot={false} name="Failed Requests" />
            ) : null}
            {data.some((d) => d.approvals !== undefined) ? (
              <Line type="monotone" dataKey="approvals" stroke={colorB} dot={false} name="Approvals" />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


