"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

import type {
  HeroShowcaseConfig,
  HeroShowcaseShape,
} from "@/modules/experience-3d/presets/hero-showcase/config";
import type { Experience3DSceneProps } from "@/modules/experience-3d/presets/types";

/**
 * Deterministic (mulberry32) so the particle field is identical on every
 * mount and in tests — the scene has no randomness to flake on.
 */
function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createParticlePositions(count: number): Float32Array {
  const random = createSeededRandom(0x51ed270b);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Points on a spherical shell around the hero shape.
    const radius = 2.4 + random() * 1.2;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
}

function ShapeGeometry({ shape }: { shape: HeroShowcaseShape }) {
  switch (shape) {
    case "torus-knot":
      return <torusKnotGeometry args={[0.8, 0.28, 128, 16]} />;
    case "octahedron":
      return <octahedronGeometry args={[1.3, 0]} />;
    default:
      return <icosahedronGeometry args={[1.15, 1]} />;
  }
}

/**
 * Continuous motion is driven by `useFrame` (mutating the object directly),
 * never React state — and only when `spin` is above zero. In REDUCED_3D it
 * is zero, so nothing here schedules work.
 */
function HeroObject({
  config,
  spin,
}: {
  config: HeroShowcaseConfig;
  spin: number;
}) {
  const shapeRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (spin <= 0) return;
    if (shapeRef.current) {
      shapeRef.current.rotation.y += delta * spin;
      shapeRef.current.rotation.x += delta * spin * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * spin * 0.6;
    }
  });

  return (
    <>
      <mesh ref={shapeRef}>
        <ShapeGeometry shape={config.shape} />
        <meshStandardMaterial
          color={config.primaryColor}
          // No environment map on purpose (it would be a network request),
          // so a metallic surface has nothing to reflect and renders dark.
          metalness={0.05}
          roughness={0.5}
          flatShading={config.shape !== "torus-knot"}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 120]} />
        <meshStandardMaterial
          color={config.accentColor}
          emissive={config.accentColor}
          emissiveIntensity={0.8}
        />
      </mesh>
    </>
  );
}

function Particles({ count, color }: { count: number; color: string }) {
  const positions = useMemo(() => createParticlePositions(count), [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.035} sizeAttenuation />
    </points>
  );
}

/**
 * Hero Showcase — abstract, fully procedural (no models, textures or HDR
 * environment, so the scene makes no network request of its own). Only ever
 * mounted client-side and lazily, through `presets/renderers.ts`.
 *
 * FULL_3D animates continuously; REDUCED_3D renders a single static frame
 * (`frameloop="demand"`, fixed DPR, no particles, no float/spin).
 */
export function HeroShowcaseScene({
  config,
  mode,
  onReady,
  onRuntimeFailure,
}: Experience3DSceneProps<HeroShowcaseConfig>) {
  const full = mode === "FULL_3D";
  const animated = full && config.motionIntensity > 0;
  const spin = animated ? config.motionIntensity * 0.9 : 0;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={full ? [1, 2] : 1}
      // Nothing moves when motion is off, so don't burn frames re-drawing it.
      frameloop={animated ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onRuntimeFailure();
        });
        onReady();
      }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 3, 4]} intensity={1.6} />
      <pointLight
        position={[-3, -2, 2]}
        intensity={12}
        color={config.accentColor}
      />

      {animated ? (
        <Float
          speed={1 + config.motionIntensity}
          floatIntensity={config.motionIntensity}
          rotationIntensity={0}
        >
          <HeroObject config={config} spin={spin} />
        </Float>
      ) : (
        <HeroObject config={config} spin={0} />
      )}

      {full && config.particleCount > 0 ? (
        <Particles count={config.particleCount} color={config.accentColor} />
      ) : null}
    </Canvas>
  );
}
