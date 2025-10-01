"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GaugeCard } from "./GaugeCard";

type GaugeRequest = { targetMs: number } | null;

export function AgenticBox() {
  const router = useRouter();
  const params = useSearchParams();
  const tenant = params.get("tenant") ?? "alpha-health";
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string>("");
  const [gauge, setGauge] = useState<GaugeRequest>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().toLowerCase();

    // Canned: approvals dip insight -> set last 7d and hint at errors spike
    if (text.includes("approvals dip") || text.includes("approvals dip this week")) {
      const q = new URLSearchParams(params.toString());
      q.set("range", "7d");
      router.push(`?${q.toString()}`);
      setGauge(null);
      setMessage(
        `Observed a mild increase in error rates on Eligibility API for ${tenant} over the last 3 days, with weekend traffic drop contributing to lower approvals. Consider retry backoff and surfacing self-serve flows.`,
      );
      return;
    }

    // Canned: create gauge for p95 latency target
    const gaugeMatch = text.match(/gauge.*p95.*target\s*(\d+)\s*ms/);
    if (gaugeMatch && gaugeMatch[1]) {
      const target = parseInt(gaugeMatch[1], 10);
      setMessage(`Rendering gauge for p95 latency vs target ${target}ms.`);
      setGauge({ targetMs: target });
      return;
    }

    setGauge(null);
    setMessage("Sorry, try: 'Why did approvals dip this week for {tenant}?' or 'Create a gauge for p95 latency target 2000ms'.");
  }

  return (
    <div className="card">
      <div className="card-title">Agentic insight</div>
      <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
        <input
          aria-label="Ask the dashboard"
          placeholder="Ask the dashboard…"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Ask
        </button>
      </form>
      {message ? <div className="mt-3 text-sm text-gray-700">{message}</div> : null}
      {gauge ? (
        <div className="mt-3">
          <GaugeCard title="p95 latency target" currentMs={1800} targetMs={gauge.targetMs} />
        </div>
      ) : null}
    </div>
  );
}


