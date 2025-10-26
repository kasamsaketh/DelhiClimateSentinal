import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { MapView } from "@/components/map/MapView";
import { Sidebar } from "@/components/layout/Sidebar";
import { ActionFormModal } from "@/components/modals/ActionFormModal";
import { CommunityFormModal } from "@/components/modals/CommunityFormModal";
import { Loader2 } from "lucide-react";
import type { Zone, ResScore, Alert } from "@shared/schema";

export default function MapPage() {
  const { setAlerts, selectedZone, setSelectedZone } = useApp();

  const { data: zones = [], isLoading: zonesLoading } = useQuery<Zone[]>({
    queryKey: ["/api/zones"],
  });

  const { data: resScores = [], isLoading: resLoading } = useQuery<ResScore[]>({
    queryKey: ["/api/res/scores"],
    refetchInterval: 30000,
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    setAlerts(alerts);
  }, [alerts, setAlerts]);

  const isLoading = zonesLoading || resLoading;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col bg-background">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[30%] min-w-[350px]">
          <Sidebar />
        </div>
        <div className="flex-1">
          <MapView 
            zones={zones} 
            resScores={resScores}
            selectedZone={selectedZone}
            onZoneSelect={setSelectedZone}
          />
        </div>
      </div>
      <ActionFormModal />
      <CommunityFormModal />
    </div>
  );
}
