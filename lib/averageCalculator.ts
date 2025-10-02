"use client";

import { RangeId } from "@lib/date";
import { generateKPITimelineData } from "@lib/kpiData";
import { generateTenantData } from "@lib/mock";
import { filterByTenantAndRange, computeCategoryKpis, dailyRequestsApprovals, funnelCounts, channelMix } from "@lib/aggregations";

export interface KPIAverages {
  // User Experience Metrics
  csat: number;
  nps: number;
  firstContactResolution: number;
  abandonRate: number;
  
  // Business Metrics
  approvalRate: number;
  coverageConfirmationRate: number;
  authorizationConversion: number;
  costToServe: number;
  
  // Operational Metrics
  queueDepth: number;
  averageHandlingTimeMs: number;
  agentUtilization: number;
  selfServeDeflection: number;
  
  // Performance Metrics
  latencyP50Ms: number;
  latencyP95Ms: number;
  errorRate: number;
  successRate: number;
  retryRate: number;
  timeoutRate: number;
}

export interface ChartAverages {
  requestsVsApprovals: {
    avgRequests: number;
    avgApprovals: number;
    avgApprovalRate: number;
  };
  latencyCombined: {
    avgP50: number;
    avgP95: number;
  };
  funnel: {
    avgIntent: number;
    avgCoverage: number;
    avgAuthorization: number;
  };
  channelMix: {
    avgShare: Record<string, number>;
    avgCSAT: Record<string, number>;
  };
}

/**
 * Calculate true averages from actual chart data across all time ranges
 * This ensures KPI tiles and reference lines show mathematically correct averages
 */
export function calculateTrueAverages(tenant: string, range: RangeId): {
  kpiAverages: KPIAverages;
  chartAverages: ChartAverages;
} {
  // Generate data for the selected range
  const rows = generateTenantData(tenant, range, 1);
  const filtered = filterByTenantAndRange(rows, tenant, range);
  const categories = computeCategoryKpis(filtered);
  
  // Calculate KPI averages from timeline data - these titles must match exactly what's used in generateKPITimelineData
  const kpiTitles = [
    'CSAT Trend',
    'NPS (proxy) Trend', 
    'First-contact resolution Trend',
    'Abandon rate Trend',
    'Approval rate Trend',
    'Coverage confirmation Trend',
    'Authorization conversion Trend',
    'Cost to serve Trend',
    'Queue depth Trend',
    'Avg handling time Trend',
    'Agent utilization Trend',
    'Self-serve deflection Trend',
    'Latency p50 Trend',
    'Latency p95 Trend',
    'Error rate Trend',
    'Success rate Trend',
    'Retry rate Trend',
    'Timeout rate Trend'
  ];
  
  const kpiValues = [
    categories.user.csat,
    categories.user.nps,
    categories.user.firstContactResolution,
    categories.user.abandonRate,
    categories.business.approvalRate,
    categories.business.coverageConfirmationRate,
    categories.business.authorizationConversion,
    categories.business.costToServe,
    categories.operational.queueDepth,
    categories.operational.averageHandlingTimeMs,
    categories.operational.agentUtilization,
    categories.operational.selfServeDeflection,
    categories.performance.latencyP50Ms,
    categories.performance.latencyP95Ms,
    categories.performance.errorRate,
    categories.performance.successRate,
    categories.performance.retryRate,
    categories.performance.timeoutRate
  ];
  
  // Calculate TRUE mathematical averages from the actual generated timeline data points
  // This ensures the red dotted line represents the actual average of visible data
  const timelineAverages = kpiTitles.map((title, index) => {
    // Generate the exact same data that will be displayed in the chart
    const timelineData = generateKPITimelineData(title, kpiValues[index], range);
    
    // Calculate the mathematical mean of these actual data points
    const sum = timelineData.reduce((acc, point) => acc + point.value, 0);
    const trueAverage = sum / timelineData.length;
    
    
    // Round to 1 decimal place for cleaner display
    return Math.round(trueAverage * 10) / 10;
  });
  
  // Calculate chart-specific averages
  const reqVsApp = dailyRequestsApprovals(filtered, range);
  const avgRequests = Math.round(reqVsApp.reduce((acc, day) => acc + (day.requests || 0), 0) / reqVsApp.length);
  const avgApprovals = Math.round(reqVsApp.reduce((acc, day) => acc + (day.approvals || 0), 0) / reqVsApp.length);
  const avgApprovalRate = avgRequests > 0 ? Math.round((avgApprovals / avgRequests) * 100) : 0;
  
  // Latency combined chart averages
  const p50Data = generateKPITimelineData("Latency p50 Trend", categories.performance.latencyP50Ms, range);
  const p95Data = generateKPITimelineData("Latency p95 Trend", categories.performance.latencyP95Ms, range);
  const avgP50 = Math.round(p50Data.reduce((acc, point) => acc + point.value, 0) / p50Data.length);
  const avgP95 = Math.round(p95Data.reduce((acc, point) => acc + point.value, 0) / p95Data.length);
  
  // Funnel averages
  const funnelData = funnelCounts(filtered);
  const avgIntent = funnelData.find(f => f.stage === 'intent')?.count || 0;
  const avgCoverage = funnelData.find(f => f.stage === 'coverage')?.count || 0;
  const avgAuthorization = funnelData.find(f => f.stage === 'authorization')?.count || 0;
  
  // Channel mix averages
  const channelData = channelMix(filtered);
  const avgShare: Record<string, number> = {};
  const avgCSAT: Record<string, number> = {};
  channelData.forEach(channel => {
    avgShare[channel.channel] = channel.share;
    avgCSAT[channel.channel] = channel.csat;
  });
  
  return {
    kpiAverages: {
      csat: timelineAverages[0],
      nps: timelineAverages[1],
      firstContactResolution: timelineAverages[2],
      abandonRate: timelineAverages[3],
      approvalRate: timelineAverages[4],
      coverageConfirmationRate: timelineAverages[5],
      authorizationConversion: timelineAverages[6],
      costToServe: timelineAverages[7],
      queueDepth: timelineAverages[8],
      averageHandlingTimeMs: timelineAverages[9],
      agentUtilization: timelineAverages[10],
      selfServeDeflection: timelineAverages[11],
      latencyP50Ms: timelineAverages[12],
      latencyP95Ms: timelineAverages[13],
      errorRate: timelineAverages[14],
      successRate: timelineAverages[15],
      retryRate: timelineAverages[16],
      timeoutRate: timelineAverages[17]
    },
    chartAverages: {
      requestsVsApprovals: {
        avgRequests,
        avgApprovals,
        avgApprovalRate
      },
      latencyCombined: {
        avgP50,
        avgP95
      },
      funnel: {
        avgIntent,
        avgCoverage,
        avgAuthorization
      },
      channelMix: {
        avgShare,
        avgCSAT
      }
    }
  };
}

/**
 * Calculate averages across multiple time ranges for comprehensive verification
 */
export function calculateAveragesAcrossRanges(tenant: string): {
  "7d": { kpiAverages: KPIAverages; chartAverages: ChartAverages };
  "14d": { kpiAverages: KPIAverages; chartAverages: ChartAverages };
  "30d": { kpiAverages: KPIAverages; chartAverages: ChartAverages };
} {
  return {
    "7d": calculateTrueAverages(tenant, "7d"),
    "14d": calculateTrueAverages(tenant, "14d"),
    "30d": calculateTrueAverages(tenant, "30d")
  };
}
