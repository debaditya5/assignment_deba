"use client";

import { useMemo, useState, useEffect } from "react";
import { useUrlParams } from "@lib/useUrlParams";
import { TENANTS } from "@data/tenants";
import { RangeId } from "@lib/date";
import { generateTenantData } from "@lib/mock";
import { errorTrend, filterByTenantAndRange, topErrors, calculateSystemStatus, hourlyErrorTrend, hourlyErrorTrendWithUptime, top24hErrors } from "@lib/aggregations";
import { getAllCleanKPIData } from "@lib/cleanKpiData";
import { TenantSwitcher } from "@components/TenantSwitcher";
import { TimeRangePicker } from "@components/TimeRangePicker";
import { StatusBadge } from "@components/StatusBadge";
import { UserGuidanceBox } from "@components/UserGuidanceBox";
import { TechnicalDetailsPanel } from "@components/TechnicalDetailsPanel";
import { ErrorIndexBox } from "@components/ErrorIndexBox";

function ReliabilityPageContent() {
  const { get } = useUrlParams();
  const tenant = get("tenant") || (TENANTS[0]?.id || "alpha-health");
  const range = (get("range") || "7d") as RangeId;
  const [isMitigationExpanded, setIsMitigationExpanded] = useState(false);

  useEffect(() => {
    // Listen for expand all sections event
    const handleExpandAll = () => {
      setIsMitigationExpanded(true);
    };
    
    window.addEventListener('expandAllSections', handleExpandAll);
    
    return () => {
      window.removeEventListener('expandAllSections', handleExpandAll);
    };
  }, []);

  const rows = useMemo(() => generateTenantData(tenant, range, 1), [tenant, range]);
  const filtered = useMemo(() => filterByTenantAndRange(rows, tenant, range), [rows, tenant, range]);

  // Get clean KPI data for today's error rate
  const cleanKPIData = useMemo(() => getAllCleanKPIData(range, tenant), [range, tenant]);
  
  // Get today's error rate (most recent value from the trend data)
  const todaysErrorRate = useMemo(() => {
    const errorData = cleanKPIData.errorRate.data;
    // Get the most recent (today's) error rate value - last element in the array
    return errorData.length > 0 ? errorData[errorData.length - 1]?.value || 0 : 0;
  }, [cleanKPIData.errorRate.data]);

  const systemStatus = useMemo(() => {
    // Calculate system status based on today's error rate
    let status: 'operational' | 'minor-delays' | 'service-disruption';
    let title: string;
    let description: string;
    let userGuidance: string;
    let uptime: number;
    
    if (todaysErrorRate < 10) {
      // Green: Error rate < 10%
      status = 'operational';
      title = '✅ All Systems Operational';
      description = 'All systems are stable. Requests are processing normally.';
      userGuidance = 'Proceed as usual.';
      uptime = 99.5; // 99%+ uptime
    } else if (todaysErrorRate >= 10 && todaysErrorRate <= 12) {
      // Yellow: Error rate 10-12%
      status = 'minor-delays';
      title = '⚠️ Minor Delays';
      description = 'Some requests may be delayed; expect longer approval times.';
      userGuidance = 'Expect small delays; re-check approvals in a few minutes.';
      uptime = 97.0; // 95-99% uptime
    } else {
      // Red: Error rate > 12%
      status = 'service-disruption';
      title = '❌ Service Disruption';
      description = 'Service outage; some requests may fail — retry later.';
      userGuidance = 'Please call support or retry after 15 minutes.';
      uptime = 93.0; // < 95% uptime
    }
    
    return {
      status,
      uptime,
      errorRate: todaysErrorRate,
      title,
      description,
      userGuidance
    };
  }, [todaysErrorRate]);
  
  const hourlyErrors = useMemo(() => {
    // Generate hourly errors based on uptime level
    let maxErrors: number;
    if (systemStatus.uptime > 99) {
      maxErrors = 1; // <2 errors (0-1)
    } else if (systemStatus.uptime >= 95) {
      maxErrors = 3; // 2-4 errors (2-3)
    } else {
      maxErrors = 5; // 4-6 errors (4-5)
    }
    return hourlyErrorTrendWithUptime(filtered, maxErrors);
  }, [filtered, systemStatus.uptime]);
  const top = useMemo(() => top24hErrors(hourlyErrors), [hourlyErrors]); // Use same hourly data for consistency
  const trend = useMemo(() => errorTrend(filtered, range).map((r) => ({ date: r.date, failedRequests: r.errors })), [filtered, range]);

  return (
    <div className="space-y-6">

      {/* Prominent Status Area */}
      <div className="space-y-4">
        <StatusBadge
          status={systemStatus.status}
          title={systemStatus.title}
          description={systemStatus.description}
          uptime={systemStatus.uptime}
          errorRate={systemStatus.errorRate}
        />
        
        <UserGuidanceBox
          status={systemStatus.status}
          userGuidance={systemStatus.userGuidance}
        />
      </div>

      {/* Technical Details Panel */}
      <TechnicalDetailsPanel
        hourlyErrorData={hourlyErrors}
        topErrorsData={top}
        tenant={tenant}
      />

      {/* Error Mitigation Methods - Collapsible */}
      <div className="card">
        <button 
          className="w-full flex items-center justify-between text-left"
          onClick={() => setIsMitigationExpanded(!isMitigationExpanded)}
        >
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-green-500 pl-3">Error Mitigation Methods</h2>
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isMitigationExpanded ? 'rotate-90' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
        
        {isMitigationExpanded && (
          <div className="mt-4 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
            <ErrorIndexBox />
          </div>
        )}
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Page() {
  return <ReliabilityPageContent />;
}


