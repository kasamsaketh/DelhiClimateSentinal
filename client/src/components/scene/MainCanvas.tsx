import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingDown, TrendingUp, Wind } from "lucide-react";
import type { Zone, ResScore } from "@shared/schema";

interface MainCanvasProps {
  zones: Zone[];
  resScores: ResScore[];
}

export function MainCanvas({ zones, resScores }: MainCanvasProps) {
  const { selectedZone, setSelectedZone, alerts } = useApp();

  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-card/50 to-background overflow-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-4xl font-light text-foreground">Delhi Zones</h2>
          <p className="text-muted-foreground">Select a zone to view detailed resilience metrics</p>
        </div>

        {/* Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const resScore = resScores.find((score) => score.zoneId === zone.id);
            const zoneAlerts = alerts.filter(
              (alert) => alert.zoneId === zone.id && alert.isActive
            );
            const isSelected = selectedZone?.id === zone.id;

            // Determine RES color
            const resColor = resScore
              ? resScore.score < 40
                ? "text-res-critical"
                : resScore.score < 60
                ? "text-res-high"
                : "text-res-medium"
              : "text-muted-foreground";

            return (
              <Card
                key={zone.id}
                className={`p-4 cursor-pointer transition-all hover-elevate ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedZone(zone)}
                data-testid={`card-zone-${zone.id}`}
              >
                <div className="space-y-3">
                  {/* Zone Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-card-foreground">{zone.name}</h3>
                    </div>
                    {zone.industrialZone && (
                      <Badge variant="destructive" className="text-xs">IND</Badge>
                    )}
                  </div>

                  {/* RES Score */}
                  {resScore && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          RES
                        </span>
                        {resScore.score >= 60 ? (
                          <TrendingUp className="w-4 h-4 text-res-medium" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-res-critical" />
                        )}
                      </div>
                      <div className={`text-3xl font-bold font-mono ${resColor}`}>
                        {Math.round(resScore.score)}
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            resScore.score < 40
                              ? "bg-res-critical"
                              : resScore.score < 60
                              ? "bg-res-high"
                              : "bg-res-medium"
                          }`}
                          style={{ width: `${resScore.score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* PM2.5 */}
                  {resScore && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">PM2.5</span>
                      </div>
                      <span className="font-mono font-semibold">
                        {resScore.pm25.toFixed(1)} μg/m³
                      </span>
                    </div>
                  )}

                  {/* Active Alerts */}
                  {zoneAlerts.length > 0 && (
                    <Badge variant="destructive" className="w-full justify-center">
                      {zoneAlerts.length} Active {zoneAlerts.length === 1 ? "Alert" : "Alerts"}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
