"use client";

type Props = {
  title: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  inverted?: boolean; // For metrics where lower is better
};

export function KPIGauge({ title, value, max, unit, inverted = false }: Props) {
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
    <div className="card">
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
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
            {unit === "$" ? unit : ""}{value.toFixed(unit === "%" || unit === "$" ? 0 : 0)}{unit !== "$" ? unit : ""}
          </div>
          <div className="text-xs text-gray-500">of {max}{unit}</div>
        </div>
      </div>
    </div>
  );
}

