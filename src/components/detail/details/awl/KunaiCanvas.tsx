"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Procedural kunai (throwing knife): a diamond blade, wrapped grip, and ring
   pommel, with a faint blue edge accent matching the game's VFX. Scroll progress
   (0..1) corkscrews it down through the frame — a helical traverse while it
   tumbles end-over-end — so it spins "in a spiral way" between sections. A small
   time term keeps it alive when the scroll is still. */

function useKunaiBlade() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 1.15); // tip
    s.lineTo(0.17, 0.5); // right shoulder
    s.lineTo(0.06, 0.0); // right base
    s.lineTo(-0.06, 0.0); // left base
    s.lineTo(-0.17, 0.5); // left shoulder
    s.lineTo(0, 1.15);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      curveSegments: 1,
    });
    geo.center();
    geo.translate(0, 0.575, 0); // base back near y=0, tip up
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function Kunai({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const travel = useRef<THREE.Group>(null); // position across the band
  const spin = useRef<THREE.Group>(null); // rotisserie around the long axis
  const blade = useKunaiBlade();

  const steel = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c7ccd6", metalness: 0.95, roughness: 0.2 }),
    [],
  );
  const dark = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#15151b", metalness: 0.55, roughness: 0.6 }),
    [],
  );
  const ringMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#23232b", metalness: 0.8, roughness: 0.4 }),
    [],
  );

  useFrame((state) => {
    const tv = travel.current;
    const sp = spin.current;
    if (!tv || !sp) return;
    const t = state.clock.elapsedTime;
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    // Faster crossing: compress the traverse into the central part of the pass
    // (gain > 1), so it whips across quicker while still entering/exiting clean.
    const cross = THREE.MathUtils.clamp((p - 0.5) * 2.2 + 0.5, 0, 1);

    // Traverse straight right → left as the section scrolls past, with a faint
    // arc so it doesn't read flat.
    tv.position.x = THREE.MathUtils.lerp(3.4, -3.4, cross);
    tv.position.y = Math.sin(cross * Math.PI) * 0.22;

    // Rotisserie: spin about the blade's own long axis (local Y), coupled to
    // scroll plus a steady idle so it keeps turning like it's being thrown.
    sp.rotation.y = -(cross * Math.PI * 2 * 3 + t * 0.9);
  });

  return (
    // Travel group moves the knife across the band.
    <group ref={travel} scale={1.2}>
      {/* Orient the blade to point LEFT (long axis along -X). */}
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Rotisserie spin around the long (local Y) axis. */}
        <group ref={spin}>
          {/* Pivot offset so it turns about its middle. */}
          <group position={[0, -0.28, 0]}>
            {/* Blade */}
            <mesh geometry={blade} material={steel} />
            {/* Blue edge accent ridge down the blade */}
            <mesh position={[0, 0.5, 0.045]}>
              <boxGeometry args={[0.012, 0.95, 0.012]} />
              <meshBasicMaterial color="#5aa9ff" toneMapped={false} />
            </mesh>
            {/* Collar */}
            <mesh material={ringMat} position={[0, -0.02, 0]}>
              <boxGeometry args={[0.12, 0.06, 0.1]} />
            </mesh>
            {/* Grip */}
            <mesh material={dark} position={[0, -0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.045, 0.52, 20]} />
            </mesh>
            {/* Ring pommel (coplanar with the blade) */}
            <mesh material={ringMat} position={[0, -0.62, 0]}>
              <torusGeometry args={[0.085, 0.022, 16, 32]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function KunaiCanvas({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ pointerEvents: "none", background: "transparent" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={3.0} color="#ffffff" />
      <directionalLight position={[-4, 1, -2]} intensity={1.1} color="#aac4ff" />
      {/* Front fill from camera so the blade stays readable through the spin */}
      <directionalLight position={[0, 1, 6]} intensity={1.5} color="#ffffff" />
      {/* Blue rim — on-theme VFX glow */}
      <pointLight position={[-2, 0, 3]} intensity={6} color="#2f7dff" distance={12} />
      <pointLight position={[3, 2, 4]} intensity={1.8} color="#ffffff" distance={16} />
      <Kunai progressRef={progressRef} />
    </Canvas>
  );
}
