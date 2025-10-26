import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Droplets,
  Users,
  Factory,
  Wind,
  FileText,
  MessageSquare,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ResScore, Alert } from "@shared/schema";

export function Sidebar() {
  const { selectedZone, setIsActionModalOpen, setIsCommunityModalOpen } = useApp();

  const { data: resScores = [] } = useQuery<ResScore[]>({
    queryKey: ["/api/res/scores"],
    refetchInterval: 30000,
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  if (!selectedZone) {
    return (
      <aside className="h-full w-full bg-sidebar border-r border-sidebar-border p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Wind className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Select a zone to view details</p>
        </div>
      </aside>
    );
  }

  const resScore = resScores.find((score) => score.zoneId === selectedZone.id);
  const zoneAlerts = alerts.filter(
    (alert) => alert.zoneId === selectedZone.id && alert.isActive
  );

  return (
    <aside className="h-full w-full bg-sidebar border-r border-sidebar-border">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Zone Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-medium text-sidebar-foreground" data-testid="text-zone-name">
              {selectedZone.name}
            </h2>
            <div className="flex items-center gap-2">
              {selectedZone.industrialZone && (
                <Badge variant="destructive" className="gap-1" data-testid="badge-industrial">
                  <Factory className="w-3 h-3" />
                  Industrial Zone
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* RES Score Card */}
          {resScore && (
            <Card className="p-6 space-y-4" data-testid="card-res-score">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Resilience Score
                </span>
                {resScore.score >= 60 ? (
                  <TrendingUp className="w-4 h-4 text-res-medium" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-res-critical" />
                )}
              </div>

              <div className="space-y-1">
                <div className="text-5xl font-bold font-mono" data-testid="text-res-score">
                  {Math.round(resScore.score)}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>

              {/* RES Breakdown */}
              <div className="space-y-3 pt-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Air Risk</span>
                    <span className="font-mono" data-testid="text-air-risk">
                      {Math.round(resScore.airRisk)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-destructive transition-all"
                      style={{ width: `${resScore.airRisk}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Water Deficit</span>
                    <span className="font-mono" data-testid="text-water-deficit">
                      {Math.round(resScore.waterDeficit)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-2 transition-all"
                      style={{ width: `${resScore.waterDeficit}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Density Factor</span>
                    <span className="font-mono" data-testid="text-density-factor">
                      {Math.round(resScore.densityFactor)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-chart-3 transition-all"
                      style={{ width: `${resScore.densityFactor}%` }}
                    />
                  </div>
                </div>

                {resScore.industrialPenalty > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Industrial Penalty</span>
                      <span className="font-mono text-destructive" data-testid="text-industrial-penalty">
                        -{Math.round(resScore.industrialPenalty)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Current Metrics */}
          <Card className="p-6 space-y-4" data-testid="card-metrics">
            <h3 className="text-lg font-semibold text-card-foreground">Current Metrics</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    PM2.5
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold" data-testid="text-pm25">
                  {resScore?.pm25.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">μg/m³</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Water
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold" data-testid="text-water">
                  {selectedZone.waterDeficit.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Deficit</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Density
                  </span>
                </div>
                <div className="text-2xl font-mono font-bold" data-testid="text-density">
                  {selectedZone.densityFactor.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Factor</div>
              </div>
            </div>
          </Card>

          {/* Active Alerts */}
          {zoneAlerts.length > 0 && (
            <Card className="p-6 space-y-4" data-testid="card-alerts">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-card-foreground">Active Alerts</h3>
                <Badge variant="destructive" className="ml-auto">
                  {zoneAlerts.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {zoneAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-md space-y-2"
                    data-testid={`alert-${alert.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-card-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full gap-2"
              variant="default"
              onClick={() => setIsActionModalOpen(true)}
              data-testid="button-log-action"
              disabled={zoneAlerts.length === 0}
            >
              <FileText className="w-4 h-4" />
              Log Action
            </Button>

            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={() => setIsCommunityModalOpen(true)}
              data-testid="button-community-report"
            >
              <MessageSquare className="w-4 h-4" />
              Submit Community Report
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
