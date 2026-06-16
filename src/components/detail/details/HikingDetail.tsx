"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { hikingPhotos, hikingBlurb, hikingEyebrow } from "@/lib/hiking-content";

/* Full-screen water surface — the expanded form of the hiking widget.
   A ping-pong wave-equation height field (WebGL2) refracts a creek scene with
   the hike photos drifting on it; cursor moves stir the surface, clicks drop
   stones. Ported from the design mockup (_mockups/hiking-water). Built
   imperatively rather than via R3F because the multi-pass FBO pipeline needs
   to own its render loop; everything is disposed on unmount. */

// Locked-in "creek" look from the mockup's tweak session.
const LOOK = {
  tint: [0.14, 0.32, 0.30], tintAmt: 0.42, caustics: 0.18, refract: 0.030, ambient: 0.35, drift: 1.0,
  top: [0.40, 0.55, 0.52], bot: [0.05, 0.16, 0.18],
};

const PHOTO_CFG = [
  { x: -0.62, y: -0.10, rot: -0.06, scale: 0.62, phase: 0.0, speed: 0.5 },
  { x:  0.04, y:  0.18, rot:  0.04, scale: 0.70, phase: 2.1, speed: 0.42 },
  { x:  0.66, y: -0.06, rot:  0.07, scale: 0.60, phase: 4.0, speed: 0.6 },
];

const SIM_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`;

const SIM_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPrev; uniform vec2 uTexel;
  uniform vec2 uDrop; uniform float uForce; uniform float uRadius; uniform float uDamp; uniform float uAspect;
  void main(){
    vec2 d = texture2D(uPrev, vUv).rg;
    float l = texture2D(uPrev, vUv - vec2(uTexel.x,0.0)).r;
    float r = texture2D(uPrev, vUv + vec2(uTexel.x,0.0)).r;
    float u = texture2D(uPrev, vUv + vec2(0.0,uTexel.y)).r;
    float dn= texture2D(uPrev, vUv - vec2(0.0,uTexel.y)).r;
    float avg = (l + r + u + dn) * 0.25;
    float vel = (d.y + (avg - d.x)) * uDamp;
    float h = d.x + vel;
    if (uForce != 0.0) {
      vec2 diff = vUv - uDrop; diff.x *= uAspect;
      float dist = length(diff);
      h += uForce * exp(-(dist*dist) / (uRadius*uRadius));
    }
    gl_FragColor = vec4(h, vel, 0.0, 1.0);
  }`;

const COMP_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uScene; uniform sampler2D uRipple; uniform vec2 uTexel;
  uniform float uTime; uniform float uRefract; uniform float uCaustics;
  uniform vec3 uTint; uniform float uTintAmt; uniform float uAspect;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  void main(){
    float hx = texture2D(uRipple, vUv + vec2(uTexel.x,0.0)).r - texture2D(uRipple, vUv - vec2(uTexel.x,0.0)).r;
    float hy = texture2D(uRipple, vUv + vec2(0.0,uTexel.y)).r - texture2D(uRipple, vUv - vec2(0.0,uTexel.y)).r;
    vec2 grad = vec2(hx, hy);
    vec2 uvR = vUv - grad * uRefract;
    vec3 col;
    col.r = texture2D(uScene, uvR + grad * uRefract * 0.35).r;
    col.g = texture2D(uScene, uvR).g;
    col.b = texture2D(uScene, uvR - grad * uRefract * 0.35).b;
    vec3 n = normalize(vec3(-hx * 6.0, -hy * 6.0, 1.0));
    vec3 L = normalize(vec3(0.55, 0.7, 0.55));
    float spec = pow(max(dot(n, L), 0.0), 60.0);
    float h = texture2D(uRipple, vUv).r;
    vec2 cp = vec2(vUv.x * uAspect, vUv.y) * 5.5;
    cp += grad * 14.0;
    vec2 warp = vec2(noise(cp * 1.7 + uTime * 0.25), noise(cp * 1.7 + 9.3 - uTime * 0.21));
    cp += (warp - 0.5) * 2.4;
    float cn = noise(cp * 1.4 + uTime * 0.3) * 0.65 + noise(cp * 3.1 - uTime * 0.22) * 0.35;
    float caus = pow(smoothstep(0.55, 1.0, cn), 3.0) * 2.2;
    caus += pow(max(dot(n, L), 0.0), 14.0) * 0.35;
    col = mix(col, uTint, uTintAmt + h * 0.6);
    col += spec * 0.9;
    col += caus * uCaustics * vec3(0.85, 0.96, 1.0);
    float vig = smoothstep(1.25, 0.35, distance(vUv, vec2(0.5)));
    col *= 0.72 + 0.28 * vig;
    gl_FragColor = vec4(col, 1.0);
  }`;

const BG_VERT = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const BG_FRAG = `
  varying vec2 vUv; uniform vec3 uTop; uniform vec3 uBot; uniform float uTime;
  void main(){
    float g = smoothstep(0.0, 1.0, vUv.y);
    vec3 col = mix(uBot, uTop, g);
    float band = sin(vUv.x*4.0 + uTime*0.18) * sin(vUv.y*3.0 - uTime*0.12);
    col += band * 0.025;
    gl_FragColor = vec4(col, 1.0);
  }`;

export default function HikingDetail() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  // Dark panel behind the canvas. The overlay opens this widget straight to
  // full viewport (see DetailOverlay's `opensFullscreen`), so no fullscreen
  // request is needed here.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "sublime");
    return () => document.body.removeAttribute("data-detail-theme");
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    // Identity output transform = raw passthrough (the composite does its own
    // look). NoColorSpace is rejected for outputColorSpace in three r0.18x.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const ambient = reduce ? 0 : LOOK.ambient;

    // fullscreen-quad rig (sim + composite passes)
    const orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const fsScene = new THREE.Scene();
    const fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    fsScene.add(fsQuad);

    // world scene: creek gradient + drifting photos
    const worldScene = new THREE.Scene();
    const worldCam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    worldCam.position.z = 5;

    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color().fromArray(LOOK.top) },
        uBot: { value: new THREE.Color().fromArray(LOOK.bot) },
        uTime: { value: 0 },
      },
      vertexShader: BG_VERT, fragmentShader: BG_FRAG,
    });
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
    bgMesh.position.z = -1;
    worldScene.add(bgMesh);

    const loader = new THREE.TextureLoader();
    const photoGroups: THREE.Group[] = [];
    const disposables: { dispose(): void }[] = [];
    hikingPhotos.forEach((p, i) => {
      const cfg = PHOTO_CFG[i] ?? PHOTO_CFG[0];
      const tex = loader.load(p.src);
      tex.colorSpace = THREE.NoColorSpace;
      disposables.push(tex);
      const frameGeo = new THREE.PlaneGeometry(1, 1);
      const photoGeo = new THREE.PlaneGeometry(1, 1);
      const frameMat = new THREE.MeshBasicMaterial({ color: 0xf3f1ec });
      const photoMat = new THREE.MeshBasicMaterial({ map: tex });
      disposables.push(frameGeo, photoGeo, frameMat, photoMat);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      const photo = new THREE.Mesh(photoGeo, photoMat);
      const hgt = cfg.scale, wid = cfg.scale * 0.75;
      frame.scale.set(wid + 0.035, hgt + 0.035, 1);
      photo.scale.set(wid, hgt, 1);
      frame.renderOrder = 0; photo.renderOrder = 1; photo.position.z = 0.01;
      const group = new THREE.Group();
      group.add(frame); group.add(photo);
      group.userData = cfg;
      worldScene.add(group);
      photoGroups.push(group);
    });

    const simMat = new THREE.ShaderMaterial({
      uniforms: {
        uPrev: { value: null }, uTexel: { value: new THREE.Vector2() },
        uDrop: { value: new THREE.Vector2(-1, -1) }, uForce: { value: 0 },
        uRadius: { value: 0.03 }, uDamp: { value: 0.992 }, uAspect: { value: 1 },
      },
      vertexShader: SIM_VERT, fragmentShader: SIM_FRAG,
    });
    const compMat = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: null }, uRipple: { value: null }, uTexel: { value: new THREE.Vector2() },
        uTime: { value: 0 }, uRefract: { value: LOOK.refract }, uCaustics: { value: LOOK.caustics },
        uTint: { value: new THREE.Color().fromArray(LOOK.tint) }, uTintAmt: { value: LOOK.tintAmt },
        uAspect: { value: 1 },
      },
      vertexShader: SIM_VERT, fragmentShader: COMP_FRAG,
    });
    disposables.push(simMat, compMat, bgMat, fsQuad.geometry, bgMesh.geometry);

    let sceneRT: THREE.WebGLRenderTarget | null = null;
    let rtA: THREE.WebGLRenderTarget, rtB: THREE.WebGLRenderTarget;
    let simW = 1, simH = 1;

    const makeSimRT = (w: number, h: number) => new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType, format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false,
    });

    let lastW = 0, lastH = 0;
    function resize(cw: number, ch: number) {
      // Size from the LAYOUT box (transform-independent). Using a transformed
      // bounding rect here would lock the backing store to the mid-FLIP scaled
      // size and render everything blurry once the panel settles full-size.
      const W = Math.max(1, Math.round(cw)), H = Math.max(1, Math.round(ch));
      if (W === lastW && H === lastH) return;
      lastW = W; lastH = H;
      renderer.setSize(W, H, false);
      const aspect = W / H;
      worldCam.left = -aspect; worldCam.right = aspect; worldCam.top = 1; worldCam.bottom = -1;
      worldCam.updateProjectionMatrix();
      bgMesh.scale.set(aspect * 2.2, 2.2, 1);

      const dpr = Math.min(devicePixelRatio || 1, 2);
      sceneRT?.dispose();
      sceneRT = new THREE.WebGLRenderTarget(Math.floor(W * dpr * 0.85), Math.floor(H * dpr * 0.85),
        { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });

      const SIM_MAX = 520;
      if (aspect >= 1) { simW = SIM_MAX; simH = Math.round(SIM_MAX / aspect); }
      else { simH = SIM_MAX; simW = Math.round(SIM_MAX * aspect); }
      rtA?.dispose(); rtB?.dispose();
      rtA = makeSimRT(simW, simH); rtB = makeSimRT(simW, simH);
      renderer.setRenderTarget(rtA); renderer.clear();
      renderer.setRenderTarget(rtB); renderer.clear();
      renderer.setRenderTarget(null);
      simMat.uniforms.uTexel.value.set(1 / simW, 1 / simH);
      simMat.uniforms.uAspect.value = aspect;
      compMat.uniforms.uTexel.value.set(1 / simW, 1 / simH);
      compMat.uniforms.uAspect.value = aspect;
    }

    const drops: { uv: THREE.Vector2; force: number; radius: number }[] = [];
    function queueDrop(u: number, v: number, force: number, radius: number) {
      if (drops.length > 16) drops.shift();
      drops.push({ uv: new THREE.Vector2(u, v), force, radius });
    }
    const pointer = { x: 0.5, y: 0.5, down: false };
    function toUV(e: PointerEvent): [number, number] {
      const r = root!.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    }
    function onMove(e: PointerEvent) {
      const [u, v] = toUV(e);
      const speed = Math.hypot(u - pointer.x, v - pointer.y);
      pointer.x = u; pointer.y = v;
      if (pointer.down) queueDrop(u, v, 0.05 + speed * 1.2, 0.022);
      else if (speed > 0.004) queueDrop(u, v, Math.min(0.04, speed * 0.9), 0.018);
    }
    function onDown(e: PointerEvent) { pointer.down = true; const [u, v] = toUV(e); queueDrop(u, v, 0.32, 0.05); }
    function onUp() { pointer.down = false; }
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) resize(cr.width, cr.height);
    });
    ro.observe(root);
    resize(root.clientWidth, root.clientHeight);

    let raf = 0;
    const t0 = performance.now();
    function loop(now: number) {
      const time = (now - t0) / 1000;
      bgMat.uniforms.uTime.value = time;
      compMat.uniforms.uTime.value = time;

      for (const g of photoGroups) {
        const c = g.userData as (typeof PHOTO_CFG)[number];
        g.position.x = c.x + Math.sin(time * c.speed * LOOK.drift + c.phase) * 0.04;
        g.position.y = c.y + Math.cos(time * c.speed * 0.8 * LOOK.drift + c.phase) * 0.05;
        g.rotation.z = c.rot + Math.sin(time * c.speed * 0.5 * LOOK.drift + c.phase) * 0.03;
      }

      if (sceneRT) { renderer.setRenderTarget(sceneRT); renderer.render(worldScene, worldCam); }

      if (Math.random() < 0.04 * (0.3 + ambient)) {
        queueDrop(Math.random(), Math.random(), 0.02 + ambient * 0.05, 0.02);
      }

      const passes = Math.max(2, Math.min(drops.length, 5));
      fsQuad.material = simMat;
      for (let i = 0; i < passes; i++) {
        const drop = drops.shift();
        simMat.uniforms.uPrev.value = rtA.texture;
        if (drop) { simMat.uniforms.uDrop.value.copy(drop.uv); simMat.uniforms.uForce.value = drop.force; simMat.uniforms.uRadius.value = drop.radius; }
        else simMat.uniforms.uForce.value = 0;
        renderer.setRenderTarget(rtB);
        renderer.render(fsScene, orthoCam);
        const tmp = rtA; rtA = rtB; rtB = tmp;
      }

      fsQuad.material = compMat;
      compMat.uniforms.uScene.value = sceneRT?.texture ?? null;
      compMat.uniforms.uRipple.value = rtA.texture;
      renderer.setRenderTarget(null);
      renderer.render(fsScene, orthoCam);

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      sceneRT?.dispose(); rtA?.dispose(); rtB?.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-cursor-theme="sublime"
      style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#0c1518" }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />

      {failed && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-mono)" }}>
          This experience needs WebGL.
        </div>
      )}

      {/* copy overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", padding: "clamp(28px, 5vw, 56px)", color: "#fff" }}>
        <div style={{ maxWidth: "40ch" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>
            {hikingEyebrow}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(40px, 6vw, 84px)", lineHeight: 0.92, letterSpacing: "-0.03em", textShadow: "0 2px 40px rgba(0,0,0,0.35)" }}>
            Hiking
          </h1>
          <p style={{ marginTop: 16, maxWidth: "34ch", fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", textShadow: "0 1px 16px rgba(0,0,0,0.4)" }}>
            {hikingBlurb}
          </p>
        </div>
        <div style={{ position: "absolute", bottom: "clamp(20px, 4vw, 40px)", left: 0, right: 0, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}>
          click to drop a stone &nbsp;·&nbsp; move to stir the surface
        </div>
      </div>
    </div>
  );
}
