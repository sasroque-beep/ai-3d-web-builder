"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

/**
 * Rotates the mesh every frame via R3F's render loop (not React state), the
 * pattern any future real scene must use to avoid re-rendering React on
 * every frame.
 */
function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.6;
    meshRef.current.rotation.y += delta * 0.8;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6366f1" />
    </mesh>
  );
}

/**
 * Issue #24 smoke-test only: proves React Three Fiber + Drei render inside
 * this Next.js/React/TypeScript setup. Not a real preset — no scene config,
 * no fallback2d, no data wiring. Must stay isolated from site-builder/design.
 */
export function SmokeTestScene() {
  return (
    <Canvas camera={{ position: [2, 2, 3], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1} />
      <SpinningCube />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
