import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculateAllResScores } from "./services/res.engine";
import { getZonePm25Data } from "./services/data.harvester";
import { generateAlerts, updateAlertStatus, mergeAlerts } from "./services/alert.manager";
import {
  insertAirQualityLogSchema,
  insertAlertSchema,
  insertActionReportSchema,
  insertCommunityReportSchema,
} from "@shared/schema";
import cron from "node-cron";

// In-memory cache for RES scores and PM2.5 data
let cachedResScores: any[] = [];
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 60000; // 1 minute

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data on startup
  await updateResScoresAndAlerts();

  // Schedule periodic updates every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running scheduled RES score and alert update...");
    await updateResScoresAndAlerts();
  });

  // ==================== ZONES ====================

  // GET /api/zones - Get all zones
  app.get("/api/zones", async (req, res) => {
    try {
      const zones = await storage.getAllZones();
      res.json(zones);
    } catch (error) {
      console.error("Error fetching zones:", error);
      res.status(500).json({ error: "Failed to fetch zones" });
    }
  });

  // GET /api/zones/:id - Get zone by ID
  app.get("/api/zones/:id", async (req, res) => {
    try {
      const zone = await storage.getZone(req.params.id);
      if (!zone) {
        return res.status(404).json({ error: "Zone not found" });
      }
      res.json(zone);
    } catch (error) {
      console.error("Error fetching zone:", error);
      res.status(500).json({ error: "Failed to fetch zone" });
    }
  });

  // ==================== RES SCORES ====================

  // GET /api/res/scores - Get all current RES scores
  app.get("/api/res/scores", async (req, res) => {
    try {
      // Return cached scores if recent
      const now = Date.now();
      if (now - lastUpdateTime < UPDATE_INTERVAL && cachedResScores.length > 0) {
        return res.json(cachedResScores);
      }

      // Otherwise, calculate fresh scores
      await updateResScoresAndAlerts();
      res.json(cachedResScores);
    } catch (error) {
      console.error("Error calculating RES scores:", error);
      res.status(500).json({ error: "Failed to calculate RES scores" });
    }
  });

  // GET /api/res/scores/:zoneId - Get RES score for specific zone
  app.get("/api/res/scores/:zoneId", async (req, res) => {
    try {
      const score = cachedResScores.find((s) => s.zoneId === req.params.zoneId);
      if (!score) {
        return res.status(404).json({ error: "RES score not found for zone" });
      }
      res.json(score);
    } catch (error) {
      console.error("Error fetching RES score:", error);
      res.status(500).json({ error: "Failed to fetch RES score" });
    }
  });

  // POST /api/res/refresh - Force refresh RES scores and alerts
  app.post("/api/res/refresh", async (req, res) => {
    try {
      await updateResScoresAndAlerts();
      res.json({ message: "RES scores and alerts updated", scores: cachedResScores });
    } catch (error) {
      console.error("Error refreshing RES scores:", error);
      res.status(500).json({ error: "Failed to refresh RES scores" });
    }
  });

  // ==================== AIR QUALITY LOGS ====================

  // GET /api/air-quality - Get all air quality logs
  app.get("/api/air-quality", async (req, res) => {
    try {
      const logs = await storage.getAllAirQualityLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching air quality logs:", error);
      res.status(500).json({ error: "Failed to fetch air quality logs" });
    }
  });

  // GET /api/air-quality/:zoneId - Get air quality logs for zone
  app.get("/api/air-quality/:zoneId", async (req, res) => {
    try {
      const logs = await storage.getAirQualityLogsByZone(req.params.zoneId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching air quality logs:", error);
      res.status(500).json({ error: "Failed to fetch air quality logs" });
    }
  });

  // POST /api/air-quality - Create air quality log
  app.post("/api/air-quality", async (req, res) => {
    try {
      const validated = insertAirQualityLogSchema.parse(req.body);
      const log = await storage.createAirQualityLog(validated);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating air quality log:", error);
      res.status(400).json({ error: "Invalid air quality log data" });
    }
  });

  // ==================== ALERTS ====================

  // GET /api/alerts - Get all alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // GET /api/alerts/active - Get active alerts only
  app.get("/api/alerts/active", async (req, res) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching active alerts:", error);
      res.status(500).json({ error: "Failed to fetch active alerts" });
    }
  });

  // GET /api/alerts/:zoneId - Get alerts for zone
  app.get("/api/alerts/:zoneId", async (req, res) => {
    try {
      const alerts = await storage.getAlertsByZone(req.params.zoneId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // POST /api/alerts - Create alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const validated = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validated);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  // ==================== ACTION REPORTS ====================

  // GET /api/action-reports - Get all action reports
  app.get("/api/action-reports", async (req, res) => {
    try {
      const reports = await storage.getAllActionReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching action reports:", error);
      res.status(500).json({ error: "Failed to fetch action reports" });
    }
  });

  // GET /api/action-reports/:alertId - Get action reports for alert
  app.get("/api/action-reports/:alertId", async (req, res) => {
    try {
      const reports = await storage.getActionReportsByAlert(req.params.alertId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching action reports:", error);
      res.status(500).json({ error: "Failed to fetch action reports" });
    }
  });

  // POST /api/action-reports - Create action report
  app.post("/api/action-reports", async (req, res) => {
    try {
      const validated = insertActionReportSchema.parse(req.body);
      const report = await storage.createActionReport(validated);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating action report:", error);
      res.status(400).json({ error: "Invalid action report data" });
    }
  });

  // ==================== COMMUNITY REPORTS ====================

  // GET /api/community-reports - Get all community reports
  app.get("/api/community-reports", async (req, res) => {
    try {
      const reports = await storage.getAllCommunityReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching community reports:", error);
      res.status(500).json({ error: "Failed to fetch community reports" });
    }
  });

  // GET /api/community-reports/:zoneId - Get community reports for zone
  app.get("/api/community-reports/:zoneId", async (req, res) => {
    try {
      const reports = await storage.getCommunityReportsByZone(req.params.zoneId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching community reports:", error);
      res.status(500).json({ error: "Failed to fetch community reports" });
    }
  });

  // POST /api/community-reports - Create community report
  app.post("/api/community-reports", async (req, res) => {
    try {
      const validated = insertCommunityReportSchema.parse(req.body);
      const report = await storage.createCommunityReport(validated);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating community report:", error);
      res.status(400).json({ error: "Invalid community report data" });
    }
  });

  // POST /api/community-reports/:id/verify - Verify community report
  app.post("/api/community-reports/:id/verify", async (req, res) => {
    try {
      const report = await storage.verifyCommunityReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Community report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error verifying community report:", error);
      res.status(500).json({ error: "Failed to verify community report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

/**
 * Update RES scores and generate alerts
 * Called on startup and periodically via cron
 */
async function updateResScoresAndAlerts() {
  try {
    // Get all zones
    const zones = await storage.getAllZones();

    // Fetch PM2.5 data
    const pm25Data = await getZonePm25Data(zones);

    // Calculate RES scores
    const resScores = calculateAllResScores(zones, pm25Data);

    // Store air quality logs
    for (const score of resScores) {
      await storage.createAirQualityLog({
        zoneId: score.zoneId,
        pm25: score.pm25,
        timestamp: score.timestamp,
      });
    }

    // Generate new alerts
    const newAlerts = generateAlerts(resScores);

    // Update existing alert statuses
    const existingAlerts = await storage.getAllAlerts();
    const updatedAlerts = updateAlertStatus(existingAlerts, resScores);

    // Update alerts in storage
    for (const alert of updatedAlerts) {
      await storage.updateAlert(alert.id, { isActive: alert.isActive });
    }

    // Add new alerts
    for (const alert of newAlerts) {
      // Check if similar alert already exists
      const existing = existingAlerts.find(
        (a) =>
          a.zoneId === alert.zoneId &&
          a.severity === alert.severity &&
          a.isActive
      );

      if (!existing) {
        await storage.createAlert(alert);
      }
    }

    // Cache scores
    cachedResScores = resScores;
    lastUpdateTime = Date.now();

    console.log(`Updated RES scores for ${resScores.length} zones, generated ${newAlerts.length} new alerts`);
  } catch (error) {
    console.error("Error updating RES scores and alerts:", error);
  }
}
