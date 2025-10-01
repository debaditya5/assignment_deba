"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TENANTS } from "@data/tenants";
import { RangeId } from "@lib/date";
import { generateTenantData } from "@lib/mock";
import { errorTrend, filterByTenantAndRange, topErrors } from "@lib/aggregations";
import { TenantSwitcher } from "@components/TenantSwitcher";
import { TimeRangePicker } from "@components/TimeRangePicker";
import { ErrorsTable } from "@components/ErrorsTable";
import { ErrorIndexBox } from "@components/ErrorIndexBox";
import { LineCard } from "@components/LineCard";

function ReliabilityPage() {
  const params = useSearchParams();
  const tenant = params.get("tenant") ?? (TENANTS[0]?.id || "alpha-health");
  const range = (params.get("range") ?? "14d") as RangeId;

  const rows = useMemo(() => generateTenantData(tenant, range, 3), [tenant, range]);
  const filtered = useMemo(() => filterByTenantAndRange(rows, tenant, range), [rows, tenant, range]);

  const top = useMemo(() => topErrors(filtered), [filtered]);
  const trend = useMemo(() => errorTrend(filtered, range).map((r) => ({ date: r.date, failedRequests: r.errors })), [filtered, range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TenantSwitcher />
          <TimeRangePicker />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineCard
            title="Error trend"
            help="Errors: Daily count of failed requests. Interpretation: Use this to spot spikes and investigate recent changes."
            data={trend}
            exportName={`${tenant}-error-trend`}
            heightClass="h-80"
          />
        </div>
        <div className="lg:col-span-3">
          <ErrorsTable data={top} />
        </div>
        <div className="lg:col-span-3">
          <ErrorIndexBox />
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading reliability data...</div>}>
      <ReliabilityPage />
    </Suspense>
  );
}


