"use client";

import { useEffect, useState } from "react";
import { useUrlParams } from "@lib/useUrlParams";

type LiveOps = { activeAgents: number; queueDepth: number; successRate: number };

export function LiveOpsStrip() {
  const { get } = useUrlParams();
  const tenant = get("tenant") || "alpha-health";
  const baseline = tenant === "alpha-health" ? 97 : tenant === "beta-care" ? 95 : 93;
  const [data, setData] = useState<LiveOps>({ activeAgents: 12, queueDepth: 8, successRate: baseline });

  useEffect(() => {
    let mounted = true;
    function jitter(prev: LiveOps): LiveOps {
      return {
        activeAgents: Math.max(5, prev.activeAgents + (Math.random() > 0.5 ? 1 : -1)),
        queueDepth: Math.max(0, prev.queueDepth + (Math.random() > 0.5 ? 1 : -1)),
        // dampen volatility: small drift toward baseline with slight jitter
        successRate: Math.max(
          80,
          Math.min(
            99,
            Math.round(prev.successRate * 0.8 + baseline * 0.2 + (Math.random() > 0.6 ? 1 : 0) - (Math.random() > 0.6 ? 1 : 0)),
          ),
        ),
      };
    }
    const id = setInterval(() => {
      if (!mounted) return;
      setData((d) => jitter(d));
    }, 1500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [tenant]);

  return (
    <div className="card">
      <div className="card-title">Live ops</div>
      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Active agents</div>
          <div className="text-lg font-semibold">{data.activeAgents}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Queue depth</div>
          <div className="text-lg font-semibold">{data.queueDepth}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-gray-500">Success rate</div>
          <div className="text-lg font-semibold">{data.successRate}%</div>
        </div>
      </div>
    </div>
  );
}


