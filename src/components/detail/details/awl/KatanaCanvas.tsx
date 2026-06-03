"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* Procedural katana, upgraded from primitive boxes: the blade is an extruded
   silhouette with a real tapered kissaki (tip) and a fuller groove; the fittings
   (habaki collar, tsuba guard, wrapped tsuka, kashira pommel) are modelled so it
   reads as a crafted asset. It floats, slowly spins like a game pickup, and
   drifts from the right edge toward (just past) screen-center on scroll. A soft
   contact shadow grounds the float. */

function useBladeGeometry() {
  return useMemo(() => {
    const w = 0.12; // blade width
    const L = 2.3; // blade length
    const s = new THREE.Shape();
    s.moveTo(w / 2, 0);
    s.lineTo(w / 2, L - 0.34); // spine (mune) to near tip
    s.lineTo(w / 2 - 0.012, L - 0.14);
    s.lineTo(0, L); // kissaki point
    s.lineTo(-w / 2, L - 0.5); // edge sweeps up to the tip
    s.lineTo(-w / 2, 0); // cutting edge (ha)
    s.lineTo(w / 2, 0);

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      curveSegments: 2,
    });
    geo.center();
    geo.translate(0, L / 2, 0); // base back to ~y=0, tip to ~y=L
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function Katana({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const blade = useBladeGeometry();

  const steel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d7dce6",
        metalness: 0.96,
        roughness: 0.17,
      }),
    [],
  );
  const fuller = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#9aa3b2",
        metalness: 0.9,
        roughness: 0.35,
      }),
    [],
  );
  const brass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b8923f",
        metalness: 0.85,
        roughness: 0.3,
      }),
    [],
  );
  const guardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#23232a",
        metalness: 0.8,
        roughness: 0.38,
      }),
    [],
  );
  const wrap = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#101015",
        metalness: 0.4,
        roughness: 0.65,
      }),
    [],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.5; // slow showcase spin
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const eased = p * p * (3 - 2 * p); // smoothstep
    // Stay on the right (x fixed by the group's base position); zoom in on the
    // blade as the user scrolls — scale up with a subtle dolly toward camera.
    const sc = THREE.MathUtils.lerp(0.85, 1.6, eased);
    g.scale.setScalar(sc);
    g.position.z = THREE.MathUtils.lerp(0, 0.6, eased);
  });

  // tsuka-ito wrap: a few thin rings down the handle for a woven hint.
  const wrapRings = [-0.78, -0.9, -1.02, -1.14, -1.26];

  return (
    <group ref={group} rotation={[0.12, 0, 0.5]} position={[2.0, -0.35, 0]}>
      {/* Blade + fuller groove */}
      <mesh geometry={blade} material={steel} />
      <mesh material={fuller} position={[0.028, 0.55, 0.028]}>
        <boxGeometry args={[0.012, 1.7, 0.012]} />
      </mesh>
      {/* Faint blue edge accent — echoes the game's VFX down the ha */}
      <mesh position={[-0.052, 0.5, 0]}>
        <boxGeometry args={[0.006, 1.9, 0.03]} />
        <meshBasicMaterial color="#5aa9ff" toneMapped={false} />
      </mesh>

      {/* Habaki — blade collar */}
      <mesh material={brass} position={[0, -0.04, 0]}>
        <boxGeometry args={[0.16, 0.13, 0.09]} />
      </mesh>

      {/* Tsuba — guard (rounded) */}
      <mesh material={guardMat} position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 40]} />
      </mesh>
      <mesh material={brass} position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.012, 12, 40]} />
      </mesh>

      {/* Tsuka — handle */}
      <mesh material={wrap} position={[0, -1.04, 0]}>
        <cylinderGeometry args={[0.058, 0.052, 0.78, 24]} />
      </mesh>
      {wrapRings.map((y, i) => (
        <mesh key={i} material={guardMat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.01, 8, 20]} />
        </mesh>
      ))}

      {/* Kashira — pommel cap */}
      <mesh material={guardMat} position={[0, -1.46, 0]}>
        <cylinderGeometry args={[0.064, 0.064, 0.05, 24]} />
      </mesh>
    </group>
  );
}

export default function KatanaCanvas({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color="#aab8ff" />
      {/* Blue rim light — picks the blade out against the black section */}
      <pointLight position={[-2, -1, 3]} intensity={6} color="#2f7dff" distance={12} />
      <pointLight position={[3, 2, 4]} intensity={1.4} color="#ffffff" distance={16} />
      <Float speed={2} rotationIntensity={0.22} floatIntensity={0.85} floatingRange={[-0.16, 0.16]}>
        <Katana progressRef={progressRef} />
      </Float>
      {/* Grounding shadow well below the float */}
      <ContactShadows
        position={[0.4, -2.4, 0]}
        opacity={0.5}
        scale={9}
        blur={2.8}
        far={4.5}
        resolution={512}
        color="#000000"
      />
    </Canvas>
  );
}
