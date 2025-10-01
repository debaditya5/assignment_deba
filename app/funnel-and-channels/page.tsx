"use client";

import { useMemo } from "react";
import { useUrlParams } from "@lib/useUrlParams";
import { TENANTS } from "@data/tenants";
import { RangeId } from "@lib/date";
import { generateTenantData } from "@lib/mock";
import { filterByTenantAndRange, computeCategoryKpis } from "@lib/aggregations";
import { TenantSwitcher } from "@components/TenantSwitcher";
import { TimeRangePicker } from "@components/TimeRangePicker";
import { KPITimeline } from "@components/KPITimeline";

function TrendsPageContent() {
  const { get } = useUrlParams();
  const tenant = get("tenant") || (TENANTS[0]?.id || "alpha-health");
  const range = (get("range") || "14d") as RangeId;

  const rows = useMemo(() => generateTenantData(tenant, range, 2), [tenant, range]);
  const filtered = useMemo(() => filterByTenantAndRange(rows, tenant, range), [rows, tenant, range]);
  const categories = useMemo(() => computeCategoryKpis(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TenantSwitcher />
          <TimeRangePicker />
        </div>
      </div>

      {/* User Metrics - Trends Only */}
      <section className="py-7">
        <h2 className="text-lg font-semibold mb-4">User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPITimeline title="CSAT Trend" average={categories.user.csat} unit="%" color="#10b981" range={range} />
          <KPITimeline title="NPS (proxy) Trend" average={categories.user.nps} unit="%" color="#059669" range={range} />
          <KPITimeline title="First-contact resolution Trend" average={categories.user.firstContactResolution} unit="%" color="#14b8a6" range={range} />
          <KPITimeline title="Abandon rate Trend" average={categories.user.abandonRate} unit="%" color="#f59e0b" range={range} />
        </div>
      </section>

      {/* Business Metrics - Trends Only */}
      <section className="py-7">
        <h2 className="text-lg font-semibold mb-4">Business Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPITimeline title="Approval rate Trend" average={categories.business.approvalRate} unit="%" color="#3b82f6" range={range} />
          <KPITimeline title="Coverage confirmation Trend" average={categories.business.coverageConfirmationRate} unit="%" color="#2563eb" range={range} />
          <KPITimeline title="Authorization conversion Trend" average={categories.business.authorizationConversion} unit="%" color="#0ea5e9" range={range} />
          <KPITimeline title="Cost to serve Trend" average={categories.business.costToServe} unit="$" color="#06b6d4" range={range} />
        </div>
      </section>

      {/* Operational Metrics - Trends Only */}
      <section className="py-7">
        <h2 className="text-lg font-semibold mb-4">Operational Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPITimeline title="Queue depth Trend" average={categories.operational.queueDepth} unit="" color="#a855f7" range={range} />
          <KPITimeline title="Avg handling time Trend" average={Math.round(categories.operational.averageHandlingTimeMs / 1000)} unit="s" color="#6366f1" range={range} />
          <KPITimeline title="Agent utilization Trend" average={categories.operational.agentUtilization} unit="%" color="#8b5cf6" range={range} />
          <KPITimeline title="Self-serve deflection Trend" average={categories.operational.selfServeDeflection} unit="%" color="#ec4899" range={range} />
        </div>
      </section>

      {/* Performance Metrics - Trends Only */}
      <section className="py-7" data-pdf-page-break="before">
        <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KPITimeline title="Latency p50 Trend" average={categories.performance.latencyP50Ms} unit="ms" color="#64748b" range={range} />
          <KPITimeline title="Latency p95 Trend" average={categories.performance.latencyP95Ms} unit="ms" color="#475569" range={range} />
          <KPITimeline title="Error rate Trend" average={categories.performance.errorRate} unit="%" color="#ef4444" range={range} />
          <KPITimeline title="Success rate Trend" average={categories.performance.successRate} unit="%" color="#10b981" range={range} />
        </div>
      </section>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Page() {
  return <TrendsPageContent />;
}
