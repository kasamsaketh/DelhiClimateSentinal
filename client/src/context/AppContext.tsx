import { createContext, useContext, useState, type ReactNode } from "react";
import type { Zone, Alert } from "@shared/schema";

interface AppContextType {
  selectedZone: Zone | null;
  setSelectedZone: (zone: Zone | null) => void;
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  isActionModalOpen: boolean;
  setIsActionModalOpen: (open: boolean) => void;
  isCommunityModalOpen: boolean;
  setIsCommunityModalOpen: (open: boolean) => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{
        selectedZone,
        setSelectedZone,
        alerts,
        setAlerts,
        isActionModalOpen,
        setIsActionModalOpen,
        isCommunityModalOpen,
        setIsCommunityModalOpen,
        selectedAlertId,
        setSelectedAlertId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
