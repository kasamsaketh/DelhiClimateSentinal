import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Zone } from "@shared/schema";

interface PmVolumeProps {
  zoneId: string;
  pm25: number;
  zone: Zone;
  isSelected: boolean;
}

export function PmVolume({ pm25, zone, isSelected }: PmVolumeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate bar height based on PM2.5 value (normalized)
  const height = useMemo(() => {
    return Math.min((pm25 / 200) * 3, 4); // Max height of 4 units
  }, [pm25]);

  // Color based on air quality thresholds
  const color = useMemo(() => {
    if (pm25 > 150) return "#7f1d1d"; // Hazardous - Dark red
    if (pm25 > 100) return "#ef4444"; // Unhealthy - Red
    if (pm25 > 50) return "#f59e0b"; // Moderate - Orange
    return "#22c55e"; // Good - Green
  }, [pm25]);

  // Subtle pulsing animation for selected zone
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.y = pulse;
    }
  });

  const position: [number, number, number] = [
    zone.longitude * 0.1 + 0.5,
    height / 2,
    zone.latitude * 0.1 + 0.5,
  ];

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry attach="geometry" args={[0.3, height, 0.3]} />
      <meshStandardMaterial
        attach="material"
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
}
