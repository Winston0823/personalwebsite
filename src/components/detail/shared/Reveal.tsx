"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/* Scroll-reveal wrapper. Fades + lifts its children the first time they enter
   the detail scroll viewport. Observation is rooted on the `.detail-scroll`
   container (not the window), since case studies scroll inside the detail
   panel. `delay` staggers siblings for a choreographed entrance.

   Shared by the AWL and Sublime bespoke case-study pages. */
export default function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  style,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
} & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const root = el.closest(".detail-scroll") as HTMLElement | null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { root, threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      {...rest}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity var(--dur-narrative) var(--ease-reveal) ${delay}ms, transform var(--dur-narrative) var(--ease-reveal) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
