"use client";

import { useRef } from "react";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip as RTooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
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
  approvalRate?: number; // Average approval rate for reference line
};

export function LineCard({ title, data, colorA = "#2563eb", colorB = "#16a34a", exportName, heightClass = "h-64", help, approvalRate }: Props) {
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
            aria-label="Download Chart"
            onClick={handleDownloadPdf}
          >
            Download Chart
          </button>
          <button
            className="btn btn-secondary"
            aria-label="Export CSV"
            onClick={() => downloadCsv(`${exportName}.csv`, toCsv(data))}
          >
            Export CSV
          </button>
        </div>
      </div>
      <div ref={chartRef} className={`mt-3 ${heightClass}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, dy: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              tickFormatter={(value) => {
                // Convert date string to MMM dd format
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
              }}
            />
            <YAxis />
            <RTooltip />
            <Legend />
            
            {/* Red dotted reference line for approval rate average */}
            {approvalRate && (
              <ReferenceLine 
                y={approvalRate} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ 
                  value: `Avg Approval Rate: ${approvalRate}%`, 
                  position: "topRight",
                  style: { fontWeight: "bold", fill: "#1f2937", zIndex: 1000 }
                }}
              />
            )}
            
            {data.some((d) => d.requests !== undefined) ? (
              <Line type="monotone" dataKey="requests" stroke={colorA} dot={false} name="Requests" />
            ) : null}
            {data.some((d) => d.failedRequests !== undefined) ? (
              <Line type="monotone" dataKey="failedRequests" stroke={colorA} dot={false} name="Failed Requests" />
            ) : null}
            {data.some((d) => d.approvals !== undefined) ? (
              <Area 
                type="monotone" 
                dataKey="approvals" 
                stroke={colorB} 
                fill="#86efac"
                fillOpacity={0.4}
                name="Approvals" 
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


