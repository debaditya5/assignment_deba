"use client";

import { Tooltip } from "@components/atoms/Tooltip";

type Row = { error_type: string; count: number; channelImpact: Record<string, number> };

// Error definitions for tooltips
const ERROR_DEFINITIONS: Record<string, string> = {
  "Timeout": "Your patients experienced delays because our system took too long to process their benefit requests. This typically happens during high-volume periods or when processing complex authorization requests.",
  "Network": "Your patients couldn't access our system due to connectivity issues between their devices and our servers. This affects their ability to check benefits or submit prior authorizations.",
  "Auth": "Your patients had trouble logging in or accessing their benefit information due to authentication failures. This protects patient data but can delay care when legitimate access is blocked.",
  "Validation": "Your patients' information didn't match our records, preventing them from accessing benefits or completing requests. This often occurs with recent life changes or data entry errors.",
  "Server": "Your patients couldn't complete their requests because our backend systems experienced technical difficulties. This prevents benefit checks, prior authorizations, and claims processing.",
};

export function ErrorsTable({ data }: { data: Row[] }) {

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b">
            <th className="px-2 py-2">Error type</th>
            <th className="px-2 py-2">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.error_type} className="border-t">
              <td className="px-2 py-2">
                <div className="flex items-center gap-1">
                  <span>{r.error_type}</span>
                  <Tooltip content={ERROR_DEFINITIONS[r.error_type] || "Error type definition not available"} />
                </div>
              </td>
              <td className="px-2 py-2">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


