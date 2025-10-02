"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "./atoms/Tooltip";
import { KPITimeline } from "./KPITimeline";

type Props = {
  title: string;
  value: number;
  max?: number;
  unit: string;
  color: string;
  help: string;
  inverted?: boolean;
  showGauge?: boolean;
  range: string;
  trendData?: {
    previousValue: number;
    changePercent: number;
  };
  onClick?: () => void;
  onDoubleClick?: () => void;
  onChartToggle?: (tileData: {
    title: string;
    average: number;
    unit: string;
    color: string;
    range: string;
  }) => void;
  isChartExpanded?: boolean;
  navigateTo?: string; // URL to navigate to on click
  disableClick?: boolean; // Disable click functionality
  higherIsBetter?: boolean; // Whether higher values are better (default: true)
};

export function EnhancedKPITile({ 
  title, 
  value, 
  max = 100, 
  unit, 
  color,
  help, 
  inverted = false, 
  showGauge = false,
  range,
  trendData,
  onClick,
  onDoubleClick,
  onChartToggle,
  isChartExpanded = false,
  navigateTo,
  disableClick = false,
  higherIsBetter = true
}: Props) {
  const router = useRouter();
  
  const handleClick = (event: React.MouseEvent) => {
    if (disableClick) return;
    
    if (navigateTo) {
      router.push(navigateTo as any);
      return;
    }
    
    // ALWAYS hide all other charts when any tile is clicked
    const allCustomCharts = document.querySelectorAll('[id$="-chart"]');
    allCustomCharts.forEach(chart => {
      if (chart instanceof HTMLElement) {
        chart.style.display = 'none';
      }
    });
    
    // Reset KPIGrid expanded charts
    const resetEvent = new CustomEvent('resetKPIGrid');
    window.dispatchEvent(resetEvent);
    
    // If we have both onClick and onDoubleClick, we need to handle the timing
    if (onClick && onDoubleClick) {
      // For latency tiles with both handlers, execute onClick immediately
      // The double-click will override this behavior
      onClick();
    } else {
      // Normal behavior for tiles without double-click
      if (onChartToggle) {
        onChartToggle({
          title,
          average: value,
          unit,
          color,
          range
        });
      }
      onClick?.();
    }
  };

  const getTrendText = () => {
    if (!trendData) return null;
    
    const { changePercent } = trendData;
    const isUp = changePercent > 0;
    const isDown = changePercent < 0;
    const rangeDays = range === "7d" ? "7 days" : range === "14d" ? "14 days" : "30 days";
    
    if (Math.abs(changePercent) < 0.1) {
      return <span className="text-gray-500 text-sm font-medium">No change in the last {rangeDays}</span>;
    }
    
    // Contextual coloring: green for good trends, red for bad trends
    let trendColor: string;
    if (higherIsBetter) {
      // For metrics where higher is better (CSAT, Approval Rate, etc.)
      trendColor = isUp ? "text-green-600" : "text-red-600";
    } else {
      // For metrics where lower is better (Error Rate, Latency, Abandon Rate, etc.)
      trendColor = isUp ? "text-red-600" : "text-green-600";
    }
    
    const direction = isUp ? "Up" : "Down";
    
    return (
      <span className={`${trendColor} text-sm font-medium`}>
        {direction} by {Math.abs(changePercent).toFixed(1)}% in the last {rangeDays}
      </span>
    );
  };

  // Calculate percentage for the gauge
  const percentage = Math.min((value / max) * 100, 100);
  
  // Determine color based on percentage (green = good, yellow = warning, red = bad)
  const getStatusColor = () => {
    if (inverted) {
      // For inverted metrics (lower is better)
      if (percentage < 33) return "#10b981"; // green
      if (percentage < 66) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    } else {
      // For normal metrics (higher is better)
      if (percentage > 66) return "#10b981"; // green
      if (percentage > 33) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    }
  };

  const statusColor = getStatusColor();
  
  // Create gauge arc
  const radius = 70;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={`card transition-all duration-200 ${
        disableClick ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
      } ${isChartExpanded ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
      onClick={handleClick}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDoubleClick?.();
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <Tooltip content={help} />
        {isChartExpanded && (
          <div className="ml-auto text-xs text-blue-600 font-medium">Chart Expanded</div>
        )}
      </div>
      
      {showGauge ? (
        // Gauge display for primary KPIs
        <div className="relative flex flex-col items-center">
          <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
            {/* Background arc */}
            <path
              d="M 15 85 A 70 70 0 0 1 165 85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            <path
              d="M 15 85 A 70 70 0 0 1 165 85"
              fill="none"
              stroke={statusColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute bottom-2 text-center">
            <div className="text-2xl font-bold" style={{ color: statusColor }}>
              {unit === "$" ? unit : ""}{value.toFixed(unit === "%" ? 1 : unit === "$" ? 0 : 0)}{unit !== "$" ? unit : ""}
            </div>
            <div className="text-xs text-gray-500">of {max}{unit}</div>
          </div>
        </div>
      ) : (
        // Number display for secondary KPIs
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: statusColor }}>
            {unit === "$" ? unit : ""}{value.toFixed(unit === "%" ? 1 : unit === "$" ? 0 : 0)}{unit !== "$" ? unit : ""}
          </div>
        </div>
      )}
      
      {/* Trend indicator */}
      <div className="mt-2 text-xs text-center">
        {getTrendText()}
      </div>
    </div>
  );
}
