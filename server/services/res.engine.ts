import type { Zone, ResScore } from "@shared/schema";

/**
 * RES (Resilience Environmental Score) Calculation Engine
 * 
 * Formula: RES = 100 - [W1(AirRisk) + W2(WaterDeficit) + W3(PopDensity) + W4(IndustrialZone)]
 * 
 * Weights:
 * - W1 = 0.4 (Air Quality - 40% impact)
 * - W2 = 0.3 (Water Deficit - 30% impact)
 * - W3 = 0.2 (Population Density - 20% impact)
 * - W4 = 0.1 (Industrial Zone - 10% penalty if true)
 */

interface ResWeights {
  airQuality: number;
  waterDeficit: number;
  populationDensity: number;
  industrialZone: number;
}

const DEFAULT_WEIGHTS: ResWeights = {
  airQuality: 0.4,
  waterDeficit: 0.3,
  populationDensity: 0.2,
  industrialZone: 0.1,
};

/**
 * Calculate Air Risk score from PM2.5 concentration
 * PM2.5 thresholds (WHO guidelines):
 * - 0-50: Good (0-25% risk)
 * - 50-100: Moderate (25-50% risk)
 * - 100-150: Unhealthy (50-75% risk)
 * - 150+: Hazardous (75-100% risk)
 */
export function calculateAirRisk(pm25: number): number {
  if (pm25 <= 50) {
    return (pm25 / 50) * 25;
  } else if (pm25 <= 100) {
    return 25 + ((pm25 - 50) / 50) * 25;
  } else if (pm25 <= 150) {
    return 50 + ((pm25 - 100) / 50) * 25;
  } else {
    return Math.min(75 + ((pm25 - 150) / 150) * 25, 100);
  }
}

/**
 * Calculate RES score for a zone
 */
export function calculateResScore(
  zone: Zone,
  pm25: number,
  weights: ResWeights = DEFAULT_WEIGHTS
): ResScore {
  // Calculate individual risk components (0-100 scale)
  const airRisk = calculateAirRisk(pm25);
  const waterDeficit = zone.waterDeficit; // Already 0-100
  const densityFactor = zone.densityFactor; // Already 0-100
  const industrialPenalty = zone.industrialZone ? 10 : 0; // Fixed 10-point penalty

  // Apply weights and calculate total risk
  const totalRisk =
    weights.airQuality * airRisk +
    weights.waterDeficit * waterDeficit +
    weights.populationDensity * densityFactor +
    (zone.industrialZone ? industrialPenalty : 0);

  // RES = 100 - totalRisk, clamped to 0-100
  const resScore = Math.max(0, Math.min(100, 100 - totalRisk));

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    score: resScore,
    airRisk,
    waterDeficit,
    densityFactor,
    industrialPenalty,
    timestamp: new Date().toISOString(),
    pm25,
  };
}

/**
 * Calculate RES scores for multiple zones
 */
export function calculateAllResScores(
  zones: Zone[],
  pm25Data: Map<string, number>,
  weights?: ResWeights
): ResScore[] {
  return zones.map((zone) => {
    const pm25 = pm25Data.get(zone.id) || 0;
    return calculateResScore(zone, pm25, weights);
  });
}

/**
 * Get severity level based on RES score
 */
export function getResSeverity(resScore: number): "critical" | "high" | "medium" | "good" {
  if (resScore < 40) return "critical";
  if (resScore < 60) return "high";
  if (resScore < 80) return "medium";
  return "good";
}
