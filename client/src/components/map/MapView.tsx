import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Zone, ResScore } from "@shared/schema";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  zones: Zone[];
  resScores: ResScore[];
  selectedZone: Zone | null;
  onZoneSelect: (zone: Zone) => void;
}

// Helper component to handle map centering when zone is selected
function MapController({ selectedZone }: { selectedZone: Zone | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedZone) {
      map.flyTo([selectedZone.latitude, selectedZone.longitude], 13, {
        duration: 1.5,
      });
    }
  }, [selectedZone, map]);
  
  return null;
}

// Create custom marker icons based on RES score
function getMarkerIcon(resScore: number | undefined, isSelected: boolean) {
  let color = "#10b981"; // green (stable)
  
  if (resScore !== undefined) {
    if (resScore < 40) {
      color = "#ef4444"; // red (critical)
    } else if (resScore < 60) {
      color = "#f59e0b"; // amber (stressed)
    }
  }
  
  const size = isSelected ? 35 : 25;
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      font-size: ${size > 30 ? '14px' : '10px'};
    ">
      ${resScore !== undefined ? Math.round(resScore) : '?'}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function MapView({ zones, resScores, selectedZone, onZoneSelect }: MapViewProps) {
  // Default center: Delhi coordinates
  const defaultCenter: [number, number] = [28.6139, 77.2090];
  const defaultZoom = 11;

  return (
    <div className="w-full h-full relative" data-testid="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedZone={selectedZone} />
        
        {zones.map((zone) => {
          const resScore = resScores.find((score) => score.zoneId === zone.id);
          const isSelected = selectedZone?.id === zone.id;
          
          return (
            <Marker
              key={zone.id}
              position={[zone.latitude, zone.longitude]}
              icon={getMarkerIcon(resScore?.score, isSelected)}
              eventHandlers={{
                click: () => onZoneSelect(zone),
              }}
            >
              <Popup>
                <div className="space-y-2" data-testid={`popup-zone-${zone.id}`}>
                  <h3 className="font-semibold text-base">{zone.name}</h3>
                  {resScore && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">RES Score:</span>
                        <span className={`font-bold text-sm ${
                          resScore.score < 40 ? 'text-red-600' :
                          resScore.score < 60 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                          {resScore.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">PM2.5:</span>
                        <span className="font-medium text-sm">{resScore.pm25.toFixed(1)} μg/m³</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          resScore.score < 40 ? 'bg-red-100 text-red-700' :
                          resScore.score < 60 ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {resScore.score < 40 ? 'Critical' :
                           resScore.score < 60 ? 'Stressed' :
                           'Stable'}
                        </span>
                      </div>
                    </div>
                  )}
                  {zone.industrialZone && (
                    <div className="text-xs text-red-600 font-medium">Industrial Zone</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-card/95 backdrop-blur-sm border border-border rounded-md p-4 shadow-lg z-[1000]" data-testid="map-legend">
        <h3 className="text-sm font-semibold mb-3 text-card-foreground">RES Score Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            <span className="text-xs text-muted-foreground">Stable (60-100)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
            <span className="text-xs text-muted-foreground">Stressed (30-59)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
            <span className="text-xs text-muted-foreground">Critical (0-29)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
