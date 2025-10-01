"use client";

import { useState } from "react";

export function Tooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <button
        aria-label="KPI definition"
        className="h-5 w-5 rounded-full border text-[10px] leading-4"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open ? (
        <span className="absolute left-4 top-8 z-10 w-72 rounded-md border bg-white p-3 text-xs shadow">
          {content}
        </span>
      ) : null}
    </span>
  );
}


