import { RangeId } from "@lib/date";

export interface KPIDataPoint {
  date: string;
  value: number;
}

// Generate KPI timeline data (same logic as KPITimeline component)
export function generateKPITimelineData(title: string, average: number, range: RangeId): KPIDataPoint[] {
  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const data: KPIDataPoint[] = [];

  // Use current date minus the range for real dates
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Generate data point that varies around the average using ±15% variation
    const variance = average * 0.15;
    
    // Generate completely different data for each metric
    let variation = 0;
    
    // Create deterministic pseudo-random values based on title and index
    const seed = title.length * 1000 + i * 100 + average;
    const pseudoRandom1 = Math.sin(seed) * 0.5;
    const pseudoRandom2 = Math.cos(seed * 1.5) * 0.5;
    const pseudoRandom3 = Math.sin(seed * 2.1) * 0.5;
    
    if (title === 'Queue depth Trend') {
      // Queue depth: Sawtooth pattern with upward trend and occasional spikes
      const sawtooth = ((i / days) * 4) % 1; // 0 to 1, repeating
      const trend = (i / days) * 0.4; // Gradual increase
      const spike = pseudoRandom1 > 0.3 ? pseudoRandom2 * 1.5 : 0;
      variation = (sawtooth - 0.5) * 1.2 + trend + spike;
    }
    else if (title === 'Cost to serve Trend') {
      // Cost to serve: Exponential decay with deterministic fluctuations
      const decay = Math.exp(-(i / days) * 2) * 0.8; // Starts high, decreases
      const randomWalk = Math.sin(i * 0.7) * 0.3 + Math.cos(i * 1.3) * 0.2;
      const noise = pseudoRandom1 * 0.4;
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
      const randomSpike = pseudoRandom1 > 0.35 ? pseudoRandom2 * 1.2 : 0;
      variation = (wave1 + wave2) * (1 + amplitudeGrowth) + randomSpike;
    }
    else if (title === 'First-contact resolution Trend') {
      // First call resolution: Logistic curve (S-shaped improvement)
      const x = (i / days) * 6 - 3; // -3 to 3
      const logistic = 1 / (1 + Math.exp(-x)) - 0.5; // S-curve from -0.5 to 0.5
      const noise = pseudoRandom1 * 0.2;
      variation = logistic * 0.8 + noise;
    }
    else if (title === 'Avg handling time Trend') {
      // Average handle time: Deterministic walk with slight upward drift
      const randomWalk = i === 0 ? 0 : pseudoRandom1 * 0.3;
      const drift = (i / days) * 0.1; // Slight upward drift
      const burst = pseudoRandom2 > 0.4 ? pseudoRandom3 * 2 : 0; // Occasional bursts
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
      const dip = pseudoRandom1 > 0.3 ? -(Math.abs(pseudoRandom2) * 0.3) : 0; // Occasional dips
      const noise = pseudoRandom3 * 0.2;
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
      const spike = pseudoRandom1 > 0.4 ? pseudoRandom2 * 0.8 : 0;
      variation = (sawtooth - 0.5) * 0.8 + trend + spike;
    }
    else if (title === 'Latency p50 Trend') {
      // Latency p50: Decreasing with noise
      const improvement = -(i / days) * 0.3; // Decreasing trend
      const noise = pseudoRandom1 * 0.4;
      const spike = pseudoRandom2 > 0.35 ? pseudoRandom3 * 1.2 : 0;
      variation = improvement + noise + spike;
    }
    else if (title === 'Latency p95 Trend') {
      // Latency p95: More volatile than p50
      const improvement = -(i / days) * 0.2; // Slower improvement
      const volatility = Math.sin(i * 2.5) * 0.3 + Math.cos(i * 1.1) * 0.2;
      const spike = pseudoRandom1 > 0.25 ? pseudoRandom2 * 1.5 : 0;
      variation = improvement + volatility + spike;
    }
    else if (title === 'Error rate Trend') {
      // Error rate: Decreasing with occasional spikes
      const improvement = -(i / days) * 0.4; // Strong decreasing trend
      const spike = pseudoRandom1 > 0.3 ? pseudoRandom2 * 2 : 0; // Occasional spikes
      const noise = pseudoRandom3 * 0.3;
      variation = improvement + spike + noise;
    }
    else if (title === 'Success rate Trend') {
      // Success rate: Steady improvement
      const improvement = (i / days) * 0.3; // Steady upward trend
      const noise = pseudoRandom1 * 0.2;
      variation = improvement + noise;
    }
    else if (title === 'Retry rate Trend') {
      // Retry rate: Decreasing with occasional spikes
      const improvement = -(i / days) * 0.2; // Decreasing trend
      const spike = pseudoRandom1 > 0.4 ? pseudoRandom2 * 1.5 : 0; // Occasional spikes
      const noise = pseudoRandom3 * 0.3;
      variation = improvement + spike + noise;
    }
    else if (title === 'Timeout rate Trend') {
      // Timeout rate: Decreasing with volatility
      const improvement = -(i / days) * 0.3; // Decreasing trend
      const volatility = Math.sin(i * 3.1) * 0.4;
      const spike = pseudoRandom1 > 0.3 ? pseudoRandom2 * 2 : 0;
      variation = improvement + volatility + spike;
    }
    else {
      // Default pattern for any other metrics
      const trend = (i / days) * 0.2; // Slight upward trend
      const noise = pseudoRandom1 * 0.3;
      variation = trend + noise;
    }

    const value = Math.max(0, average + (variation * variance));
    data.push({
      date: dateLabel,
      value: Math.round(value)
    });
  }
  
  return data;
}
