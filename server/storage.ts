import type {
  Zone,
  InsertZone,
  AirQualityLog,
  InsertAirQualityLog,
  Alert,
  InsertAlert,
  ActionReport,
  InsertActionReport,
  CommunityReport,
  InsertCommunityReport,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Zones
  getAllZones(): Promise<Zone[]>;
  getZone(id: string): Promise<Zone | undefined>;
  createZone(zone: InsertZone): Promise<Zone>;
  
  // Air Quality Logs
  getAllAirQualityLogs(): Promise<AirQualityLog[]>;
  getAirQualityLogsByZone(zoneId: string): Promise<AirQualityLog[]>;
  createAirQualityLog(log: InsertAirQualityLog): Promise<AirQualityLog>;
  
  // Alerts
  getAllAlerts(): Promise<Alert[]>;
  getAlertsByZone(zoneId: string): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, alert: Partial<Alert>): Promise<Alert | undefined>;
  
  // Action Reports
  getAllActionReports(): Promise<ActionReport[]>;
  getActionReportsByAlert(alertId: string): Promise<ActionReport[]>;
  createActionReport(report: InsertActionReport): Promise<ActionReport>;
  
  // Community Reports
  getAllCommunityReports(): Promise<CommunityReport[]>;
  getCommunityReportsByZone(zoneId: string): Promise<CommunityReport[]>;
  createCommunityReport(report: InsertCommunityReport): Promise<CommunityReport>;
  verifyCommunityReport(id: string): Promise<CommunityReport | undefined>;
}

export class MemStorage implements IStorage {
  private zones: Map<string, Zone>;
  private airQualityLogs: Map<string, AirQualityLog>;
  private alerts: Map<string, Alert>;
  private actionReports: Map<string, ActionReport>;
  private communityReports: Map<string, CommunityReport>;

  constructor() {
    this.zones = new Map();
    this.airQualityLogs = new Map();
    this.alerts = new Map();
    this.actionReports = new Map();
    this.communityReports = new Map();

    // Initialize with sample Delhi zones
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create 8 Delhi zones with realistic characteristics
    const sampleZones: InsertZone[] = [
      {
        name: "Central Delhi",
        densityFactor: 85,
        waterDeficit: 45,
        industrialZone: false,
        latitude: 28.6519,
        longitude: 77.2315,
      },
      {
        name: "North Delhi",
        densityFactor: 72,
        waterDeficit: 52,
        industrialZone: true,
        latitude: 28.7041,
        longitude: 77.1025,
      },
      {
        name: "South Delhi",
        densityFactor: 65,
        waterDeficit: 38,
        industrialZone: false,
        latitude: 28.5355,
        longitude: 77.3910,
      },
      {
        name: "East Delhi",
        densityFactor: 78,
        waterDeficit: 55,
        industrialZone: true,
        latitude: 28.6692,
        longitude: 77.3538,
      },
      {
        name: "West Delhi",
        densityFactor: 68,
        waterDeficit: 48,
        industrialZone: false,
        latitude: 28.6519,
        longitude: 77.1025,
      },
      {
        name: "New Delhi",
        densityFactor: 55,
        waterDeficit: 35,
        industrialZone: false,
        latitude: 28.6139,
        longitude: 77.2090,
      },
      {
        name: "North East Delhi",
        densityFactor: 82,
        waterDeficit: 58,
        industrialZone: true,
        latitude: 28.7041,
        longitude: 77.2750,
      },
      {
        name: "South West Delhi",
        densityFactor: 60,
        waterDeficit: 42,
        industrialZone: false,
        latitude: 28.6139,
        longitude: 77.0369,
      },
    ];

    sampleZones.forEach((zone) => {
      const id = randomUUID();
      this.zones.set(id, { ...zone, id });
    });
  }

  // Zones
  async getAllZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async getZone(id: string): Promise<Zone | undefined> {
    return this.zones.get(id);
  }

  async createZone(insertZone: InsertZone): Promise<Zone> {
    const id = randomUUID();
    const zone: Zone = { ...insertZone, id };
    this.zones.set(id, zone);
    return zone;
  }

  // Air Quality Logs
  async getAllAirQualityLogs(): Promise<AirQualityLog[]> {
    return Array.from(this.airQualityLogs.values());
  }

  async getAirQualityLogsByZone(zoneId: string): Promise<AirQualityLog[]> {
    return Array.from(this.airQualityLogs.values()).filter(
      (log) => log.zoneId === zoneId
    );
  }

  async createAirQualityLog(insertLog: InsertAirQualityLog): Promise<AirQualityLog> {
    const id = randomUUID();
    const log: AirQualityLog = { ...insertLog, id };
    this.airQualityLogs.set(id, log);
    return log;
  }

  // Alerts
  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getAlertsByZone(zoneId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.zoneId === zoneId
    );
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter((alert) => alert.isActive);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = { ...insertAlert, id };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Action Reports
  async getAllActionReports(): Promise<ActionReport[]> {
    return Array.from(this.actionReports.values());
  }

  async getActionReportsByAlert(alertId: string): Promise<ActionReport[]> {
    return Array.from(this.actionReports.values()).filter(
      (report) => report.alertId === alertId
    );
  }

  async createActionReport(insertReport: InsertActionReport): Promise<ActionReport> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const report: ActionReport = { ...insertReport, id, timestamp };
    this.actionReports.set(id, report);
    return report;
  }

  // Community Reports
  async getAllCommunityReports(): Promise<CommunityReport[]> {
    return Array.from(this.communityReports.values());
  }

  async getCommunityReportsByZone(zoneId: string): Promise<CommunityReport[]> {
    return Array.from(this.communityReports.values()).filter(
      (report) => report.zoneId === zoneId
    );
  }

  async createCommunityReport(insertReport: InsertCommunityReport): Promise<CommunityReport> {
    const id = randomUUID();
    const timestamp = new Date().toISOString();
    const report: CommunityReport = { ...insertReport, id, timestamp };
    this.communityReports.set(id, report);
    return report;
  }

  async verifyCommunityReport(id: string): Promise<CommunityReport | undefined> {
    const report = this.communityReports.get(id);
    if (!report) return undefined;

    const verifiedReport = { ...report, isVerified: true };
    this.communityReports.set(id, verifiedReport);
    return verifiedReport;
  }
}

export const storage = new MemStorage();
