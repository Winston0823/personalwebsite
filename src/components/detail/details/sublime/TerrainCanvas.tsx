"use client";

import { useMemo, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Procedural low-poly mountains the camera flies over on scroll — the serene
   counterpart to AWL's katana beat. Terrain is built once (displaced plane with
   height-tinted vertex colors, flat-shaded), fog fades distance into the dark
   panel, and a low warm "sun" rakes the ridges. Scroll progress flies the
   camera forward across the range. */

function buildTerrain(): THREE.BufferGeometry {
  const W = 150;
  const D = 320;
  const SW = 140;
  const SD = 200;
  const geo = new THREE.PlaneGeometry(W, D, SW, SD);
  const pos = geo.attributes.position as THREE.BufferAttribute;

  const heightAt = (x: number, y: number) => {
    let h = 0;
    h += Math.sin(x * 0.06) * Math.cos(y * 0.05) * 7;
    h += Math.sin(x * 0.13 + 1.7) * Math.cos(y * 0.11 - 0.6) * 3.2;
    h += Math.abs(Math.sin(x * 0.025 + y * 0.02)) * 6.5; // ridged peaks
    h += Math.sin(x * 0.31) * Math.cos(y * 0.27) * 0.7; // fine detail
    return h;
  };

  const heights = new Float32Array(pos.count);
  let minH = Infinity;
  let maxH = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const h = heightAt(pos.getX(i), pos.getY(i));
    heights[i] = h;
    pos.setZ(i, h);
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }

  const valley = new THREE.Color("#222d39");
  const mid = new THREE.Color("#5b6573");
  const peak = new THREE.Color("#d8dee7");
  const range = maxH - minH || 1;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = (heights[i] - minH) / range;
    if (t < 0.5) c.copy(valley).lerp(mid, t / 0.5);
    else c.copy(mid).lerp(peak, (t - 0.5) / 0.5);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// Soft grayscale mottle, upscaled with smoothing → a subtle rock/snow texture
// that multiplies the height-tinted vertex colors so the terrain isn't flat.
function makeNoiseTexture(): THREE.CanvasTexture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const v = 195 + Math.floor(Math.random() * 60); // 195–255: subtle
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const c2 = document.createElement("canvas");
  c2.width = 256;
  c2.height = 256;
  const ctx2 = c2.getContext("2d")!;
  ctx2.imageSmoothingEnabled = true;
  ctx2.drawImage(c, 0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c2);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 18);
  return tex;
}

function Rig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const e = p * p * (3 - 2 * p);
    const t = state.clock.elapsedTime;
    const z = THREE.MathUtils.lerp(70, -150, e);
    state.camera.position.set(Math.sin(t * 0.12) * 2.5, THREE.MathUtils.lerp(22, 11, e), z);
    state.camera.lookAt(0, 2, z - 70);
  });
  return null;
}

function Terrain() {
  const geo = useMemo(buildTerrain, []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 1,
        metalness: 0,
        map: makeNoiseTexture(),
      }),
    [],
  );
  return <mesh geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -120]} />;
}

export default function TerrainCanvas({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      camera={{ fov: 55, near: 0.1, far: 420, position: [0, 22, 70] }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ pointerEvents: "none" }}
    >
      {/* Distance fades into the panel colour */}
      <fog attach="fog" args={["#0a0b0d", 60, 240]} />
      <ambientLight intensity={0.5} />
      {/* Low warm sun raking the ridges */}
      <directionalLight position={[-40, 26, 18]} intensity={1.7} color="#ffd6a0" />
      {/* Cool sky fill */}
      <directionalLight position={[30, 18, -40]} intensity={0.5} color="#86a6c4" />
      <Terrain />
      <Rig progressRef={progressRef} />
    </Canvas>
  );
}
