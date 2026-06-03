"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Mounts its children only while near the AWL scroll viewport, and unmounts
   them once scrolled well away. Used to gate the 3D canvases so only the one in
   view holds a WebGL context / runs a render loop. The generous rootMargin adds
   hysteresis so a canvas is ready slightly before it appears and lingers briefly
   after, avoiding remount thrash. */
export default function InView({
  children,
  rootMargin = "60% 0px",
  className,
  style,
}: {
  children: ReactNode;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const root = el.closest(".detail-scroll") as HTMLElement | null;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      root,
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {inView && children}
    </div>
  );
}
