import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AlertParticlesProps {
  position: [number, number, number];
}

export function AlertParticles({ position }: AlertParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Create particle geometry
  const { geometry, positions } = useMemo(() => {
    const count = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute particles in a sphere
      const radius = Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.cos(phi);
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, positions };
  }, []);

  // Animate particles - pulsing and rotating
  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * 2) * 0.2;
    particlesRef.current.scale.setScalar(scale);
    particlesRef.current.rotation.y = time * 0.5;

    // Update particle positions for wave effect
    const positions = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      positions[i + 1] = y + Math.sin(time * 3 + i) * 0.01;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry {...geometry} />
      <pointsMaterial
        size={0.08}
        color="#ef4444"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
