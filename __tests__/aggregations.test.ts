import { percentile, computeKpis, dailyRequestsApprovals } from "@lib/aggregations";
import { getDateRange } from "@lib/date";

describe("percentile", () => {
  it("returns 0 for empty", () => {
    expect(percentile([], 95)).toBe(0);
  });

  it("computes median and p95 deterministically", () => {
    const values = [10, 20, 30, 40, 50, 60, 70];
    expect(percentile(values, 50)).toBe(40);
    expect(percentile(values, 95)).toBe(70);
  });
});

describe("computeKpis", () => {
  const base = new Date().toISOString();
  const rows = [
    { tenant_id: "t1", timestamp: base, channel: "web", stage: "intent", status: "requested", duration_ms: 100, csat: 80, aht_ms: 1000 },
    { tenant_id: "t1", timestamp: base, channel: "web", stage: "eligibility", status: "approved", duration_ms: 120, csat: 90, aht_ms: 900 },
    { tenant_id: "t1", timestamp: base, channel: "mobile", stage: "coverage", status: "rejected", duration_ms: 130, csat: 85, aht_ms: 950, error_type: "Auth API" },
  ] as any;

  it("calculates approval rate and csat", () => {
    const k = computeKpis(rows);
    // total requests counted as status === "requested"
    expect(k.totalRequests).toBe(1);
    // approvals = 1
    expect(k.approvals).toBe(1);
    // approvalRate uses approved / requested (proxy here)
    expect(k.approvalRate).toBeGreaterThanOrEqual(0);
    expect(k.csat).toBeGreaterThan(0);
  });
});

describe("dailyRequestsApprovals", () => {
  it("returns an entry per day in range with zeros when missing", () => {
    const range = "7d" as const;
    const { days } = getDateRange(range);
    const rows: any[] = [];
    const out = dailyRequestsApprovals(rows as any, range);
    expect(out).toHaveLength(days.length);
    expect(out.every((r) => r.requests === 0 && r.approvals === 0)).toBe(true);
  });
});


