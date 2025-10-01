import { Suspense } from "react";
import { CommandCenter } from "@components/pages/CommandCenter";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading dashboard…</div>}>
      <CommandCenter />
    </Suspense>
  );
}


