"use client";

import { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";

type Props = {
  title: string;
  average: number;
  unit: string;
  color: string;
  range: string;
};

export function KPITimeline({ title, average, unit, color, range }: Props) {
  const chartData = useMemo(() => {
    // Generate mock time series data based on range
    const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
    const data: { date: string; value: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Generate data point that varies around the average using 3 ± something pattern
      const variance = average * 0.15; // ±15% variation for controlled spread
      
      // Generate completely different data for each metric
      let variation = 0;
      
      if (title === 'Queue depth Trend') {
        // Queue depth: Sawtooth pattern with upward trend and occasional spikes
        const sawtooth = ((i / days) * 4) % 1; // 0 to 1, repeating
        const trend = (i / days) * 0.4; // Gradual increase
        const spike = Math.random() < 0.2 ? (Math.random() - 0.5) * 1.5 : 0;
        variation = (sawtooth - 0.5) * 1.2 + trend + spike;
      }
      else if (title === 'Cost to serve Trend') {
        // Cost to serve: Exponential decay with random fluctuations
        const decay = Math.exp(-(i / days) * 2) * 0.8; // Starts high, decreases
        const randomWalk = Math.sin(i * 0.7) * 0.3 + Math.cos(i * 1.3) * 0.2;
        const noise = (Math.random() - 0.5) * 0.4;
        variation = (decay - 0.4) + randomWalk + noise;
      }
      else if (title === 'CSAT Trend') {
        // CSAT: Step function with improvements
        const steps = Math.floor((i / days) * 3); // 0, 1, 2, 3 steps
        const stepValue = steps * 0.3; // Each step adds 0.3
        const oscillation = Math.sin(i * 2.1) * 0.2;
        const weekendEffect = (i % 7 === 0 || i % 7 === 6) ? 0.1 : 0; // Weekend boost
        variation = stepValue + oscillation + weekendEffect;
      }
      else if (title === 'Agent utilization Trend') {
        // Agent utilization: Double sine wave with increasing amplitude
        const wave1 = Math.sin(i * 1.2) * 0.4;
        const wave2 = Math.sin(i * 2.8) * 0.2;
        const amplitudeGrowth = (i / days) * 0.3; // Amplitude increases over time
        const randomSpike = Math.random() < 0.15 ? (Math.random() - 0.5) * 1.2 : 0;
        variation = (wave1 + wave2) * (1 + amplitudeGrowth) + randomSpike;
      }
      else if (title === 'First-contact resolution Trend') {
        // First call resolution: Logistic curve (S-shaped improvement)
        const x = (i / days) * 6 - 3; // -3 to 3
        const logistic = 1 / (1 + Math.exp(-x)) - 0.5; // S-curve from -0.5 to 0.5
        const noise = (Math.random() - 0.5) * 0.2;
        variation = logistic * 0.8 + noise;
      }
      else if (title === 'Avg handling time Trend') {
        // Average handle time: Random walk with slight upward drift
        const randomWalk = i === 0 ? 0 : (Math.random() - 0.5) * 0.3;
        const drift = (i / days) * 0.1; // Slight upward drift
        const burst = Math.random() < 0.1 ? (Math.random() - 0.5) * 2 : 0; // Occasional bursts
        variation = randomWalk + drift + burst;
      }
      else if (title === 'NPS (proxy) Trend') {
        // Customer satisfaction: Smooth upward curve with seasonal variation
        const smoothCurve = Math.pow(i / days, 1.5) * 0.6; // Smooth upward curve
        const seasonal = Math.sin((i / days) * Math.PI * 2) * 0.3; // Seasonal variation
        const weekendBoost = (i % 7 === 0 || i % 7 === 6) ? 0.2 : 0;
        variation = smoothCurve + seasonal + weekendBoost;
      }
      else if (title === 'Abandon rate Trend') {
        // Abandon rate: Inverted pattern (opposite of CSAT)
        const steps = Math.floor((i / days) * 3); // 0, 1, 2, 3 steps
        const stepValue = -steps * 0.2; // Each step decreases
        const oscillation = -Math.sin(i * 2.1) * 0.3; // Inverted oscillation
        const weekendEffect = (i % 7 === 0 || i % 7 === 6) ? -0.1 : 0; // Weekend decrease
        variation = stepValue + oscillation + weekendEffect;
      }
      else if (title === 'Approval rate Trend') {
        // Approval rate: Steady improvement with occasional dips
        const steadyImprovement = (i / days) * 0.4; // Steady upward trend
        const dip = Math.random() < 0.2 ? -(Math.random() * 0.3) : 0; // Occasional dips
        const noise = (Math.random() - 0.5) * 0.2;
        variation = steadyImprovement + dip + noise;
      }
      else if (title === 'Coverage confirmation Trend') {
        // Coverage confirmation: Staircase pattern
        const steps = Math.floor((i / days) * 4); // 0, 1, 2, 3, 4 steps
        const stepValue = steps * 0.15; // Each step adds 0.15
        const plateau = Math.sin(i * 0.5) * 0.1; // Small plateau variations
        variation = stepValue + plateau;
      }
      else if (title === 'Authorization conversion Trend') {
        // Authorization conversion: Exponential growth
        const growth = Math.pow(i / days, 2) * 0.5; // Exponential growth
        const fluctuation = Math.sin(i * 1.8) * 0.2;
        variation = growth + fluctuation;
      }
      else if (title === 'Self-serve deflection Trend') {
        // Self-serve deflection: Sawtooth with upward trend
        const sawtooth = ((i / days) * 3) % 1; // 0 to 1, repeating
        const trend = (i / days) * 0.3; // Gradual increase
        const spike = Math.random() < 0.1 ? (Math.random() - 0.5) * 0.8 : 0;
        variation = (sawtooth - 0.5) * 0.8 + trend + spike;
      }
      else if (title === 'Latency p50 Trend') {
        // Latency p50: Decreasing with noise
        const improvement = -(i / days) * 0.3; // Decreasing trend
        const noise = (Math.random() - 0.5) * 0.4;
        const spike = Math.random() < 0.15 ? (Math.random() - 0.5) * 1.2 : 0;
        variation = improvement + noise + spike;
      }
      else if (title === 'Latency p95 Trend') {
        // Latency p95: More volatile than p50
        const improvement = -(i / days) * 0.2; // Slower improvement
        const volatility = Math.sin(i * 2.5) * 0.3 + Math.cos(i * 1.1) * 0.2;
        const spike = Math.random() < 0.25 ? (Math.random() - 0.5) * 1.5 : 0;
        variation = improvement + volatility + spike;
      }
      else if (title === 'Error rate Trend') {
        // Error rate: Decreasing with occasional spikes
        const improvement = -(i / days) * 0.4; // Strong decreasing trend
        const spike = Math.random() < 0.2 ? (Math.random() - 0.5) * 2 : 0; // Occasional spikes
        const oscillation = Math.cos(i * 1.7) * 0.15;
        variation = improvement + spike + oscillation;
      }
      else if (title === 'Success rate Trend') {
        // Success rate: Increasing with plateaus
        const improvement = (i / days) * 0.3; // Steady improvement
        const plateau = Math.sin(i * 0.8) * 0.2; // Plateau variations
        const weekendBoost = (i % 7 === 0 || i % 7 === 6) ? 0.15 : 0;
        variation = improvement + plateau + weekendBoost;
      }
      else {
        // Default: Simple sine wave
        variation = Math.sin((i / days) * Math.PI * 2) * 0.5;
      }
      
      // Scale the variation by the variance amount
      variation = variation * variance;
      
      // Calculate the actual average of generated data to center it properly
      let value = average + variation;
      
      // Ensure value is never negative
      value = Math.max(0, value);
      
      // Cap percentage values at 100%
      if (unit === "%" && value > 100) {
        value = 100;
      }
      
      data.push({
        date: dateLabel,
        value: Number(value.toFixed(2))
      });
    }

    // Calculate the actual average of generated data
    const actualAverage = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    
    // Center the data around the target average
    const adjustment = average - actualAverage;
    const centeredData = data.map(d => ({
      ...d,
      value: Math.max(0, d.value + adjustment) // Ensure no negative values
    }));
    
    // Debug logging for queue depth and cost to serve
    if (title.includes("Queue depth") || title.includes("Cost to serve")) {
      const finalAverage = centeredData.reduce((sum, d) => sum + d.value, 0) / centeredData.length;
      console.log(`${title} - Target average: ${average}, Final average: ${finalAverage.toFixed(2)}`);
    }
    
    return centeredData;
  }, [average, range, title, unit]);

  const formatValue = (value: number) => {
    // For small ranges (like around 3), show 1 decimal place
    // For larger ranges, show whole numbers
    const dataValues = chartData.map(d => d.value);
    const minDataValue = Math.min(...dataValues);
    const maxDataValue = Math.max(...dataValues);
    const range = maxDataValue - minDataValue;
    
    const decimalPlaces = range <= 2 ? 1 : 0; // Show 1 decimal for small ranges
    const formattedValue = value.toFixed(decimalPlaces);
    return unit === "$" ? `$${formattedValue}` : `${formattedValue}${unit}`;
  };

  const generateYAxisTicks = () => {
    // Calculate the actual data range from the generated data
    const dataValues = chartData.map(d => d.value);
    const minDataValue = Math.min(...dataValues);
    const maxDataValue = Math.max(...dataValues);
    const range = maxDataValue - minDataValue;
    
    // Add some padding around the actual data range (10% on each side)
    const padding = (maxDataValue - minDataValue) * 0.1;
    const minValue = Math.max(0, minDataValue - padding);
    const maxValue = unit === "%" 
      ? Math.min(100, maxDataValue + padding)
      : maxDataValue + padding;
    
    const ticks = [minValue];
    
    // Always add average as a tick
    if (average > 0) {
      ticks.push(average);
    }
    
    // Add max value as a tick
    ticks.push(maxValue);
    
    // For small ranges, generate more granular ticks
    const isSmallRange = range <= 2;
    const numTicks = isSmallRange ? 7 : 5; // More ticks for small ranges
    
    for (let i = 1; i < numTicks - 1; i++) {
      const tickValue = minValue + ((maxValue - minValue) * i) / (numTicks - 1);
      if (tickValue !== average && tickValue !== minValue && tickValue !== maxValue) {
        ticks.push(tickValue);
      }
    }
    
    // Sort and remove duplicates
    return [...new Set(ticks)].sort((a, b) => a - b);
  };

  return (
    <div className="card">
      <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
      <div style={{ height: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => formatValue(value)}
              domain={(() => {
                const dataValues = chartData.map(d => d.value);
                const minDataValue = Math.min(...dataValues);
                const maxDataValue = Math.max(...dataValues);
                const padding = (maxDataValue - minDataValue) * 0.1;
                const minValue = Math.max(0, minDataValue - padding);
                const maxValue = unit === "%" 
                  ? Math.min(100, maxDataValue + padding)
                  : maxDataValue + padding;
                return [minValue, maxValue];
              })()}
              ticks={generateYAxisTicks()}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), title]}
              contentStyle={{ fontSize: 12 }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11 }}
            />
            {/* Dotted red line showing target average */}
            <ReferenceLine 
              y={average} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ value: `Target: ${formatValue(average)}`, position: 'right', fontSize: 10, fill: '#ef4444' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={title}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
