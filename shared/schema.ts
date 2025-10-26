import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Zones - Delhi administrative zones with resilience factors
export interface Zone {
  id: string;
  name: string;
  densityFactor: number; // 0-100 normalized population density
  waterDeficit: number; // 0-100 percentage water deficit
  industrialZone: boolean; // Flag for industrial areas
  latitude: number;
  longitude: number;
}

export const insertZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  densityFactor: z.number().min(0).max(100),
  waterDeficit: z.number().min(0).max(100),
  industrialZone: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
});

export type InsertZone = z.infer<typeof insertZoneSchema>;

// Air Quality Logs - Real-time PM2.5 data from OpenAQ
export interface AirQualityLog {
  id: string;
  zoneId: string;
  pm25: number; // PM2.5 concentration μg/m³
  timestamp: string;
}

export const insertAirQualityLogSchema = z.object({
  zoneId: z.string(),
  pm25: z.number().min(0),
  timestamp: z.string(),
});

export type InsertAirQualityLog = z.infer<typeof insertAirQualityLogSchema>;

// Alerts - System-generated alerts based on RES thresholds
export interface Alert {
  id: string;
  zoneId: string;
  zoneName: string;
  resScore: number;
  pm25: number;
  severity: "critical" | "high" | "medium"; // critical: RES<40, high: RES<60, medium: PM2.5>150
  message: string;
  timestamp: string;
  isActive: boolean;
}

export const insertAlertSchema = z.object({
  zoneId: z.string(),
  zoneName: z.string(),
  resScore: z.number().min(0).max(100),
  pm25: z.number().min(0),
  severity: z.enum(["critical", "high", "medium"]),
  message: z.string(),
  timestamp: z.string(),
  isActive: z.boolean().default(true),
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Action Reports - Mitigation actions taken in response to alerts
export interface ActionReport {
  id: string;
  alertId: string;
  actionTaken: string;
  timestamp: string;
  userId: string; // For future auth implementation
}

export const insertActionReportSchema = z.object({
  alertId: z.string(),
  actionTaken: z.string().min(10, "Please describe the action taken in detail"),
  userId: z.string().default("system"),
});

export type InsertActionReport = z.infer<typeof insertActionReportSchema>;

// Community Reports - Citizen-submitted environmental observations
export interface CommunityReport {
  id: string;
  zoneId: string;
  zoneName: string;
  reportText: string;
  isVerified: boolean;
  timestamp: string;
}

export const insertCommunityReportSchema = z.object({
  zoneId: z.string(),
  zoneName: z.string(),
  reportText: z.string().min(20, "Please provide detailed observations"),
  isVerified: z.boolean().default(false),
});

export type InsertCommunityReport = z.infer<typeof insertCommunityReportSchema>;

// RES Score - Calculated resilience score for a zone
export interface ResScore {
  zoneId: string;
  zoneName: string;
  score: number; // 0-100
  airRisk: number; // 0-100
  waterDeficit: number; // 0-100
  densityFactor: number; // 0-100
  industrialPenalty: number; // 0-10
  timestamp: string;
  pm25: number;
}
