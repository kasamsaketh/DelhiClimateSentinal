import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wind, 
  Droplets, 
  Building2, 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Factory,
  Users,
  Loader2
} from "lucide-react";
import type { Zone, ResScore } from "@shared/schema";

export default function AnalyticsPage() {
  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["/api/zones"],
  });

  const { data: resScores = [], isLoading: resLoading } = useQuery<ResScore[]>({
    queryKey: ["/api/res/scores"],
    refetchInterval: 30000,
  });

  const isLoading = zonesLoading || resLoading;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const zonesWithScores = zones.map(zone => ({
    ...zone,
    resScore: resScores.find(score => score.zoneId === zone.id)
  }));

  const avgAirRisk = resScores.length > 0
    ? resScores.reduce((sum, score) => sum + score.airRisk, 0) / resScores.length
    : 0;

  const avgWaterDeficit = resScores.length > 0
    ? resScores.reduce((sum, score) => sum + score.waterDeficit, 0) / resScores.length
    : 0;

  const avgDensity = zones.length > 0
    ? zones.reduce((sum, zone) => sum + zone.densityFactor, 0) / zones.length
    : 0;

  const industrialZones = zones.filter(zone => zone.industrialZone);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-card/30 to-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-light text-foreground">
            Data <span className="font-semibold text-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of air quality, water resources, and infrastructure metrics
          </p>
        </div>

        <Tabs defaultValue="air" className="space-y-6">
          <TabsList data-testid="tabs-analytics">
            <TabsTrigger value="air" className="gap-2" data-testid="tab-air">
              <Wind className="w-4 h-4" />
              Air Quality
            </TabsTrigger>
            <TabsTrigger value="water" className="gap-2" data-testid="tab-water">
              <Droplets className="w-4 h-4" />
              Water Resources
            </TabsTrigger>
            <TabsTrigger value="infrastructure" className="gap-2" data-testid="tab-infrastructure">
              <Building2 className="w-4 h-4" />
              Infrastructure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="air" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Air Risk</span>
                  <Wind className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {avgAirRisk.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Across all zones</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Critical Zones</span>
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {resScores.filter(s => s.airRisk > 70).length}
                </div>
                <div className="text-xs text-muted-foreground">Air risk &gt; 70%</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg PM2.5</span>
                  <Wind className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {resScores.length > 0 
                    ? (resScores.reduce((sum, s) => sum + s.pm25, 0) / resScores.length).toFixed(1)
                    : 0}
                </div>
                <div className="text-xs text-muted-foreground">μg/m³</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Air Quality by Zone</h3>
              <div className="space-y-3">
                {zonesWithScores
                  .sort((a, b) => (b.resScore?.airRisk || 0) - (a.resScore?.airRisk || 0))
                  .map((zone) => (
                    <div key={zone.id} className="flex items-center gap-4" data-testid={`zone-air-${zone.id}`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-card-foreground">{zone.name}</span>
                          <span className="text-sm font-mono text-muted-foreground">
                            {zone.resScore?.airRisk.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (zone.resScore?.airRisk || 0) > 70 ? 'bg-destructive' :
                              (zone.resScore?.airRisk || 0) > 40 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${zone.resScore?.airRisk || 0}%` }}
                          />
                        </div>
                      </div>
                      {zone.industrialZone && (
                        <Badge variant="destructive" className="text-xs">
                          <Factory className="w-3 h-3 mr-1" />
                          Industrial
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="water" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Water Deficit</span>
                  <Droplets className="w-4 h-4 text-chart-2" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {avgWaterDeficit.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Across all zones</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Deficit</span>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {resScores.filter(s => s.waterDeficit > 60).length}
                </div>
                <div className="text-xs text-muted-foreground">Deficit &gt; 60%</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stable Supply</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {resScores.filter(s => s.waterDeficit < 30).length}
                </div>
                <div className="text-xs text-muted-foreground">Deficit &lt; 30%</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Water Resources by Zone</h3>
              <div className="space-y-3">
                {zonesWithScores
                  .sort((a, b) => (b.resScore?.waterDeficit || 0) - (a.resScore?.waterDeficit || 0))
                  .map((zone) => (
                    <div key={zone.id} className="flex items-center gap-4" data-testid={`zone-water-${zone.id}`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-card-foreground">{zone.name}</span>
                          <span className="text-sm font-mono text-muted-foreground">
                            {zone.resScore?.waterDeficit.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              (zone.resScore?.waterDeficit || 0) > 60 ? 'bg-destructive' :
                              (zone.resScore?.waterDeficit || 0) > 30 ? 'bg-amber-500' :
                              'bg-chart-2'
                            }`}
                            style={{ width: `${zone.resScore?.waterDeficit || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Population Density</span>
                  <Users className="w-4 h-4 text-chart-3" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {avgDensity.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Normalized index</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Industrial Zones</span>
                  <Factory className="w-4 h-4 text-destructive" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {industrialZones.length}
                </div>
                <div className="text-xs text-muted-foreground">out of {zones.length}</div>
              </Card>

              <Card className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Density</span>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {zones.filter(z => z.densityFactor > 70).length}
                </div>
                <div className="text-xs text-muted-foreground">Density &gt; 70%</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">Infrastructure Metrics by Zone</h3>
              <div className="space-y-3">
                {zones
                  .sort((a, b) => b.densityFactor - a.densityFactor)
                  .map((zone) => (
                    <div key={zone.id} className="flex items-center gap-4" data-testid={`zone-infrastructure-${zone.id}`}>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-card-foreground">{zone.name}</span>
                          <span className="text-sm font-mono text-muted-foreground">
                            {zone.densityFactor.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-3 transition-all"
                            style={{ width: `${zone.densityFactor}%` }}
                          />
                        </div>
                      </div>
                      {zone.industrialZone && (
                        <Badge variant="destructive" className="text-xs">
                          <Factory className="w-3 h-3 mr-1" />
                          Industrial
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
