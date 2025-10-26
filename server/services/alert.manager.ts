import type { ResScore, Alert, InsertAlert } from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Alert Manager - Proactive Alert Generation
 * 
 * Threshold Rules:
 * - Critical: RES < 40 OR PM2.5 > 150
 * - High: RES < 60 OR PM2.5 > 100
 * - Medium: PM2.5 > 50 (informational)
 */

interface AlertThresholds {
  resCritical: number;
  resHigh: number;
  pm25Critical: number;
  pm25High: number;
  pm25Medium: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  resCritical: 40,
  resHigh: 60,
  pm25Critical: 150,
  pm25High: 100,
  pm25Medium: 50,
};

/**
 * Check if an alert should be generated for a zone
 */
export function shouldGenerateAlert(
  resScore: ResScore,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): { shouldAlert: boolean; severity: "critical" | "high" | "medium" | null; message: string | null } {
  // Critical alerts
  if (resScore.score < thresholds.resCritical) {
    return {
      shouldAlert: true,
      severity: "critical",
      message: `Critical resilience failure detected. RES score at ${Math.round(resScore.score)}/100.`,
    };
  }

  if (resScore.pm25 > thresholds.pm25Critical) {
    return {
      shouldAlert: true,
      severity: "critical",
      message: `Hazardous air quality detected. PM2.5 at ${resScore.pm25.toFixed(1)} μg/m³ (>150).`,
    };
  }

  // High priority alerts
  if (resScore.score < thresholds.resHigh) {
    return {
      shouldAlert: true,
      severity: "high",
      message: `Low resilience warning. RES score at ${Math.round(resScore.score)}/100.`,
    };
  }

  if (resScore.pm25 > thresholds.pm25High) {
    return {
      shouldAlert: true,
      severity: "high",
      message: `Unhealthy air quality detected. PM2.5 at ${resScore.pm25.toFixed(1)} μg/m³ (>100).`,
    };
  }

  // Medium priority alerts (informational)
  if (resScore.pm25 > thresholds.pm25Medium) {
    return {
      shouldAlert: true,
      severity: "medium",
      message: `Moderate air quality detected. PM2.5 at ${resScore.pm25.toFixed(1)} μg/m³.`,
    };
  }

  return {
    shouldAlert: false,
    severity: null,
    message: null,
  };
}

/**
 * Generate alerts for all zones based on RES scores
 */
export function generateAlerts(
  resScores: ResScore[],
  thresholds?: AlertThresholds
): Alert[] {
  const alerts: Alert[] = [];

  for (const resScore of resScores) {
    const { shouldAlert, severity, message } = shouldGenerateAlert(resScore, thresholds);

    if (shouldAlert && severity && message) {
      const alert: Alert = {
        id: randomUUID(),
        zoneId: resScore.zoneId,
        zoneName: resScore.zoneName,
        resScore: resScore.score,
        pm25: resScore.pm25,
        severity,
        message,
        timestamp: new Date().toISOString(),
        isActive: true,
      };

      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Deactivate alerts that no longer meet threshold criteria
 */
export function updateAlertStatus(
  existingAlerts: Alert[],
  currentResScores: ResScore[],
  thresholds?: AlertThresholds
): Alert[] {
  return existingAlerts.map((alert) => {
    const currentScore = currentResScores.find((score) => score.zoneId === alert.zoneId);

    if (!currentScore) {
      // Zone no longer exists, deactivate alert
      return { ...alert, isActive: false };
    }

    const { shouldAlert } = shouldGenerateAlert(currentScore, thresholds);

    // Deactivate alert if conditions no longer met
    if (!shouldAlert && alert.isActive) {
      return { ...alert, isActive: false };
    }

    return alert;
  });
}

/**
 * Merge new alerts with existing alerts
 * Avoids duplicate alerts for the same zone with same severity
 */
export function mergeAlerts(existingAlerts: Alert[], newAlerts: Alert[]): Alert[] {
  const merged = [...existingAlerts];

  for (const newAlert of newAlerts) {
    // Check if similar active alert already exists
    const existingSimilar = merged.find(
      (a) =>
        a.zoneId === newAlert.zoneId &&
        a.severity === newAlert.severity &&
        a.isActive
    );

    if (!existingSimilar) {
      merged.push(newAlert);
    }
  }

  return merged;
}
