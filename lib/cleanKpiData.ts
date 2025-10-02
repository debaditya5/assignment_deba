"use client";

import { RangeId } from "@lib/date";

export interface CleanKPIData {
  date: string;
  value: number;
}

/**
 * Generate clean, controlled dummy data for ALL KPIs
 * Each KPI has its own seed and pattern to ensure different but realistic data
 * Values vary by tenant to make data more realistic
 */
export function generateCleanKPIData(kpiType: 
  'CSAT' | 'ApprovalRate' | 'SuccessRate' | 'NPS' | 'FirstContactResolution' | 'AbandonRate' |
  'CoverageConfirmation' | 'AuthorizationConversion' | 'CostToServe' |
  'QueueDepth' | 'AvgHandlingTime' | 'AgentUtilization' | 'SelfServeDeflection' |
  'LatencyP50' | 'LatencyP95' | 'ErrorRate' | 'RetryRate' | 'TimeoutRate', 
  range: RangeId, 
  tenant: string = 'alpha-health'): CleanKPIData[] {
  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const data: CleanKPIData[] = [];
  const today = new Date();
  
  // Different seeds for each KPI to ensure unique patterns
  const baseSeed = {
    'CSAT': 12345,
    'ApprovalRate': 67890,
    'SuccessRate': 54321,
    'NPS': 11111,
    'FirstContactResolution': 22222,
    'AbandonRate': 33333,
    'CoverageConfirmation': 44444,
    'AuthorizationConversion': 55555,
    'CostToServe': 66666,
    'QueueDepth': 77777,
    'AvgHandlingTime': 88888,
    'AgentUtilization': 99999,
    'SelfServeDeflection': 10101,
    'LatencyP50': 20202,
    'LatencyP95': 30303,
    'ErrorRate': 40404,
    'RetryRate': 50505,
    'TimeoutRate': 60606
  };
  
  // Add tenant variation to seed and create tenant-specific modifiers
  const tenantHash = tenant.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = baseSeed[kpiType] + (tenantHash * 1000);
  
  // Create significant tenant-based performance modifiers for key KPIs
  const getTenantModifier = (kpiType: string, tenant: string) => {
    const tenantModifiers: { [key: string]: { [key: string]: number } } = {
      'alpha-health': {
        'CSAT': 3,           // Alpha Health performs better in CSAT
        'ApprovalRate': -4,   // But worse in approval rate
        'SuccessRate': 2,     // Better success rate
        'ErrorRate': 2        // Higher error rate
      },
      'beta-care': {
        'CSAT': -2,          // Beta Care has lower CSAT
        'ApprovalRate': 5,    // But much better approval rate
        'SuccessRate': -3,    // Lower success rate
        'ErrorRate': -3       // Lower error rate (better)
      },
      'gamma-medical': {
        'CSAT': -1,          // Gamma Medical has moderate CSAT
        'ApprovalRate': -2,   // Lower approval rate
        'SuccessRate': 0,     // Average success rate
        'ErrorRate': 1        // Slightly higher error rate
      }
    };
    
    return tenantModifiers[tenant]?.[kpiType] || 0;
  };
  
  const tenantModifier = getTenantModifier(kpiType, tenant);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    let value: number;
    
    // Create deterministic pseudo-random using seed and day index
    const pseudoRandom1 = Math.sin(seed + i * 100) * 0.5;
    const pseudoRandom2 = Math.cos(seed + i * 200) * 0.5;
    const pseudoRandom3 = Math.sin(seed + i * 300) * 0.3;
    
    switch (kpiType) {
      case 'CSAT': {
        // CSAT: Gradual improvement trend with some volatility (75-90 range)
        const csatBase = 82 + tenantModifier;
        const improvementTrend = (i / days) * 8;
        const volatility = pseudoRandom1 * 6;
        const weekendBoost = (i % 7 === 0 || i % 7 === 6) ? 2 : 0;
        value = Math.round((csatBase + improvementTrend + volatility + weekendBoost) * 10) / 10;
        value = Math.max(75, Math.min(92, value));
        break;
      }
        
      case 'ApprovalRate': {
        // Approval Rate: Declining trend with periodic recoveries (70-90 range)
        const approvalBase = 85 + tenantModifier;
        const declineTrend = -(i / days) * 10;
        const periodicRecovery = Math.sin((i / days) * Math.PI * 3) * 4;
        const noise = pseudoRandom2 * 4;
        value = Math.round((approvalBase + declineTrend + periodicRecovery + noise) * 10) / 10;
        value = Math.max(72, Math.min(90, value));
        break;
      }
        
      case 'SuccessRate': {
        // Success Rate: High and stable with minor fluctuations (90-98 range)
        const successBase = 94 + tenantModifier;
        const stability = pseudoRandom3 * 3;
        const qualityDays = (i % 5 === 0) ? 2 : 0;
        const minorTrend = Math.sin((i / days) * Math.PI) * 2;
        value = Math.round((successBase + stability + qualityDays + minorTrend) * 10) / 10;
        value = Math.max(91, Math.min(97, value));
        break;
      }
        
      case 'NPS':
        // NPS: Lower than CSAT, gradual improvement (65-85 range)
        const npsBase = 75;
        const npsImprovement = (i / days) * 6;
        const npsVolatility = pseudoRandom1 * 8;
        value = Math.round(npsBase + npsImprovement + npsVolatility);
        value = Math.max(65, Math.min(85, value));
        break;
        
      case 'FirstContactResolution':
        // FCR: Steady improvement with occasional dips (70-90 range)
        const fcrBase = 78;
        const fcrImprovement = (i / days) * 10;
        const fcrDips = (i % 7 === 1) ? -5 : 0; // Monday dips
        const fcrNoise = pseudoRandom2 * 4;
        value = Math.round(fcrBase + fcrImprovement + fcrDips + fcrNoise);
        value = Math.max(70, Math.min(90, value));
        break;
        
      case 'AbandonRate':
        // Abandon Rate: Lower is better, declining trend (5-25 range)
        const abandonBase = 15;
        const abandonImprovement = -(i / days) * 8; // Declining is good
        const abandonSpikes = (i % 10 === 0) ? 5 : 0; // Occasional spikes
        const abandonNoise = pseudoRandom3 * 3;
        value = Math.round(abandonBase + abandonImprovement + abandonSpikes + abandonNoise);
        value = Math.max(5, Math.min(25, value));
        break;
        
      case 'CoverageConfirmation':
        // Coverage Confirmation: Stable high performance (80-95 range)
        const coverageBase = 88;
        const coverageStability = pseudoRandom1 * 4;
        const coverageTrend = Math.sin((i / days) * Math.PI * 2) * 3;
        value = Math.round(coverageBase + coverageStability + coverageTrend);
        value = Math.max(80, Math.min(95, value));
        break;
        
      case 'AuthorizationConversion':
        // Authorization Conversion: Moderate performance with growth (60-85 range)
        const authBase = 72;
        const authGrowth = (i / days) * 8;
        const authVolatility = pseudoRandom2 * 6;
        value = Math.round(authBase + authGrowth + authVolatility);
        value = Math.max(60, Math.min(85, value));
        break;
        
      case 'CostToServe':
        // Cost to Serve: Lower is better, improving over time (2-8 range)
        const costBase = 5;
        const costImprovement = -(i / days) * 2; // Declining cost is good
        const costVariability = pseudoRandom3 * 1.5;
        value = Math.round((costBase + costImprovement + costVariability) * 10) / 10;
        value = Math.max(2, Math.min(8, value));
        break;
        
      case 'QueueDepth':
        // Queue Depth: Lower is better, fluctuating (1-8 range)
        const queueBase = 4;
        const queueFluctuation = Math.sin((i / days) * Math.PI * 4) * 2;
        const queueNoise = pseudoRandom1 * 1.5;
        value = Math.round(queueBase + queueFluctuation + queueNoise);
        value = Math.max(1, Math.min(8, value));
        break;
        
      case 'AvgHandlingTime':
        // Avg Handling Time: In seconds, lower is better (120-300 range)
        const ahtBase = 210;
        const ahtImprovement = -(i / days) * 30; // Improving over time
        const ahtVariability = pseudoRandom2 * 40;
        value = Math.round(ahtBase + ahtImprovement + ahtVariability);
        value = Math.max(120, Math.min(300, value));
        break;
        
      case 'AgentUtilization':
        // Agent Utilization: Balanced is best, around 75-85% (70-90 range)
        const utilBase = 78;
        const utilBalance = Math.sin((i / days) * Math.PI) * 5;
        const utilNoise = pseudoRandom3 * 4;
        value = Math.round(utilBase + utilBalance + utilNoise);
        value = Math.max(70, Math.min(90, value));
        break;
        
      case 'SelfServeDeflection':
        // Self-Serve Deflection: Higher is better, growing (40-80 range)
        const selfServeBase = 60;
        const selfServeGrowth = (i / days) * 12;
        const selfServeVariability = pseudoRandom1 * 6;
        value = Math.round(selfServeBase + selfServeGrowth + selfServeVariability);
        value = Math.max(40, Math.min(80, value));
        break;
        
      case 'LatencyP50':
        // Latency P50: In ms, lower is better (800-1500 range)
        const p50Base = 1150;
        const p50Improvement = -(i / days) * 200; // Improving over time
        const p50Variability = pseudoRandom2 * 150;
        value = Math.round(p50Base + p50Improvement + p50Variability);
        value = Math.max(800, Math.min(1500, value));
        break;
        
      case 'LatencyP95':
        // Latency P95: In ms, higher than P50 (1500-2500 range)
        const p95Base = 2000;
        const p95Improvement = -(i / days) * 250;
        const p95Variability = pseudoRandom3 * 200;
        value = Math.round(p95Base + p95Improvement + p95Variability);
        value = Math.max(1500, Math.min(2500, value));
        break;
        
      case 'ErrorRate':
        // Error Rate: Lower is better, improving (2-15 range)
        const errorBase = 8 + tenantModifier;
        const errorImprovement = -(i / days) * 4;
        const errorSpikes = (i % 12 === 0) ? 3 : 0; // Occasional spikes
        const errorNoise = pseudoRandom1 * 2;
        value = Math.round((errorBase + errorImprovement + errorSpikes + errorNoise) * 10) / 10;
        value = Math.max(2, Math.min(15, value));
        break;
        
      case 'RetryRate':
        // Retry Rate: Lower is better, correlated with error rate (1-10 range)
        const retryBase = 5;
        const retryImprovement = -(i / days) * 2;
        const retryVariability = pseudoRandom2 * 2;
        value = Math.round((retryBase + retryImprovement + retryVariability) * 10) / 10;
        value = Math.max(1, Math.min(10, value));
        break;
        
      case 'TimeoutRate':
        // Timeout Rate: Lower is better, occasional spikes (0.5-5 range)
        const timeoutBase = 2.5;
        const timeoutImprovement = -(i / days) * 1;
        const timeoutSpikes = (i % 15 === 0) ? 1.5 : 0;
        const timeoutNoise = pseudoRandom3 * 0.8;
        value = Math.round((timeoutBase + timeoutImprovement + timeoutSpikes + timeoutNoise) * 10) / 10;
        value = Math.max(0.5, Math.min(5, value));
        break;
        
      default:
        value = 80;
    }
    
    data.push({
      date: dateLabel,
      value: value
    });
  }
  
  return data;
}

/**
 * Calculate the true mathematical average from the generated data
 */
export function calculateCleanAverage(kpiType: 
  'CSAT' | 'ApprovalRate' | 'SuccessRate' | 'NPS' | 'FirstContactResolution' | 'AbandonRate' |
  'CoverageConfirmation' | 'AuthorizationConversion' | 'CostToServe' |
  'QueueDepth' | 'AvgHandlingTime' | 'AgentUtilization' | 'SelfServeDeflection' |
  'LatencyP50' | 'LatencyP95' | 'ErrorRate' | 'RetryRate' | 'TimeoutRate', 
  range: RangeId, 
  tenant: string = 'alpha-health'): number {
  const data = generateCleanKPIData(kpiType, range, tenant);
  const sum = data.reduce((acc, point) => acc + point.value, 0);
  const average = sum / data.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
}

/**
 * Get all clean KPI data and averages for ALL KPIs
 */
export function getAllCleanKPIData(range: RangeId, tenant: string = 'alpha-health') {
  return {
    // Primary KPIs
    csat: {
      data: generateCleanKPIData('CSAT', range, tenant),
      average: calculateCleanAverage('CSAT', range, tenant)
    },
    approvalRate: {
      data: generateCleanKPIData('ApprovalRate', range, tenant),
      average: calculateCleanAverage('ApprovalRate', range, tenant)
    },
    successRate: {
      data: generateCleanKPIData('SuccessRate', range, tenant),
      average: calculateCleanAverage('SuccessRate', range, tenant)
    },
    
    // User Experience Metrics
    nps: {
      data: generateCleanKPIData('NPS', range, tenant),
      average: calculateCleanAverage('NPS', range, tenant)
    },
    firstContactResolution: {
      data: generateCleanKPIData('FirstContactResolution', range, tenant),
      average: calculateCleanAverage('FirstContactResolution', range, tenant)
    },
    abandonRate: {
      data: generateCleanKPIData('AbandonRate', range, tenant),
      average: calculateCleanAverage('AbandonRate', range, tenant)
    },
    
    // Business Metrics
    coverageConfirmation: {
      data: generateCleanKPIData('CoverageConfirmation', range, tenant),
      average: calculateCleanAverage('CoverageConfirmation', range, tenant)
    },
    authorizationConversion: {
      data: generateCleanKPIData('AuthorizationConversion', range, tenant),
      average: calculateCleanAverage('AuthorizationConversion', range, tenant)
    },
    costToServe: {
      data: generateCleanKPIData('CostToServe', range, tenant),
      average: calculateCleanAverage('CostToServe', range, tenant)
    },
    
    // Operational Metrics
    queueDepth: {
      data: generateCleanKPIData('QueueDepth', range, tenant),
      average: calculateCleanAverage('QueueDepth', range, tenant)
    },
    avgHandlingTime: {
      data: generateCleanKPIData('AvgHandlingTime', range, tenant),
      average: calculateCleanAverage('AvgHandlingTime', range, tenant)
    },
    agentUtilization: {
      data: generateCleanKPIData('AgentUtilization', range, tenant),
      average: calculateCleanAverage('AgentUtilization', range, tenant)
    },
    selfServeDeflection: {
      data: generateCleanKPIData('SelfServeDeflection', range, tenant),
      average: calculateCleanAverage('SelfServeDeflection', range, tenant)
    },
    
    // Performance Metrics
    latencyP50: {
      data: generateCleanKPIData('LatencyP50', range, tenant),
      average: calculateCleanAverage('LatencyP50', range, tenant)
    },
    latencyP95: {
      data: generateCleanKPIData('LatencyP95', range, tenant),
      average: calculateCleanAverage('LatencyP95', range, tenant)
    },
    errorRate: {
      data: generateCleanKPIData('ErrorRate', range, tenant),
      average: calculateCleanAverage('ErrorRate', range, tenant)
    },
    retryRate: {
      data: generateCleanKPIData('RetryRate', range, tenant),
      average: calculateCleanAverage('RetryRate', range, tenant)
    },
    timeoutRate: {
      data: generateCleanKPIData('TimeoutRate', range, tenant),
      average: calculateCleanAverage('TimeoutRate', range, tenant)
    }
  };
}
