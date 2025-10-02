"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { HourlyErrorChart } from "./HourlyErrorChart";
import { ErrorsTable } from "./ErrorsTable";

type Props = {
  hourlyErrorData: Array<{ date: string; failedRequests: number }>;
  topErrorsData: Array<{
    error_type: string;
    count: number;
    channelImpact: Record<string, number>;
  }>;
  tenant: string;
};

export function TechnicalDetailsPanel({ hourlyErrorData, topErrorsData, tenant }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Listen for expand all sections event
    const handleExpandAll = () => {
      setIsExpanded(true);
    };
    
    window.addEventListener('expandAllSections', handleExpandAll);
    
    return () => {
      window.removeEventListener('expandAllSections', handleExpandAll);
    };
  }, []);

  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-red-500 pl-3">Technical Details</h2>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-6 space-y-6 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
          {/* 24h Error Rate Chart */}
          <div>
            <HourlyErrorChart
              title="24h Error Rate"
              help="Errors: Hourly count of failed requests over the last 24 hours. Use this to spot spikes and investigate recent changes."
              data={hourlyErrorData}
              exportName={`${tenant}-error-trend-24h`}
              heightClass="h-64"
            />
          </div>

          {/* Incident Log (Last 24h) */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-3">Incident Log (Last 24h)</h3>
            <ErrorsTable data={topErrorsData.slice(0, 5)} />
          </div>

        </div>
      )}
    </div>
  );
}
