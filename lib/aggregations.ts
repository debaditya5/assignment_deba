import { formatDateYYYYMMDD, getDateRange, RangeId } from "@lib/date";

export type EventRow = {
  tenant_id: string;
  timestamp: string; // ISO
  channel: string; // web, mobile, call_center, provider_app, employee
  stage: "intent" | "eligibility" | "coverage" | "authorization";
  status: "requested" | "approved" | "rejected";
  duration_ms: number; // e2e duration
  error_type?: string; // if any
  csat: number; // 0-100
  aht_ms: number; // average handling time proxy
};

export type TenantConfig = { id: string; name: string; accent: string };

export function filterByTenantAndRange(rows: EventRow[], tenant: string, range: RangeId): EventRow[] {
  const { from, to } = getDateRange(range);
  return rows.filter((r) => {
    if (r.tenant_id !== tenant) return false;
    const t = new Date(r.timestamp);
    return t >= from && t <= new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1);
  });
}

export function groupBy<T>(rows: T[], key: any): Record<string, T[]> {
  return rows.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const raw = Math.floor((p / 100) * (sorted.length - 1));
  const idx = Math.max(0, Math.min(sorted.length - 1, raw));
  return sorted[idx] as number;
}

export function dailyRequestsApprovals(rows: EventRow[], range: RangeId) {
  const { days } = getDateRange(range);
  const byDay = groupBy(rows, (r: EventRow) => formatDateYYYYMMDD(new Date(r.timestamp)));
  return days.map((d) => {
    const list: EventRow[] = byDay[d] ?? [];
    const requests = list.length; // total events on the day
    const approvals = list.filter((r) => r.status === "approved").length;
    return { date: d, requests, approvals };
  });
}

export function dailyLatency(rows: EventRow[], range: RangeId) {
  const { days } = getDateRange(range);
  const byDay = groupBy(rows, (r: EventRow) => formatDateYYYYMMDD(new Date(r.timestamp)));
  return days.map((d) => {
    const list: EventRow[] = byDay[d] ?? [];
    const durations: number[] = list.map((r) => r.duration_ms);
    return { date: d, p50: percentile(durations, 50), p95: percentile(durations, 95) };
  });
}

export function computeKpis(rows: EventRow[]) {
  const totalEvents = rows.length; // all events in range
  const approvals = rows.filter((r) => r.status === "approved").length;
  const declines = rows.filter((r) => r.status === "rejected").length;
  const decided = approvals + declines; // exclude in-progress/requested from success vs error
  const successRate = decided > 0 ? Math.round((approvals / decided) * 100) : 0;
  const errorRate = decided > 0 ? 100 - successRate : 0;
  const rawApproval = totalEvents > 0 ? Math.round((approvals / totalEvents) * 100) : 0;
  const approvalRate = totalEvents > 0 ? (approvals > 0 ? Math.max(1, rawApproval) : 0) : 0;
  const fcr = Math.round(80 + Math.min(20, approvals % 20)); // simple proxy
  const abandonRate = Math.max(0, 100 - fcr - 5); // proxy
  const csat = Math.round(
    rows.length ? rows.reduce((a, r) => a + r.csat, 0) / rows.length : 0,
  );
  const aht = Math.round(
    rows.length ? rows.reduce((a, r) => a + r.aht_ms, 0) / rows.length : 0,
  );
  const retries = Math.round(Math.max(0, errorRate / 2));
  return { totalRequests: totalEvents, approvals, approvalRate, fcr, abandonRate, csat, aht, errorRate, retries, successRate } as any;
}

export function overallLatency(rows: EventRow[]): { p50: number; p95: number } {
  const durations = rows.map((r) => r.duration_ms);
  return { p50: percentile(durations, 50), p95: percentile(durations, 95) };
}

// Helper function to calculate trend data (deterministic for SSR)
export function calculateTrendData(currentValue: number, range: RangeId): { previousValue: number; changePercent: number } {
  // Generate deterministic mock previous period data based on current value
  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  
  // Use current value as seed for deterministic "randomness"
  const seed = currentValue * 1000;
  const pseudoRandom1 = Math.sin(seed) * 0.5;
  const pseudoRandom2 = Math.cos(seed * 1.5) * 0.3;
  const pseudoRandom3 = Math.sin(seed * 2.1) * 0.2;
  
  // Create some realistic variation patterns (deterministic)
  const baseVariation = pseudoRandom1 * 0.3; // ±15% base variation
  const seasonalEffect = Math.sin(seed / 1000) * 0.1; // Seasonal effect
  const trendEffect = pseudoRandom2 * 0.2; // ±10% trend effect
  
  const totalVariation = baseVariation + seasonalEffect + trendEffect;
  const previousValue = Math.max(0, currentValue * (1 - totalVariation));
  
  const changePercent = currentValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  
  return {
    previousValue: Number(previousValue.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2))
  };
}

export function computeCategoryKpis(rows: EventRow[]) {
  const total = rows.length || 1;
  const { approvalRate, csat, aht, errorRate, retries, successRate } = computeKpis(rows);
  const lat = overallLatency(rows);

  // User KPIs
  const user = {
    csat,
    nps: Math.max(0, Math.min(100, Math.round(csat - 10))),
    firstContactResolution: Math.round(75 + Math.min(20, (approvalRate / 10) % 20)),
    abandonRate: Math.max(0, 100 - (75 + Math.min(20, (approvalRate / 10) % 20)) - 5),
  };

  // Business KPIs
  const coverageConfirm = Math.round((rows.filter((r: EventRow) => r.stage === "coverage").length / total) * 100);
  const authConversion = Math.round(
    (rows.filter((r: EventRow) => r.stage === "authorization" && r.status === "approved").length / total) * 100,
  );
  const costToServe = Math.round(
    rows.reduce((acc: number, r: EventRow) => acc + (r.channel === "call_center" ? 5 : 2), 0) / total,
  );
  const business = {
    approvalRate,
    coverageConfirmationRate: coverageConfirm,
    authorizationConversion: authConversion,
    costToServe,
  };

  // Operational KPIs (proxies)
  const callCenterShare = Math.round(
    (rows.filter((r: EventRow) => r.channel === "call_center").length / total) * 100,
  );
  const agentUtilization = Math.min(95, Math.max(55, 100 - Math.round(callCenterShare / 2)));
  const selfServeDeflection = Math.round(
    (rows.filter((r: EventRow) => r.channel !== "call_center").length / total) * 100,
  );
  const operational = {
    queueDepth: Math.max(3, Math.round(callCenterShare / 8)),
    averageHandlingTimeMs: aht,
    agentUtilization,
    selfServeDeflection,
  };

  // Performance KPIs
  const timeoutRate = Math.round(Math.max(0, retries / 2));
  const performance = {
    latencyP50Ms: lat.p50,
    latencyP95Ms: lat.p95,
    errorRate,
    successRate,
    retryRate: retries,
    timeoutRate,
  };

  return { user, business, operational, performance };
}

export function funnelCounts(rows: EventRow[]) {
  const stages: (EventRow["stage"])[] = ["intent", "eligibility", "coverage", "authorization"];
  const rawCounts = stages.map((s) => rows.filter((r: EventRow) => r.stage === s).length);
  // Enforce strict decreasing: intent > eligibility > coverage > authorization
  const coerced: number[] = [];
  for (let i = 0; i < stages.length; i++) {
    let value = rawCounts[i] ?? 0;
    if (i === 0) {
      // ensure intent is at least the max seen across stages
      value = Math.max(...rawCounts);
    } else {
      const prev = coerced[i - 1] ?? 0;
      if (value >= prev) {
        // reduce to be strictly less than previous by at least 1 (or 5% for large numbers)
        const decrement = Math.max(1, Math.round(prev * 0.05));
        value = Math.max(0, prev - decrement);
      }
    }
    coerced.push(value);
  }
  return stages.map((s, i) => ({ stage: s, count: coerced[i] ?? 0 }));
}

export function channelMix(rows: EventRow[]) {
  const byChannel = groupBy(rows, (r: EventRow) => r.channel);
  const total = rows.length || 1;
  return Object.entries(byChannel).map(([channel, list]) => {
    const share = Math.round((list.length / total) * 100);
    const csat = Math.round(list.reduce((a: number, r: EventRow) => a + r.csat, 0) / Math.max(1, list.length));
    return { channel, share, csat };
  });
}

export function topErrors(rows: EventRow[]) {
  const errs = rows.filter((r: EventRow) => r.error_type);
  const byType = groupBy(errs, (r: EventRow) => r.error_type as string);
  return Object.entries(byType)
    .map(([error_type, list]) => ({
      error_type,
      count: list.length,
      channelImpact: Object.fromEntries(
        Object.entries(groupBy(list, (r: EventRow) => r.channel)).map(([ch, l]) => [ch, l.length]),
      ),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function top24hErrors(hourlyData?: Array<{ date: string; failedRequests: number; errorType?: string }>): Array<{
  error_type: string;
  count: number;
  channelImpact: Record<string, number>;
}> {
  // Generate deterministic 24h error data that sums to total hourly errors
  const errorTypes = ['Timeout', 'Network', 'Auth', 'Validation', 'Server'];
  const channels = ['web', 'mobile', 'call_center', 'provider_app', 'employee'];
  
  // Use provided hourly data or generate new data if not provided
  const actualHourlyData = hourlyData || hourlyErrorTrend([]);
  
  // Count errors by type from the hourly data
  const errorCounts: Record<string, number> = {};
  errorTypes.forEach(type => errorCounts[type] = 0);
  
  actualHourlyData.forEach(hour => {
    if (hour.failedRequests > 0 && hour.errorType) {
      errorCounts[hour.errorType] = (errorCounts[hour.errorType] || 0) + hour.failedRequests;
    }
  });
  
  // Create error distribution based on actual counts from hourly data
  const errorDistribution = errorTypes.map((errorType) => {
    const count = errorCounts[errorType] || 0;
    
    // Distribute across channels - ensure all channels have some impact and no negatives
    const channelImpact: Record<string, number> = {};
    let remainingCount = count;
    
    channels.forEach((channel, channelIndex) => {
      const seed = errorType.charCodeAt(0) * 123; // Generate seed from error type
      const channelSeed = seed + channelIndex * 456;
      const minImpact = Math.max(1, Math.floor(count * 0.1)); // At least 10% or 1 error per channel
      const maxImpact = Math.floor(count * 0.3); // Max 30% per channel
      
      let channelCount;
      if (channelIndex === channels.length - 1) {
        // Last channel gets remaining count, but ensure it's not negative
        channelCount = Math.max(0, remainingCount);
      } else {
        const baseChannelShare = Math.abs(Math.cos(channelSeed)) * 0.2 + 0.1; // 10-30%
        channelCount = Math.max(minImpact, Math.min(maxImpact, Math.floor(count * baseChannelShare)));
        // Ensure we don't exceed remaining count and leave room for other channels
        const minReserveForOthers = (channels.length - channelIndex - 1) * minImpact;
        channelCount = Math.min(channelCount, Math.max(0, remainingCount - minReserveForOthers));
      }
      
      channelImpact[channel] = Math.max(0, channelCount);
      remainingCount = Math.max(0, remainingCount - channelCount);
    });
    
    return {
      error_type: errorType,
      count,
      channelImpact
    };
  });
  
  // Sort by count
  return errorDistribution
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function errorTrend(rows: EventRow[], range: RangeId) {
  const { days } = getDateRange(range);
  const errs = rows.filter((r: EventRow) => r.error_type);
  const byDay = groupBy(errs, (r: EventRow) => formatDateYYYYMMDD(new Date(r.timestamp)));
  return days.map((d) => ({ date: d, errors: (byDay[d] ?? []).length }));
}

export function hourlyErrorTrendWithUptime(rows: EventRow[], maxErrors: number): Array<{ date: string; failedRequests: number; errorType?: string }> {
  // Generate last 24 hours ending at current hour (truncated)
  const now = new Date();
  const currentHour = now.getHours(); // Current hour (0-23)
  const errorTypes = ['Timeout', 'Network', 'Auth', 'Validation', 'Server'];
  
  // Create array for last 24 hours ending at current hour
  const hourlyData: Array<{ date: string; failedRequests: number; errorType?: string }> = [];
  
  // Generate 24 hours of data, starting from currentHour (now) to 24 hours ago
  for (let i = 0; i < 24; i++) {
    // Calculate the hour for this data point
    // Start from current hour (0 hours ago) and go backward
    const hoursAgo = i; // 0 hours ago (current) to 23 hours ago
    const targetDate = new Date(now);
    targetDate.setHours(now.getHours() - hoursAgo, 0, 0, 0); // Set to exact hour
    
    const hour = targetDate.getHours();
    const timeLabel = `${String(hour).padStart(2, '0')}:00`;
    
    hourlyData.push({
      date: timeLabel,
      failedRequests: 0,
      errorType: undefined
    });
  }
  
  // Distribute errors based on maxErrors limit across specific time slots deterministically
  const errorSlots = [2, 8, 14, 18, 21, 23]; // Indices in our 24-hour array
  let remainingErrors = maxErrors;
  
  errorSlots.forEach((slotIndex, index) => {
    if (remainingErrors > 0 && slotIndex < hourlyData.length) {
      // Use deterministic logic to decide if this slot gets an error
      const seed = slotIndex * 123 + index * 456 + currentHour; // Include current hour for variation
      const shouldHaveError = Math.abs(Math.sin(seed)) > 0.3; // ~70% chance
      
      if (shouldHaveError) {
        // Assign error type deterministically
        const errorTypeSeed = seed + slotIndex * 789;
        const errorTypeIndex = Math.abs(Math.floor(Math.sin(errorTypeSeed) * errorTypes.length));
        const errorType = errorTypes[errorTypeIndex % errorTypes.length];
        
        hourlyData[slotIndex]!.failedRequests = 1;
        hourlyData[slotIndex]!.errorType = errorType;
        remainingErrors--;
      }
    }
  });
  
  return hourlyData;
}

export function hourlyErrorTrend(rows: EventRow[]): Array<{ date: string; failedRequests: number; errorType?: string }> {
  // Generate last 24 hours ending at current hour (truncated)
  const now = new Date();
  const currentHour = now.getHours(); // Current hour (0-23)
  const maxTotalErrors = 6;
  const errorTypes = ['Timeout', 'Network', 'Auth', 'Validation', 'Server'];
  
  // Create array for last 24 hours ending at current hour
  const hourlyData: Array<{ date: string; failedRequests: number; errorType?: string }> = [];
  
  // Generate 24 hours of data, starting from currentHour (now) to 24 hours ago
  for (let i = 0; i < 24; i++) {
    // Calculate the hour for this data point
    // Start from current hour (0 hours ago) and go backward
    const hoursAgo = i; // 0 hours ago (current) to 23 hours ago
    const targetDate = new Date(now);
    targetDate.setHours(now.getHours() - hoursAgo, 0, 0, 0); // Set to exact hour
    
    const hour = targetDate.getHours();
    const timeLabel = `${String(hour).padStart(2, '0')}:00`;
    
    hourlyData.push({
      date: timeLabel,
      failedRequests: 0,
      errorType: undefined
    });
  }
  
  // Distribute up to 6 errors across specific time slots deterministically
  const errorSlots = [2, 8, 14, 18, 21, 23]; // Indices in our 24-hour array
  let remainingErrors = maxTotalErrors;
  
  errorSlots.forEach((slotIndex, index) => {
    if (remainingErrors > 0 && slotIndex < hourlyData.length) {
      // Use deterministic logic to decide if this slot gets an error
      const seed = slotIndex * 123 + index * 456 + currentHour; // Include current hour for variation
      const shouldHaveError = Math.abs(Math.sin(seed)) > 0.3; // ~70% chance
      
      if (shouldHaveError) {
        // Assign error type deterministically
        const errorTypeSeed = seed + slotIndex * 789;
        const errorTypeIndex = Math.abs(Math.floor(Math.sin(errorTypeSeed) * errorTypes.length));
        const errorType = errorTypes[errorTypeIndex % errorTypes.length];
        
        hourlyData[slotIndex]!.failedRequests = 1;
        hourlyData[slotIndex]!.errorType = errorType;
        remainingErrors--;
      }
    }
  });
  
  return hourlyData;
}

export type SystemStatus = 'operational' | 'minor-delays' | 'service-disruption';

export function calculateSystemStatus(rows: EventRow[]): {
  status: SystemStatus;
  uptime: number;
  errorRate: number;
  title: string;
  description: string;
  userGuidance: string;
} {
  const { errorRate, successRate } = computeKpis(rows);
  
  // Calculate uptime as inverse of error rate with deterministic variation
  const baseUptime = 100 - (errorRate * 0.1); // Scale error rate impact
  const seed = rows.length > 0 ? rows[0]!.timestamp.charCodeAt(0) : 0;
  const deterministicVariation = Math.sin(seed) * 1; // Deterministic variation between -1 and 1
  const uptime = Math.max(95, Math.min(100, baseUptime + deterministicVariation));
  
  // Determine status based on uptime and error rate thresholds
  let status: SystemStatus;
  let title: string;
  let description: string;
  let userGuidance: string;
  
  if (uptime >= 99.5 && errorRate <= 5) {
    status = 'operational';
    title = '✅ All Systems Operational';
    description = 'All systems are stable. Requests are processing normally.';
    userGuidance = 'Proceed as usual.';
  } else if (uptime >= 98.0 && errorRate <= 15) {
    status = 'minor-delays';
    title = '⚠️ Minor Delays';
    description = 'Some requests may be delayed; expect longer approval times.';
    userGuidance = 'Expect small delays; re-check approvals in a few minutes.';
  } else {
    status = 'service-disruption';
    title = '❌ Service Disruption';
    description = 'Service outage; some requests may fail — retry later.';
    userGuidance = 'Please call support or retry after 15 minutes.';
  }
  
  return {
    status,
    uptime: Number(uptime.toFixed(1)),
    errorRate,
    title,
    description,
    userGuidance
  };
}


