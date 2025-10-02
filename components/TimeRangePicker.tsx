"use client";

import { useUrlParams } from "@lib/useUrlParams";

const RANGES = [
  { id: "7d", label: "Last 7d", days: 7 },
  { id: "14d", label: "Last 14d", days: 14 },
  { id: "30d", label: "Last 30d", days: 30 },
];

export function TimeRangePicker() {
  const { get, set } = useUrlParams();
  const current = get("range") || "7d";

  function onChange(value: string) {
    set("range", value);
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


