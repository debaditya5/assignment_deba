"use client";

import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LabelList } from "recharts";
import { downloadChartAsPdf } from "@lib/csv";

type StageRow = { stage: string; count: number };

export function FunnelChart({ data }: { data: StageRow[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    downloadChartAsPdf(chartRef, "funnel-chart.pdf");
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <button className="btn btn-secondary" onClick={handleDownloadPdf}>
          Download Chart
        </button>
      </div>
      <div ref={chartRef} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" name="Count" fill="#0ea5e9">
              <LabelList dataKey="count" position="insideTop" fill="#ffffff" formatter={(v: any) => String(v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


