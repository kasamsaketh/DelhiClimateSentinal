import axios from "axios";

/**
 * OpenAQ API Data Harvester (v3)
 * Fetches real-time air quality data (PM2.5) for Delhi zones
 */

const OPENAQ_API_BASE = "https://api.openaq.org/v3";

interface OpenAQV3Response {
  results: Array<{
    locationId: number;
    location: string;
    city?: string;
    country?: string;
    measurements: Array<{
      parameter: string;
      value: number;
      unit: string;
      lastUpdated: string;
    }>;
  }>;
}

/**
 * Fetch latest PM2.5 measurements for Delhi region using OpenAQ v3 API
 */
export async function fetchDelhiAirQuality(): Promise<Map<string, number>> {
  try {
    // Step 1: Get Delhi locations
    const locationRes = await axios.get(`${OPENAQ_API_BASE}/locations`, {
      params: { city: "Delhi", limit: 1 },
      timeout: 10000,
    });

    const locationId = locationRes.data.results?.[0]?.id;
    if (!locationId) {
      throw new Error("No Delhi location ID found from OpenAQ.");
    }

    // Step 2: Fetch latest measurements for that location
    const latestRes = await axios.get<OpenAQV3Response>(
      `${OPENAQ_API_BASE}/locations/${locationId}/latest`,
      { timeout: 10000 }
    );

    const measurements = latestRes.data.results[0]?.measurements || [];
    const pm25Values = measurements
      .filter((m) => m.parameter.toLowerCase() === "pm25")
      .map((m) => m.value);

    if (pm25Values.length === 0) {
      throw new Error("No PM2.5 data found for Delhi.");
    }

    // Average PM2.5 value across sensors
    const avgPm25 =
      pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length;

    return new Map([["delhi-avg", avgPm25]]);
  } catch (error) {
    console.error("Error fetching OpenAQ data:", error);
    return new Map();
  }
}

/**
 * Generate synthetic PM2.5 data for zones
 */
export function generateSyntheticPm25(
  zoneId: string,
  basePm25: number = 85,
  industrialZone: boolean = false,
  densityFactor: number = 50
): number {
  let pm25 = basePm25;

  if (industrialZone) pm25 *= 1.3 + Math.random() * 0.3;
  const densityMultiplier = 1 + (densityFactor / 100) * 0.25;
  pm25 *= densityMultiplier;
  pm25 *= 0.85 + Math.random() * 0.3;

  return Math.max(10, Math.min(300, pm25));
}

/**
 * Fetch or generate PM2.5 data for all zones
 */
export async function getZonePm25Data(
  zones: Array<{ id: string; industrialZone: boolean; densityFactor: number }>
): Promise<Map<string, number>> {
  const pm25Data = new Map<string, number>();

  try {
    const realData = await fetchDelhiAirQuality();
    const delhiAvg = realData.get("delhi-avg");

    for (const zone of zones) {
      const basePm25 = delhiAvg || 85;
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
