"use client";

type Props = { title: string; currentMs: number; targetMs: number };

export function GaugeCard({ title, currentMs, targetMs }: Props) {
  const progress = Math.max(0, Math.min(1, targetMs / Math.max(1, currentMs)));
  const pct = Math.round(progress * 100);
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="mt-4">
        <div className="h-3 w-full rounded-full bg-gray-200">
          <div
            className="h-3 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            role="progressbar"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <div>Current p95: {currentMs}ms</div>
          <div>Target: {targetMs}ms</div>
          <div>Progress: {pct}%</div>
        </div>
      </div>
    </div>
  );
}


