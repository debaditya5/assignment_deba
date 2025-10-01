"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [
  { id: "7d", label: "Last 7d", days: 7 },
  { id: "14d", label: "Last 14d", days: 14 },
  { id: "30d", label: "Last 30d", days: 30 },
];

export function TimeRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "14d";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Time range</span>
      <select
        aria-label="Time range picker"
        className="select"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        {RANGES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}


