import axios from "axios";

/**
 * OpenAQ API Data Harvester
 * Fetches real-time air quality data (PM2.5) for Delhi zones
 */

const OPENAQ_API_BASE = "https://api.openaq.org/v2";

interface OpenAQMeasurement {
  parameter: string;
  value: number;
  lastUpdated: string;
  unit: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  location: string;
  city: string;
  country: string;
}

interface OpenAQResponse {
  meta: {
    found: number;
  };
  results: OpenAQMeasurement[];
}

/**
 * Fetch latest PM2.5 measurements for Delhi region
 * Note: OpenAQ API may have rate limits and availability issues
 * In production, implement caching and fallback strategies
 */
export async function fetchDelhiAirQuality(): Promise<Map<string, number>> {
  try {
    const response = await axios.get<OpenAQResponse>(`${OPENAQ_API_BASE}/latest`, {
      params: {
        city: "Delhi",
        parameter: "pm25",
        limit: 100,
      },
      timeout: 10000, // 10 second timeout
    });

    const pm25Data = new Map<string, number>();

    if (response.data && response.data.results) {
      // For each measurement, we'll need to map it to our zones
      // Since we don't have exact location matching, we'll aggregate Delhi-wide data
      // and apply variations based on zone characteristics
      
      const measurements = response.data.results;
      if (measurements.length > 0) {
        // Calculate average PM2.5 for Delhi
        const avgPm25 = measurements.reduce((sum, m) => sum + m.value, 0) / measurements.length;
        
        // Return the average for now
        // In a real implementation, you'd match coordinates to zones
        return new Map([["delhi-avg", avgPm25]]);
      }
    }

    // Return empty map if no data
    return new Map();
  } catch (error) {
    console.error("Error fetching OpenAQ data:", error);
    // Return empty map on error - will use fallback/synthetic data
    return new Map();
  }
}

/**
 * Generate synthetic PM2.5 data for zones
 * Used when OpenAQ API is unavailable or for zones without real data
 * Generates realistic variations based on zone characteristics
 */
export function generateSyntheticPm25(
  zoneId: string,
  basePm25: number = 85,
  industrialZone: boolean = false,
  densityFactor: number = 50
): number {
  // Base PM2.5 value
  let pm25 = basePm25;

  // Industrial zones have +30-60% higher PM2.5
  if (industrialZone) {
    pm25 *= 1.3 + Math.random() * 0.3;
  }

  // Higher density areas have +10-25% higher PM2.5
  const densityMultiplier = 1 + (densityFactor / 100) * 0.25;
  pm25 *= densityMultiplier;

  // Add random variation ±15%
  pm25 *= 0.85 + Math.random() * 0.3;

  // Ensure realistic bounds (10-300 μg/m³)
  return Math.max(10, Math.min(300, pm25));
}

/**
 * Fetch or generate PM2.5 data for all zones
 * Attempts to use real OpenAQ data, falls back to synthetic data
 */
export async function getZonePm25Data(
  zones: Array<{ id: string; industrialZone: boolean; densityFactor: number }>
): Promise<Map<string, number>> {
  const pm25Data = new Map<string, number>();

  try {
    // Try to fetch real data from OpenAQ
    const realData = await fetchDelhiAirQuality();
    const delhiAvg = realData.get("delhi-avg");

    // Generate data for each zone
    for (const zone of zones) {
      const basePm25 = delhiAvg || 85; // Use real average or default
      const pm25 = generateSyntheticPm25(
        zone.id,
        basePm25,
        zone.industrialZone,
        zone.densityFactor
      );
      pm25Data.set(zone.id, pm25);
    }
  } catch (error) {
    console.error("Error in getZonePm25Data:", error);
    // Generate fully synthetic data as fallback
    for (const zone of zones) {
      const pm25 = generateSyntheticPm25(
        zone.id,
        85,
        zone.industrialZone,
        zone.densityFactor
      );
      pm25Data.set(zone.id, pm25);
    }
  }

  return pm25Data;
}
