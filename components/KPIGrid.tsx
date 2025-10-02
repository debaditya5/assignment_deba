"use client";

import { useState, ReactElement, cloneElement, useEffect } from "react";
import { KPITimeline } from "./KPITimeline";
import { CleanKPITimeline } from "./CleanKPITimeline";

type KPIGridProps = {
  children: ReactElement[];
  columns?: string;
  kpiAverages?: any; // Pass the true averages for reference lines
  cleanKPIData?: any; // Pass clean KPI data for primary KPIs
};

// Helper function to map KPI titles to clean data
function getCleanKPIMapping(title: string, cleanKPIData: any) {
  const mappings: { [key: string]: string } = {
    'CSAT': 'csat',
    'Approval rate': 'approvalRate',
    'Success rate': 'successRate',
    'NPS (proxy)': 'nps',
    'First-contact resolution': 'firstContactResolution',
    'Abandon rate': 'abandonRate',
    'Coverage confirmation': 'coverageConfirmation',
    'Authorization conversion': 'authorizationConversion',
    'Cost to serve': 'costToServe',
    'Queue depth': 'queueDepth',
    'Avg handling time': 'avgHandlingTime',
    'Agent utilization': 'agentUtilization',
    'Self-serve deflection': 'selfServeDeflection',
    'Latency p50': 'latencyP50',
    'Latency p95': 'latencyP95',
    'Error rate': 'errorRate',
    'Retry rate': 'retryRate',
    'Timeout rate': 'timeoutRate'
  };
  
  const key = mappings[title];
  return key && cleanKPIData[key] ? cleanKPIData[key] : null;
}

export function KPIGrid({ children, columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4", kpiAverages, cleanKPIData }: KPIGridProps) {
  const [expandedChart, setExpandedChart] = useState<{
    title: string;
    average: number;
    unit: string;
    color: string;
    range: string;
  } | null>(null);

  // Listen for reset events from latency tiles
  useEffect(() => {
    const handleReset = () => {
      setExpandedChart(null);
    };

    window.addEventListener('resetKPIGrid', handleReset);
    return () => window.removeEventListener('resetKPIGrid', handleReset);
  }, []);

  const getTrueAverage = (title: string): number | undefined => {
    if (!kpiAverages) return undefined;
    
    const titleMap: Record<string, keyof typeof kpiAverages> = {
      'CSAT': 'csat',
      'NPS (proxy)': 'nps',
      'First-contact resolution': 'firstContactResolution',
      'Abandon rate': 'abandonRate',
      'Approval rate': 'approvalRate',
      'Coverage confirmation': 'coverageConfirmationRate',
      'Authorization conversion': 'authorizationConversion',
      'Cost to serve': 'costToServe',
      'Queue depth': 'queueDepth',
      'Avg handling time': 'averageHandlingTimeMs',
      'Agent utilization': 'agentUtilization',
      'Self-serve deflection': 'selfServeDeflection',
      'Latency p50': 'latencyP50Ms',
      'Latency p95': 'latencyP95Ms',
      'Error rate': 'errorRate',
      'Success rate': 'successRate',
      'Retry rate': 'retryRate',
      'Timeout rate': 'timeoutRate'
    };
    
    const key = titleMap[title];
    return key ? kpiAverages[key] : undefined;
  };

  const handleTileClick = (tileData?: {
    title: string;
    average: number;
    unit: string;
    color: string;
    range: string;
  }) => {
    // Chart hiding is now handled by EnhancedKPITile.handleClick
    // Just handle the KPIGrid chart expansion/collapse
    if (!tileData) return;
    
    if (expandedChart?.title === tileData.title) {
      setExpandedChart(null);
    } else {
      setExpandedChart(tileData);
    }
  };

  const enhancedChildren = children.map((child, index) => {
    return cloneElement(child, {
      key: index,
      onChartToggle: () => handleTileClick({
        title: child.props.title,
        average: child.props.value,
        unit: child.props.unit,
        color: child.props.color || "#3b82f6",
        range: child.props.range || "7d"
      }),
      isChartExpanded: expandedChart?.title === child.props.title
    });
  });

  return (
    <div className="space-y-4">
      <div className={`grid ${columns} gap-4`}>
        {enhancedChildren}
      </div>
      
      {/* Full-width expanded chart */}
      {expandedChart && (
        <div className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
          {/* Use CleanKPITimeline for all KPIs that have clean data */}
          {(() => {
            const cleanMapping = getCleanKPIMapping(expandedChart.title, cleanKPIData);
            
            if (cleanKPIData && cleanMapping) {
              return (
                <CleanKPITimeline 
                  title={`${expandedChart.title} Trend`}
                  data={cleanMapping.data}
                  average={cleanMapping.average}
                  unit={expandedChart.unit}
                  color={expandedChart.color}
                />
              );
            } else {
              return (
                <KPITimeline 
                  title={`${expandedChart.title} Trend`} 
                  average={expandedChart.average} 
                  unit={expandedChart.unit} 
                  color={expandedChart.color} 
                  range={expandedChart.range} 
                  trueAverage={getTrueAverage(expandedChart.title)}
                />
              );
            }
          })()}
        </div>
      )}
    </div>
  );
}
