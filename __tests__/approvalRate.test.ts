import { computeKpis } from "@lib/aggregations";

describe("approval rate proxy", () => {
  it("is bounded 0-100 and approvals never exceed requests", () => {
    const ts = new Date().toISOString();
    const rows: any[] = [
      { tenant_id: "t", timestamp: ts, channel: "web", stage: "intent", status: "requested", duration_ms: 10, csat: 90, aht_ms: 100 },
      { tenant_id: "t", timestamp: ts, channel: "web", stage: "eligibility", status: "approved", duration_ms: 12, csat: 90, aht_ms: 100 },
      { tenant_id: "t", timestamp: ts, channel: "web", stage: "eligibility", status: "approved", duration_ms: 12, csat: 90, aht_ms: 100 },
    ];
    const k = computeKpis(rows as any);
    expect(k.totalRequests).toBe(rows.length);
    expect(k.approvals).toBeLessThanOrEqual(k.totalRequests);
    expect(k.approvalRate).toBeGreaterThan(0);
    expect(k.approvalRate).toBeLessThanOrEqual(100);
  });
});


