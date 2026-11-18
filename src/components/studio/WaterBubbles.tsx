"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Project } from "@/lib/detail-types";
import { projectPath } from "@/lib/project-paths";
import {
  createBubbles,
  stepBubbles,
  bubbleContour,
  type BubbleBody,
} from "@/lib/bubble-physics";

export default function WaterBubbles({ projects }: { projects: Project[] }) {
  const tankRef = useRef<HTMLDivElement>(null);
  const elements = useRef<(HTMLDivElement | null)[]>([]);
  const contours = useRef<(SVGPathElement | null)[]>([]);
  const hovered = useRef(-1);
  const focused = useRef(-1);
  const pointer = useRef<{ x: number; y: number } | undefined>(undefined);
  const id = useId().replace(/:/g, "");
  const ids = projects.map((project) => project.id).join("|");

  useEffect(() => {
    const tank = tankRef.current;
    if (!tank) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let bodies: BubbleBody[] = [],
      width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      lastPaint = 0,
      visible = true;
    hovered.current = focused.current = -1;
    const resize = new ResizeObserver((entries) => {
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
      bodies = createBubbles(projects.length, width, height);
      previous = 0;
    });
    resize.observe(tank);
    const intersection = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        previous = 0;
      },
      { rootMargin: "120px" },
    );
    intersection.observe(tank);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden || !bodies.length) {
        previous = 0;
        return;
      }
      const elapsed = previous
        ? Math.min((now - previous) / 1000, 0.05)
        : 1 / 60;
      previous = now;
      const expanded = focused.current >= 0 ? focused.current : hovered.current;
      bodies.forEach((body, index) => {
        body.pinned = index === expanded;
      });
      if (!reduced.matches)
        stepBubbles(
          bodies,
          width,
          height,
          elapsed,
          now / 1000,
          expanded,
          pointer.current,
        );
      // Physics runs at display rate; contour sampling is capped to 30 fps.
      const repaint = now - lastPaint > 32;
      bodies.forEach((body, index) => {
        const element = elements.current[index];
        if (!element) return;
        element.style.width = `${body.radius * 2}px`;
        element.style.height = `${body.radius * 2}px`;
        element.style.transform = `translate3d(${body.x - body.radius}px,${body.y - body.radius}px,0)`;
        element.style.zIndex = index === expanded ? "5" : "1";
        if (repaint)
          contours.current[index]?.setAttribute(
            "d",
            bubbleContour(
              reduced.matches ? 0 : now / 1000,
              body.phase,
              reduced.matches ? 0 : body.squeeze,
              body.angle,
            ),
          );
      });
      if (tank.dataset.ready !== "true") tank.dataset.ready = "true";
      if (repaint) lastPaint = now;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
    };
    // Bodies are recreated only when the visible collection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  return (
    <div
      className="water-world"
      ref={tankRef}
      aria-label="Floating project collection"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }}
      onPointerLeave={() => {
        pointer.current = undefined;
        hovered.current = -1;
      }}
    >
      {projects.map((project, index) => {
        const prefix = `${id}-${project.id}`;
        const shape = bubbleContour(0, index * 2.3, 0, 0);
        return (
          <div
            className="water-body"
            key={project.id}
            ref={(element) => {
              elements.current[index] = element;
            }}
          >
            <Link
              href={projectPath(project)}
              className="water-link"
              aria-label={`Explore ${project.title} — ${project.description}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") hovered.current = index;
              }}
              onPointerLeave={() => {
                hovered.current = -1;
              }}
              onFocus={() => {
                focused.current = index;
              }}
              onBlur={() => {
                focused.current = -1;
              }}
            >
              <svg
                className="water-art"
                viewBox="0 0 320 320"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id={`${prefix}-shape`}
                    d={shape}
                    ref={(element) => {
                      contours.current[index] = element;
                    }}
                  />
                  <clipPath id={`${prefix}-clip`}>
                    <use href={`#${prefix}-shape`} />
                  </clipPath>
                  <radialGradient
                    id={`${prefix}-film`}
                    cx="34%"
                    cy="27%"
                    r="76%"
                  >
                    <stop offset="0" stopColor="#ffffff" stopOpacity=".01" />
                    <stop offset=".62" stopColor="#ffffff" stopOpacity=".03" />
                    <stop offset=".84" stopColor="#b4d8f4" stopOpacity=".23" />
                    <stop offset=".94" stopColor="#ffe8fa" stopOpacity=".56" />
                    <stop offset="1" stopColor="#91c8cf" stopOpacity=".2" />
                  </radialGradient>
                  <radialGradient
                    id={`${prefix}-glow`}
                    cx="28%"
                    cy="19%"
                    r="70%"
                  >
                    <stop offset="0" stopColor="white" stopOpacity=".82" />
                    <stop offset=".22" stopColor="white" stopOpacity=".12" />
                    <stop offset=".54" stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="#d2e5e7" stopOpacity=".23" />
                  </radialGradient>
                  <linearGradient
                    id={`${prefix}-rim`}
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                  >
                    <stop stopColor="#97c3ca" stopOpacity=".5" />
                    <stop offset=".24" stopColor="white" />
                    <stop offset=".43" stopColor="#d7c5ed" stopOpacity=".4" />
                    <stop offset=".72" stopColor="#8bbecb" stopOpacity=".7" />
                    <stop offset="1" stopColor="white" />
                  </linearGradient>
                  <filter
                    id={`${prefix}-refract`}
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency=".009 .012"
                      numOctaves="2"
                      seed={index + 4}
                      result="ripple"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="ripple"
                      scale="9"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <path
                    id={`${prefix}-title`}
                    d="M 3,170 A 157,157 0 0 0 317,170"
                  />
                </defs>
                <g clipPath={`url(#${prefix}-clip)`}>
                  <rect width="320" height="320" fill="#edf5f6" />
                  <image
                    className="water-image"
                    href={project.thumbnail}
                    width="350"
                    height="350"
                    x="-15"
                    y="-15"
                    preserveAspectRatio="xMidYMid slice"
                    filter={`url(#${prefix}-refract)`}
                  />
                  <rect
                    width="320"
                    height="320"
                    fill={`url(#${prefix}-film)`}
                  />
                  <rect
                    width="320"
                    height="320"
                    fill={`url(#${prefix}-glow)`}
                  />
                  <ellipse
                    cx="93"
                    cy="58"
                    rx="53"
                    ry="15"
                    fill="white"
                    opacity=".5"
                    transform="rotate(-30 93 58)"
                  />
                  <ellipse
                    cx="113"
                    cy="75"
                    rx="27"
                    ry="5"
                    fill="white"
                    opacity=".52"
                    transform="rotate(-30 113 75)"
                  />
                  <path
                    d="M 233 265 Q 268 247 279 215"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity=".7"
                  />
                </g>
                <use
                  href={`#${prefix}-shape`}
                  fill="none"
                  stroke={`url(#${prefix}-rim)`}
                  strokeWidth="2.8"
                />
                <use
                  href={`#${prefix}-shape`}
                  fill="none"
                  stroke="white"
                  strokeWidth=".7"
                  opacity=".75"
                  transform="translate(1 -1)"
                />
                <text className="water-title">
                  <textPath
                    href={`#${prefix}-title`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {project.title}
                  </textPath>
                </text>
              </svg>
              <span className="water-details">
                <span className="water-name">{project.title}</span>
                <span className="water-description">{project.description}</span>
                <span className="water-action">
                  Explore project <ArrowUpRight size={15} />
                </span>
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
