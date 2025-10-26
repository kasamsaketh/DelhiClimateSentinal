import { Activity, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@shared/schema";

export function Header() {
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000, // Refresh every 30s
  });

  const activeAlerts = alerts.filter((alert) => alert.isActive);
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-primary" data-testid="icon-logo" />
        <h1 className="text-2xl font-light text-foreground" data-testid="text-app-title">
          Project <span className="font-medium text-primary">Phoenix</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Active alerts count */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Active Alerts
          </span>
          <Badge
            variant={activeAlerts.length > 0 ? "destructive" : "secondary"}
            className="font-mono"
            data-testid="badge-alert-count"
          >
            {activeAlerts.length}
          </Badge>
        </div>

        {/* System status */}
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-status-online" data-testid="icon-status" />
          <Badge variant="outline" className="gap-2" data-testid="badge-status">
            <span className="w-2 h-2 rounded-full bg-status-online animate-pulse"></span>
            Connected
          </Badge>
        </div>

        {/* Current time */}
        <div className="font-mono text-sm text-muted-foreground" data-testid="text-timestamp">
          {currentTime}
        </div>
      </div>
    </header>
  );
}
