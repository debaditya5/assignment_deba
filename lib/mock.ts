import { getDateRange, isWeekend, RangeId } from "@lib/date";
import type { EventRow } from "@lib/aggregations";

export const CHANNELS = ["web", "mobile", "call_center", "provider_app", "employee"] as const;
export type Channel = typeof CHANNELS[number];

export const ERROR_TYPES = [
  "Eligibility API",
  "Auth API",
  "LLM Timeout",
  "Data Mapping",
] as const;

export function generateTenantData(tenant: string, range: RangeId, seed = 1): EventRow[] {
  const { days } = getDateRange(range);
  const rows: EventRow[] = [];
  let rng = mulberry32(hashCode(tenant) + seed);
  for (const d of days) {
    const date = new Date(d + "T12:00:00Z");
    const base = isWeekend(date) ? 60 : 120; // weekday > weekend traffic
    // Tenant-specific biases to produce visibly different KPIs
    const tenantScale = tenant === "alpha-health" ? 1.0 : tenant === "beta-care" ? 0.85 : 0.7;
    const approvalBias = tenant === "alpha-health" ? 0.82 : tenant === "beta-care" ? 0.75 : 0.68; // alpha best approvals
    const csatBias = tenant === "alpha-health" ? 5 : tenant === "beta-care" ? 0 : -3; // alpha higher csat, gamma lower
    const durationBias = tenant === "beta-care" ? 1.15 : tenant === "gamma-health" ? 1.25 : 1.0; // slower for beta/gamma
    const vol = Math.round(base * tenantScale * (0.8 + rng() * 0.4));
    for (let i = 0; i < vol; i++) {
      const channel = CHANNELS[Math.floor(rng() * CHANNELS.length)] as string;
      const stageIdx = Math.floor(rng() * 4);
      const stage = ["intent", "eligibility", "coverage", "authorization"][stageIdx] as any;
      const statusRand = rng();
      const approved = statusRand < approvalBias;
      const rejected = !approved && statusRand > approvalBias + 0.1; // small reject slice
      const status = approved ? "approved" : rejected ? "rejected" : "requested";
      let duration_ms = Math.round((400 + rng() * 1800) * durationBias);
      if (tenant === "beta-care" && i % 13 === 0) duration_ms += 700; // mild latency spike pattern
      if (tenant === "gamma-health" && i % 17 === 0) duration_ms += 1200; // another pattern
      const error = status === "rejected" && rng() > 0.4 ? ERROR_TYPES[Math.floor(rng() * 4)] : undefined;
      const csatBase = (channel === "mobile" ? 80 : channel === "call_center" ? 70 : 75) + csatBias;
      const csat = Math.max(50, Math.min(95, Math.round(csatBase + (0.5 - rng()) * 8)));
      const aht_ms = channel === "call_center" ? Math.round(300000 + rng() * 120000) : Math.round(120000 + rng() * 60000);
      rows.push({
        tenant_id: tenant,
        timestamp: new Date(new Date(d).getTime() + Math.floor(rng() * 86400000)).toISOString(),
        channel,
        stage,
        status,
        duration_ms,
        error_type: error,
        csat,
        aht_ms,
      });
    }
  }
  return rows;
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


