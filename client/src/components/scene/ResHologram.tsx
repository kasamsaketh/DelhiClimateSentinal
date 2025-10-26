import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface ResHologramProps {
  resScore: number;
  position: [number, number, number];
}

export function ResHologram({ resScore, position }: ResHologramProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  // Determine color based on RES score
  const color = useMemo(() => {
    if (resScore < 40) return "#ef4444"; // Critical - Red
    if (resScore < 60) return "#f59e0b"; // High - Orange
    return "#22c55e"; // Good - Green
  }, [resScore]);

  // Animate rotation and pulsing
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= 0.015;
    }
  });

  return (
    <group position={position}>
      {/* Outer ring */}
      <mesh ref={ringRef}>
        <torusGeometry attach="geometry" args={[1.2, 0.05, 16, 64]} />
        <meshStandardMaterial
          attach="material"
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent={true}
          opacity={0.7}
        />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry attach="geometry" args={[0.9, 0.03, 16, 64]} />
        <meshStandardMaterial
          attach="material"
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent={true}
          opacity={0.5}
        />
      </mesh>

      {/* RES Score text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.6}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {Math.round(resScore)}
      </Text>

      {/* RES label */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        RES SCORE
      </Text>
    </group>
  );
}
