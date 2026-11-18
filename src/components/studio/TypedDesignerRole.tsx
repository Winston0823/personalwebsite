"use client";

import { useEffect, useState } from "react";

const words = ["Game", "Product"] as const;

type Step = {
  word: number;
  length: number;
  phase: "typing" | "holding" | "deleting" | "switching";
};

export default function TypedDesignerRole() {
  const [step, setStep] = useState<Step>({ word: 0, length: 0, phase: "typing" });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const word = words[step.word];
    const delay =
      step.phase === "holding" ? 2500 :
      step.phase === "switching" ? 350 :
      step.phase === "deleting" ? 90 : 145;
    const timer = window.setTimeout(() => {
      setStep((current) => {
        if (current.phase === "typing") {
          const length = current.length + 1;
          return { ...current, length, phase: length === word.length ? "holding" : "typing" };
        }
        if (current.phase === "holding") return { ...current, phase: "deleting" };
        if (current.phase === "deleting") {
          const length = current.length - 1;
          return { ...current, length, phase: length === 0 ? "switching" : "deleting" };
        }
        return { word: (current.word + 1) % words.length, length: 0, phase: "typing" };
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [step, reducedMotion]);

  return (
    <span className="sticker-role" aria-label="Game and Product Designer">
      {reducedMotion ? (
        <span>Game / Product Designer</span>
      ) : (
        <>
          <span className="sticker-role-word" aria-hidden="true">
            {words[step.word].slice(0, step.length)}
            <span className="sticker-role-cursor">|</span>
          </span>
          <span aria-hidden="true">Designer</span>
        </>
      )}
    </span>
  );
}
