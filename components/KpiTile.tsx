"use client";

import { ReactNode } from "react";
import { Tooltip } from "./atoms/Tooltip";

type Props = {
  title: string;
  value: string | number;
  delta?: string;
  help?: string;
  accentClass?: string;
  right?: ReactNode;
};

export function KpiTile({ title, value, delta, help, accentClass, right }: Props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${accentClass ?? "bg-gray-900"}`} />
          <div className="card-title">{title}</div>
          {help ? <Tooltip content={help} /> : null}
        </div>
        {right}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        {delta ? <div className="text-xs text-gray-500">{delta}</div> : null}
      </div>
    </div>
  );
}


