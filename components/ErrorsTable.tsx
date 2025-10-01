"use client";

type Row = { error_type: string; count: number; channelImpact: Record<string, number> };

export function ErrorsTable({ data }: { data: Row[] }) {
  const formatChannelName = (channel: string) => {
    return channel
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="card-title">Top errors</div>
      </div>
      <div className="mt-3">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-2 py-2 w-1/4">Error type</th>
              <th className="px-2 py-2 w-24">Count</th>
              <th className="px-2 py-2 w-3/4">Channel impact</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.error_type} className="border-t">
                <td className="px-2 py-2">{r.error_type}</td>
                <td className="px-2 py-2">{r.count}</td>
                <td className="px-2 py-2 whitespace-nowrap truncate">
                  {Object.entries(r.channelImpact)
                    .map(([ch, c]) => `${formatChannelName(ch)}: ${c}`)
                    .join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


