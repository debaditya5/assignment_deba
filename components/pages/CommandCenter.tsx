"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TenantSwitcher } from "@components/TenantSwitcher";
import { TimeRangePicker } from "@components/TimeRangePicker";
import { LineCard } from "@components/LineCard";
import { LatencyCard } from "@components/LatencyCard";
import { KPIGaugeTile } from "@components/KPIGaugeTile";
import { FunnelChart } from "@components/FunnelChart";
import { ChannelMix } from "@components/ChannelMix";
import { Tooltip } from "@components/atoms/Tooltip";
import { TENANTS } from "@data/tenants";
import { RangeId } from "@lib/date";
import { generateTenantData } from "@lib/mock";
import { channelMix, dailyLatency, dailyRequestsApprovals, filterByTenantAndRange, computeCategoryKpis, funnelCounts } from "@lib/aggregations";

function CommandCenterContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant") ?? (TENANTS[0]?.id || "alpha-health");
  const range = (searchParams.get("range") ?? "14d") as RangeId;

  const formatChannelName = (channel: string) => {
    return channel
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const rows = useMemo(() => generateTenantData(tenant, range, 1), [tenant, range]);
  const filtered = useMemo(() => filterByTenantAndRange(rows, tenant, range), [rows, tenant, range]);

  const categories = useMemo(() => computeCategoryKpis(filtered), [filtered]);
  const reqVsApp = useMemo(() => dailyRequestsApprovals(filtered, range), [filtered, range]);
  const latency = useMemo(() => dailyLatency(filtered, range), [filtered, range]);
  const channels = useMemo(() => channelMix(filtered), [filtered]);
  const funnel = useMemo(() => funnelCounts(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TenantSwitcher />
          <TimeRangePicker />
        </div>
      </div>

      <section className="space-y-3">
        <div className="card">
          <div className="mb-2 text-xs font-semibold text-gray-600">User</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIGaugeTile title="CSAT" value={categories.user.csat} max={100} unit="%" color="#10b981" help="Customer satisfaction on a 0–100 scale across all channels. Higher is better." />
            <KPIGaugeTile title="NPS (proxy)" value={categories.user.nps} max={100} unit="%" color="#059669" help="Would users recommend us? Proxy score derived from satisfaction; higher suggests stronger loyalty." />
            <KPIGaugeTile title="First-contact resolution" value={categories.user.firstContactResolution} max={100} unit="%" color="#14b8a6" help="Percent of issues solved in the first interaction—fewer follow-ups needed." />
            <KPIGaugeTile title="Abandon rate" value={categories.user.abandonRate} max={20} unit="%" color="#f59e0b" help="Percent of users who started but didn't finish—lower means fewer drop-offs." inverted />
          </div>
        </div>

        <div className="card">
          <div className="mb-2 text-xs font-semibold text-gray-600">Business</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIGaugeTile title="Approval rate" value={categories.business.approvalRate} max={100} unit="%" color="#3b82f6" help="Out of everything started, how many ended in 'approved'." />
            <KPIGaugeTile title="Coverage confirmation" value={categories.business.coverageConfirmationRate} max={100} unit="%" color="#2563eb" help="Share of interactions that reached a confirmed coverage decision." />
            <KPIGaugeTile title="Authorization conversion" value={categories.business.authorizationConversion} max={100} unit="%" color="#0ea5e9" help="Share that reached and were approved at authorization." />
            <KPIGaugeTile title="Cost to serve" value={categories.business.costToServe} max={10} unit="$" color="#06b6d4" help="Approximate average cost per interaction (lower is better)." inverted />
          </div>
        </div>

        <div className="card">
          <div className="mb-2 text-xs font-semibold text-gray-600">Operational</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIGaugeTile title="Queue depth" value={categories.operational.queueDepth} max={10} unit="" color="#a855f7" help="How many items are waiting right now—smaller queues mean faster service." inverted />
            <KPIGaugeTile title="Avg handling time" value={Math.round(categories.operational.averageHandlingTimeMs / 1000)} max={300} unit="s" color="#6366f1" help="Average time an interaction takes from start to finish." inverted />
            <KPIGaugeTile title="Agent utilization" value={categories.operational.agentUtilization} max={100} unit="%" color="#8b5cf6" help="How busy agents are overall; balanced is best (not overworked or idle)." />
            <KPIGaugeTile title="Self-serve deflection" value={categories.operational.selfServeDeflection} max={100} unit="%" color="#ec4899" help="Percent handled by self-serve flows without an agent; higher reduces costs." />
          </div>
        </div>

        <div className="card">
          <div className="mb-2 text-xs font-semibold text-gray-600">Performance</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIGaugeTile title="Latency p50" value={categories.performance.latencyP50Ms} max={2000} unit="ms" color="#64748b" help="Half of requests are faster than this time—typical user experience." inverted />
            <KPIGaugeTile title="Latency p95" value={categories.performance.latencyP95Ms} max={3000} unit="ms" color="#475569" help="95 out of 100 requests are faster than this time—captures worst-case delays." inverted />
            <KPIGaugeTile title="Error rate" value={categories.performance.errorRate} max={20} unit="%" color="#ef4444" help="Out of decided requests, percent that failed (should be low)." inverted />
            <KPIGaugeTile title="Success rate" value={categories.performance.successRate} max={100} unit="%" color="#10b981" help="Out of decided requests, percent approved. Success + error = 100%." />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineCard
          title="Requests vs Approvals"
          help="Daily total events vs approved outcomes in the selected range."
          data={reqVsApp}
          exportName={`${tenant}-requests-approvals`}
        />
        <LatencyCard data={latency} exportName={`${tenant}-latency`} />
      </section>

      <section>
        <div className="card">
          <div className="card-title">Channel overview</div>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((c) => (
              <div key={c.channel} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{formatChannelName(c.channel)}</div>
                <div className="text-gray-600">Share: {c.share}%</div>
                <div className="text-gray-600">CSAT: {c.csat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Funnel & Channel Analysis</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card">
            <div className="card-title flex items-center gap-2">
              <span>Funnel conversion</span>
              <Tooltip content="From Intent to Authorization: Shows how many make it through each step. Drops between steps highlight where users get stuck." />
            </div>
            <div className="mt-3">
              <FunnelChart data={funnel} />
            </div>
          </div>
          <div className="card">
            <div className="card-title flex items-center gap-2">
              <span>Channel mix & CSAT</span>
              <Tooltip content="Which channels people use and how satisfied they are. Mix: Share of traffic. CSAT: Satisfaction out of 100." />
            </div>
            <div className="mt-3">
              <ChannelMix data={channels} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function CommandCenter() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading dashboard...</div>}>
      <CommandCenterContent />
    </Suspense>
  );
}


