"use client";

import { useEffect, useRef, useState } from "react";

/* Act 1 — "Lights out". An F1 start-light gantry stutters on, light by light,
   over the holographic wireframe of the car. When armed, the visitor drops the
   lights (click / Launch) — the lights cut out and the photoreal render launches
   in with a speed-streak and a gold bloom; `onOpened` fires to unlock scroll.

   Accessibility: prefers-reduced-motion (or Skip) launches instantly. */

const GOLD = "#e3b53d";

export default function LaunchReveal({
  photorealSrc,
  wireframeSrc,
  onOpened,
}: {
  photorealSrc: string;
  wireframeSrc: string;
  onOpened: () => void;
}) {
  const [lit, setLit] = useState(0); // 0..5 start lights illuminated
  const [launched, setLaunched] = useState(false);
  const firedRef = useRef(false);

  const armed = lit >= 5;

  const launch = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLit(0); // lights out
    setLaunched(true);
    window.setTimeout(() => onOpened(), 260);
  };

  // Reduced motion → skip the whole sequence.
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      launch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stagger the five lights on.
  useEffect(() => {
    if (firedRef.current) return;
    const timers = [250, 650, 1050, 1450, 1850].map((ms, i) =>
      window.setTimeout(() => setLit((c) => (c > i ? c : i + 1)), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#050505]"
      onClick={() => armed && launch()}
      style={{ cursor: armed && !launched ? "pointer" : "default" }}
    >
      {/* Wireframe backdrop (the engineering underneath) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={wireframeSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: launched ? 0.18 : 0.45, transition: "opacity 900ms ease-out", transform: "scale(1.04)" }}
        draggable={false}
      />

      {/* Photoreal render — launches in */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photorealSrc}
        alt="USC Formula Electric — site hero"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: launched ? 1 : 0,
          transform: launched ? "scale(1)" : "scale(1.12)",
          transition: "opacity 700ms ease-out, transform 1000ms cubic-bezier(0.16,1,0.3,1)",
        }}
        draggable={false}
      />

      {/* Gold ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "58%",
          transform: "translate(-50%,-50%)",
          width: "72vw",
          height: "30vh",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(227,181,61,0.18) 0%, rgba(139,0,0,0.12) 42%, transparent 72%)",
          filter: "blur(40px)",
          opacity: launched ? 1 : 0.5,
          transition: "opacity 900ms ease-out",
        }}
      />

      {/* One-shot launch effects */}
      {launched && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 58%, rgba(242,207,106,0.55), rgba(242,207,106,0) 55%)",
              animation: "usc-launch-bloom 900ms ease-out forwards",
            }}
          />
          {[38, 52, 66].map((top, i) => (
            <div
              key={top}
              className="absolute pointer-events-none"
              style={{
                top: `${top}%`,
                left: 0,
                width: "60%",
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)",
                animation: `usc-streak 650ms ease-out ${i * 70}ms forwards`,
              }}
            />
          ))}
        </>
      )}

      {/* F1 start-light gantry — a slim beam hanging from the top edge. Refined,
          flat, lots of air around it (premium-dark restraint). */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        style={{ top: 0, opacity: launched ? 0 : 1, transition: "opacity 220ms ease-out" }}
      >
        {/* hanging straps */}
        <div className="flex justify-between" style={{ width: 230 }}>
          <span style={{ width: 3, height: "8vh", background: "#27272c" }} />
          <span style={{ width: 3, height: "8vh", background: "#27272c" }} />
        </div>
        {/* beam */}
        <div
          className="flex items-center gap-7 rounded-md"
          style={{ background: "#0b0b0d", border: "1px solid rgba(255,255,255,0.09)", padding: "11px 24px", boxShadow: "0 16px 40px rgba(0,0,0,0.55)" }}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const on = i < lit;
            return (
              <div key={i} className="flex flex-col gap-2.5">
                {[0, 1].map((b) => (
                  <span
                    key={b}
                    className="block rounded-full"
                    style={{
                      width: 28,
                      height: 28,
                      background: on ? "#e10600" : "#190a0b",
                      border: on ? "1.5px solid #ff6b6b" : "1.5px solid rgba(255,255,255,0.06)",
                      boxShadow: on ? "0 0 14px 2px rgba(225,6,0,0.5)" : "none",
                      transition: "background 110ms ease-out, border-color 110ms ease-out, box-shadow 110ms ease-out",
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prompt */}
      {!launched && (
        <div
          className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
          style={{ bottom: "12%" }}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.74rem",
              letterSpacing: "0.34em",
              color: armed ? GOLD : "rgba(255,255,255,0.55)",
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
              animation: armed ? "usc-pulse 1.4s ease-in-out infinite" : undefined,
            }}
          >
            {armed ? "lights out — click to launch" : "starting grid…"}
          </span>
        </div>
      )}

      {/* Skip */}
      {!launched && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            launch();
          }}
          className="absolute uppercase cursor-pointer hover:text-white transition-colors"
          style={{
            bottom: 22,
            right: 22,
            zIndex: 30,
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          skip →
        </button>
      )}
    </div>
  );
}
