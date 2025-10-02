"use client";

import { useMemo } from "react";
import { useUrlParams } from "@lib/useUrlParams";
import { TenantSwitcher } from "@components/TenantSwitcher";
import { TimeRangePicker } from "@components/TimeRangePicker";
import { LineCard } from "@components/LineCard";
import { LatencyCard } from "@components/LatencyCard";
import { EnhancedKPITile } from "@components/EnhancedKPITile";
import { CollapsibleKPISection } from "@components/CollapsibleKPISection";
import { KPIGrid } from "@components/KPIGrid";
import { KPITimeline } from "@components/KPITimeline";
import { CollapsibleProvider } from "@lib/collapsibleContext";
import { FunnelChart } from "@components/FunnelChart";
import { ChannelMix } from "@components/ChannelMix";
import { Tooltip } from "@components/atoms/Tooltip";
import { TENANTS } from "@data/tenants";
import { RangeId } from "@lib/date";
import { generateTenantData } from "@lib/mock";
import { channelMix, dailyLatency, dailyRequestsApprovals, filterByTenantAndRange, computeCategoryKpis, funnelCounts, calculateTrendData } from "@lib/aggregations";
import { generateKPITimelineData } from "@lib/kpiData";
import { calculateTrueAverages } from "@lib/averageCalculator";
import { getAllCleanKPIData } from "@lib/cleanKpiData";
import { CleanKPITimeline } from "@components/CleanKPITimeline";

function CommandCenterContent() {
  const { get } = useUrlParams();
  const tenant = get("tenant") || (TENANTS[0]?.id || "alpha-health");
  const range = (get("range") || "7d") as RangeId;

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
  
  // Calculate true averages from actual chart data
  const { kpiAverages, chartAverages } = useMemo(() => calculateTrueAverages(tenant, range), [tenant, range]);
  
  // Get clean KPI data for ALL KPIs with tenant-specific values
  const cleanKPIData = useMemo(() => getAllCleanKPIData(range, tenant), [range, tenant]);

  const latency = useMemo(() => {
    // Generate combined latency data using clean KPI data
    const p50Data = cleanKPIData.latencyP50.data;
    const p95Data = cleanKPIData.latencyP95.data;
    
    // Combine the data into the format expected by LatencyCard
    return p50Data.map((p50Point, index) => {
      const p95Point = p95Data[index];
      return {
        date: p50Point.date,
        p50: p50Point.value,
        p95: p95Point ? p95Point.value : 0
      };
    });
  }, [cleanKPIData.latencyP50.data, cleanKPIData.latencyP95.data]);
  const channels = useMemo(() => channelMix(filtered), [filtered]);
  const funnel = useMemo(() => funnelCounts(filtered), [filtered]);

  return (
    <div className="space-y-6">

      {/* Primary KPIs - Top 3 with gauges */}
      <section className="space-y-4">
        <KPIGrid columns="grid-cols-1 md:grid-cols-3" kpiAverages={kpiAverages} cleanKPIData={cleanKPIData}>
          <EnhancedKPITile 
            title="CSAT" 
            value={cleanKPIData.csat.average} 
            max={100} 
            unit="%" 
            color="#10b981" 
            help="Customer satisfaction on a 0–100 scale across all channels. Higher is better."
            showGauge={true}
            range={range}
            trendData={calculateTrendData(cleanKPIData.csat.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Approval rate" 
            value={cleanKPIData.approvalRate.average} 
            max={100} 
            unit="%" 
            color="#3b82f6" 
            help="Out of everything started, how many ended in 'approved'."
            showGauge={true}
            range={range}
            trendData={calculateTrendData(cleanKPIData.approvalRate.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Success rate" 
            value={cleanKPIData.successRate.average} 
            max={100} 
            unit="%" 
            color="#10b981" 
            help="Out of decided requests, percent approved. Success + error = 100%."
            showGauge={true}
            range={range}
            trendData={calculateTrendData(cleanKPIData.successRate.average, range)}
            higherIsBetter={true}
          />
        </KPIGrid>
        
        {/* Requests vs Approvals Chart - Full Width */}
        <div className="w-full">
          <LineCard
            title="Requests vs Approvals"
            help="Daily total events vs approved outcomes in the selected range."
            data={reqVsApp}
            exportName={`${tenant}-requests-approvals`}
            approvalRate={chartAverages.requestsVsApprovals.avgApprovalRate}
          />
        </div>
      </section>

      {/* Secondary KPIs - Collapsible sections with numbers only */}
      <section className="space-y-3">
        <CollapsibleKPISection title="User Experience Metrics" defaultExpanded={false} sectionId="user-experience-metrics" kpiAverages={kpiAverages} cleanKPIData={cleanKPIData}>
            <EnhancedKPITile 
            title="NPS (proxy)" 
            value={cleanKPIData.nps.average} 
            max={100} 
            unit="%" 
            color="#059669" 
            help="Would users recommend us? Proxy score derived from satisfaction; higher suggests stronger loyalty."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.nps.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="First-contact resolution" 
            value={cleanKPIData.firstContactResolution.average} 
            max={100} 
            unit="%" 
            color="#14b8a6" 
            help="Percent of issues solved in the first interaction—fewer follow-ups needed."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.firstContactResolution.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Abandon rate" 
            value={cleanKPIData.abandonRate.average} 
            max={20} 
            unit="%" 
            color="#f59e0b" 
            help="Percent of users who started but didn't finish—lower means fewer drop-offs." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.abandonRate.average, range)}
            higherIsBetter={false}
          />
        </CollapsibleKPISection>

        <CollapsibleKPISection title="Business Metrics" defaultExpanded={false} sectionId="business-metrics" kpiAverages={kpiAverages} cleanKPIData={cleanKPIData}>
          <EnhancedKPITile 
            title="Coverage confirmation" 
            value={cleanKPIData.coverageConfirmation.average} 
            max={100} 
            unit="%" 
            color="#2563eb" 
            help="Share of interactions that reached a confirmed coverage decision."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.coverageConfirmation.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Authorization conversion" 
            value={cleanKPIData.authorizationConversion.average} 
            max={100} 
            unit="%" 
            color="#0ea5e9" 
            help="Share that reached and were approved at authorization."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.authorizationConversion.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Cost to serve" 
            value={cleanKPIData.costToServe.average} 
            max={10} 
            unit="$" 
            color="#06b6d4" 
            help="Approximate average cost per interaction (lower is better)." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.costToServe.average, range)}
            higherIsBetter={false}
          />
        </CollapsibleKPISection>

        <CollapsibleKPISection title="Operational Metrics" defaultExpanded={false} sectionId="operational-metrics" kpiAverages={kpiAverages} cleanKPIData={cleanKPIData}>
          <EnhancedKPITile 
            title="Queue depth" 
            value={cleanKPIData.queueDepth.average} 
            max={10} 
            unit="" 
            color="#a855f7" 
            help="How many items are waiting right now—smaller queues mean faster service." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.queueDepth.average, range)}
            higherIsBetter={false}
          />
          <EnhancedKPITile 
            title="Avg handling time" 
            value={cleanKPIData.avgHandlingTime.average} 
            max={300} 
            unit="s" 
            color="#6366f1" 
            help="Average time an interaction takes from start to finish." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.avgHandlingTime.average, range)}
            higherIsBetter={false}
          />
          <EnhancedKPITile 
            title="Agent utilization" 
            value={cleanKPIData.agentUtilization.average} 
            max={100} 
            unit="%" 
            color="#8b5cf6" 
            help="How busy agents are overall; balanced is best (not overworked or idle)."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.agentUtilization.average, range)}
            higherIsBetter={true}
          />
          <EnhancedKPITile 
            title="Self-serve deflection" 
            value={cleanKPIData.selfServeDeflection.average} 
            max={100} 
            unit="%" 
            color="#ec4899" 
            help="Percent handled by self-serve flows without an agent; higher reduces costs."
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.selfServeDeflection.average, range)}
            higherIsBetter={true}
          />
        </CollapsibleKPISection>

        <CollapsibleKPISection 
          title="Performance Metrics" 
          defaultExpanded={false} 
          sectionId="performance-metrics"
          kpiAverages={kpiAverages}
          cleanKPIData={cleanKPIData}
          additionalContent={
            <div>
              {/* Individual Latency Charts - Hidden by default */}
              <div id="latency-p50-chart" className="w-full" style={{ display: 'none' }}>
                <CleanKPITimeline 
                  title="Latency p50 Trend" 
                  data={cleanKPIData.latencyP50.data}
                  average={cleanKPIData.latencyP50.average} 
                  unit="ms" 
                  color="#64748b" 
                />
          </div>
              <div id="latency-p95-chart" className="w-full" style={{ display: 'none' }}>
                <CleanKPITimeline 
                  title="Latency p95 Trend" 
                  data={cleanKPIData.latencyP95.data}
                  average={cleanKPIData.latencyP95.average} 
                  unit="ms" 
                  color="#475569" 
                />
        </div>

              {/* Combined Latency Chart - Hidden by default, shown on double click */}
              <div id="latency-combined-chart" className="w-full" style={{ display: 'none' }}>
                <LatencyCard 
                  data={latency} 
                  exportName={`${tenant}-latency`} 
                />
          </div>
        </div>
          }
        >
          <EnhancedKPITile 
            title="Latency p50" 
            value={cleanKPIData.latencyP50.average} 
            max={2000} 
            unit="ms" 
            color="#64748b" 
            help="Half of requests are faster than this time—typical user experience." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.latencyP50.average, range)}
            higherIsBetter={false}
            onClick={() => {
              // Chart hiding is now handled by EnhancedKPITile.handleClick
              // Just toggle the specific p50 chart
              const p50Chart = document.getElementById('latency-p50-chart');
              if (p50Chart) {
                p50Chart.style.display = p50Chart.style.display === 'none' ? 'block' : 'none';
              }
            }}
            onDoubleClick={() => {
              // Hide all individual charts and KPIGrid charts
              const allExpandedCharts = document.querySelectorAll('[id$="-chart"]');
              allExpandedCharts.forEach(chart => {
                if (chart instanceof HTMLElement) {
                  chart.style.display = 'none';
                }
              });
              
              // Hide KPIGrid expanded chart
              const resetEvent = new CustomEvent('resetKPIGrid');
              window.dispatchEvent(resetEvent);
              
              // Toggle combined chart
              const combinedChart = document.getElementById('latency-combined-chart');
              if (combinedChart) {
                combinedChart.style.display = combinedChart.style.display === 'none' ? 'block' : 'none';
              }
            }}
          />
          <EnhancedKPITile 
            title="Latency p95" 
            value={cleanKPIData.latencyP95.average} 
            max={3000} 
            unit="ms" 
            color="#475569" 
            help="95 out of 100 requests are faster than this time—captures worst-case delays." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.latencyP95.average, range)}
            higherIsBetter={false}
            onClick={() => {
              // Chart hiding is now handled by EnhancedKPITile.handleClick
              // Just toggle the specific p95 chart
              const p95Chart = document.getElementById('latency-p95-chart');
              if (p95Chart) {
                p95Chart.style.display = p95Chart.style.display === 'none' ? 'block' : 'none';
              }
            }}
            onDoubleClick={() => {
              // Hide all charts first (double-click doesn't trigger handleClick)
              const allExpandedCharts = document.querySelectorAll('[id$="-chart"]');
              allExpandedCharts.forEach(chart => {
                if (chart instanceof HTMLElement) {
                  chart.style.display = 'none';
                }
              });
              
              // Reset KPIGrid expanded charts
              const resetEvent = new CustomEvent('resetKPIGrid');
              window.dispatchEvent(resetEvent);
              
              // Toggle combined chart
              const combinedChart = document.getElementById('latency-combined-chart');
              if (combinedChart) {
                combinedChart.style.display = combinedChart.style.display === 'none' ? 'block' : 'none';
              }
            }}
          />
          <EnhancedKPITile 
            title="Error rate" 
            value={cleanKPIData.errorRate.average} 
            max={20} 
            unit="%" 
            color="#ef4444" 
            help="Out of decided requests, percent that failed (should be low)." 
            inverted={true}
            showGauge={false}
            range={range}
            trendData={calculateTrendData(cleanKPIData.errorRate.average, range)}
            higherIsBetter={false}
          />
        </CollapsibleKPISection>
      </section>


      <section>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Channel overview</h2>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel & Channel Analysis</h2>
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
    <CollapsibleProvider>
      <CommandCenterContent />
    </CollapsibleProvider>
  );
}


