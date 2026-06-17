"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { isPerfLite } from "@/lib/perf-tier";

/* ── Procedural 3D heart ─────────────────────────────────────────────────────
   An extruded heart silhouette rendered with a glossy, lit material so it reads
   as a wet candy-red object floating against the repeating-text poster. Key +
   warm fill + a red rim light from behind pick out the form; a faint emissive
   gives it an internal glow. It tumbles slowly, floats, and beats. */

function buildHeartGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const x = 0;
  const y = 0;
  shape.moveTo(x + 0.5, y + 0.5);
  shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
  shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
  shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
  shape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
  shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
  shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.62,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: 0.2,
    bevelThickness: 0.2,
    curveSegments: 72,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function Heart3D() {
  const spin = useRef<THREE.Group>(null);
  const beat = useRef<THREE.Group>(null);

  const geometry = useMemo(buildHeartGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#cc0a1e",
        metalness: 0.35,
        roughness: 0.22,
        emissive: new THREE.Color("#2a0006"),
        emissiveIntensity: 0.7,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y = t * 0.55; // slow showcase tumble
      spin.current.rotation.x = 0.14; // slight fixed tilt to read as 3D
    }
    if (beat.current) {
      // Double-thump heartbeat: two quick pulses, then rest.
      const pulse =
        0.08 * Math.pow(Math.sin(t * 2.4), 16) +
        0.05 * Math.pow(Math.sin(t * 2.4 - 0.55), 16);
      beat.current.scale.setScalar(1 + pulse);
    }
  });

  return (
    <Float speed={2.2} rotationIntensity={0.18} floatIntensity={0.9} floatingRange={[-0.12, 0.12]}>
      <group ref={beat}>
        <group ref={spin}>
          {/* rotate.z = PI flips the drawn shape upright (point down, lobes up) */}
          <group rotation={[0, 0, Math.PI]} scale={1.05}>
            <mesh geometry={geometry} material={material} />
          </group>
        </group>
      </group>
    </Float>
  );
}

export default function HeartCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, isPerfLite() ? 1 : 1.5]}
      style={{ pointerEvents: "none", background: "transparent" }}
    >
      {/* Lighting rig — key, warm fill, red rim from behind, spec highlight. */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-5, 2, 3]} intensity={0.85} color="#ff8a8a" />
      <pointLight position={[0, -1.5, -4]} intensity={6} color="#ff1a2e" distance={16} />
      <pointLight position={[2.5, 3, 4]} intensity={1.3} color="#ffffff" distance={18} />
      <Heart3D />
    </Canvas>
  );
}
