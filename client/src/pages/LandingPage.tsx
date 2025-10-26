import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { KnowledgeInsights } from "@/components/sections/KnowledgeInsights";
import { 
  Map, 
  BarChart3, 
  Activity, 
  Droplets, 
  Wind, 
  Building2,
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import type { ResScore, Alert } from "@shared/schema";

export default function LandingPage() {
  const { data: resScores = [] } = useQuery<ResScore[]>({
    queryKey: ["/api/res/scores"],
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const activeAlerts = alerts.filter((alert) => alert.isActive);
  const criticalZones = resScores.filter((score) => score.score < 40).length;
  const stressedZones = resScores.filter((score) => score.score >= 40 && score.score < 60).length;
  const avgResScore = resScores.length > 0 
    ? Math.round(resScores.reduce((sum, score) => sum + score.score, 0) / resScores.length)
    : 0;

  const features = [
    {
      icon: Map,
      title: "Interactive Map",
      description: "Visualize air quality zones across Delhi with real-time resilience scores on an interactive OpenStreetMap.",
      link: "/map",
      color: "text-chart-1"
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Deep dive into air quality metrics, water resources, and infrastructure data with comprehensive visualizations.",
      link: "/analytics",
      color: "text-chart-2"
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description: "Track environmental resilience scores and receive alerts for critical zones requiring immediate attention.",
      link: "/map",
      color: "text-chart-3"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Badge variant="outline" className="gap-2" data-testid="badge-status">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              System Online
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-light text-foreground">
              Environmental <span className="font-semibold text-primary">Resilience</span>
              <br />
              Monitoring System
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring and analysis of Delhi's environmental health through 
              integrated air quality, water resources, and infrastructure metrics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2" data-testid="button-explore-map" asChild>
                <Link href="/map">
                  Explore Map
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" data-testid="button-view-analytics" asChild>
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 space-y-2" data-testid="card-stat-avg-res">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg RES Score</span>
              {avgResScore >= 60 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">{avgResScore}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </Card>

          <Card className="p-6 space-y-2" data-testid="card-stat-critical">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical Zones</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">{criticalZones}</div>
            <div className="text-xs text-muted-foreground">RES Score &lt; 40</div>
          </Card>

          <Card className="p-6 space-y-2" data-testid="card-stat-stressed">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stressed Zones</span>
              <Wind className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">{stressedZones}</div>
            <div className="text-xs text-muted-foreground">RES Score 40-59</div>
          </Card>

          <Card className="p-6 space-y-2" data-testid="card-stat-alerts">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Alerts</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Requires attention</div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-foreground">
            Comprehensive <span className="font-semibold text-primary">Monitoring</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access powerful tools to monitor, analyze, and respond to environmental challenges
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} href={feature.link}>
                <div className="h-full">
                  <Card 
                    className="p-6 space-y-4 h-full hover-elevate active-elevate-2 cursor-pointer transition-all"
                    data-testid={`card-feature-${index}`}
                  >
                    <div className={`w-12 h-12 rounded-md bg-card border border-border flex items-center justify-center ${feature.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-card-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 pb-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-foreground">
            What We <span className="font-semibold text-primary">Monitor</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
              <Wind className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">Air Quality</h3>
            <p className="text-muted-foreground">
              Real-time PM2.5 monitoring and air pollution tracking across all zones
            </p>
          </Card>

          <Card className="p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-chart-2/10 mx-auto flex items-center justify-center">
              <Droplets className="w-8 h-8 text-chart-2" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">Water Resources</h3>
            <p className="text-muted-foreground">
              Water deficit monitoring and resource allocation analysis
            </p>
          </Card>

          <Card className="p-8 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-chart-3/10 mx-auto flex items-center justify-center">
              <Building2 className="w-8 h-8 text-chart-3" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">Infrastructure</h3>
            <p className="text-muted-foreground">
              Population density and industrial zone impact assessment
            </p>
          </Card>
        </div>
      </section>

      {/* Knowledge & Insights Section */}
      <KnowledgeInsights />
    </div>
  );
}
