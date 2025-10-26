import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import type { Alert } from "@shared/schema";

export function AlertTicker() {
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const activeAlerts = alerts.filter((alert) => alert.isActive);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-destructive/90 backdrop-blur-sm border-t border-destructive-foreground/20 z-[9999]">
      <div className="h-full flex items-center overflow-hidden">
        <div className="flex items-center gap-2 px-4 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-destructive-foreground animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wide text-destructive-foreground">
            Active Alerts
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="animate-marquee flex gap-8 items-center whitespace-nowrap">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="inline-flex items-center gap-3 text-destructive-foreground"
                data-testid={`ticker-alert-${alert.id}`}
              >
                <span className="text-xs font-semibold px-2 py-1 bg-destructive-foreground/20 rounded">
                  {alert.zoneName}
                </span>
                <span className="text-sm">{alert.message}</span>
                <span className="text-xs font-mono opacity-75">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {activeAlerts.map((alert) => (
              <div
                key={`dup-${alert.id}`}
                className="inline-flex items-center gap-3 text-destructive-foreground"
              >
                <span className="text-xs font-semibold px-2 py-1 bg-destructive-foreground/20 rounded">
                  {alert.zoneName}
                </span>
                <span className="text-sm">{alert.message}</span>
                <span className="text-xs font-mono opacity-75">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
