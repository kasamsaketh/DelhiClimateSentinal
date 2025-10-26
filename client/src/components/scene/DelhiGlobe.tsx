import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "@/context/AppContext";
import type { Zone } from "@shared/schema";

interface DelhiGlobeProps {
  zones: Zone[];
  selectedZone: Zone | null;
}

export function DelhiGlobe({ zones, selectedZone }: DelhiGlobeProps) {
  const { setSelectedZone } = useApp();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <group>
      {/* Base map plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry attach="geometry" args={[20, 20]} />
        <meshStandardMaterial attach="material" color="#0f1419" opacity={0.8} transparent={true} />
      </mesh>

      {/* Zone meshes */}
      {zones.map((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const isHovered = hoveredZone === zone.id;
        const position: [number, number, number] = [
          zone.longitude * 0.1,
          0,
          zone.latitude * 0.1,
        ];

        return (
          <group key={zone.id}>
            <ZoneMesh
              zone={zone}
              position={position}
              isSelected={isSelected}
              isHovered={isHovered}
              onPointerEnter={() => setHoveredZone(zone.id)}
              onPointerLeave={() => setHoveredZone(null)}
              onClick={() => setSelectedZone(zone)}
            />
            
            {/* Zone label */}
            <Text
              position={[position[0], 0.2, position[2]]}
              fontSize={0.3}
              color={isSelected ? "#3b82f6" : "#94a3b8"}
              anchorX="center"
              anchorY="middle"
            >
              {zone.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

interface ZoneMeshProps {
  zone: Zone;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onClick: () => void;
}

function ZoneMesh({
  zone,
  position,
  isSelected,
  isHovered,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: ZoneMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate hover and selection
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.2 : isHovered ? 1.1 : 1.0;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  // Color based on zone type
  const baseColor = zone.industrialZone ? "#ef4444" : "#3b82f6";

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      castShadow
    >
      <cylinderGeometry attach="geometry" args={[0.8, 0.8, 0.1, 32]} />
      <meshStandardMaterial
        attach="material"
        color={isSelected ? "#60a5fa" : baseColor}
        emissive={isSelected ? "#3b82f6" : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
        opacity={0.85}
        transparent={true}
      />
    </mesh>
  );
}
