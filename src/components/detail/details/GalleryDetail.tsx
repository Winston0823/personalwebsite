"use client";

import { useEffect, useRef, useState } from "react";
import { artworks } from "@/lib/detail-content";

const ROW_UNIT = 8;
const GAP = 12;

function getColCount(width: number) {
  if (width >= 1200) return 4;
  if (width >= 820) return 3;
  if (width >= 520) return 2;
  return 1;
}

export default function GalleryDetail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = getColCount(containerWidth);
  const colWidth = Math.max(1, (containerWidth - (cols - 1) * GAP) / cols);

  return (
    <div className="detail-stagger">
      <div
        ref={containerRef}
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridAutoRows: `${ROW_UNIT}px`,
          gridAutoFlow: "dense",
          gap: `${GAP}px`,
        }}
      >
        {artworks.map((art) => {
          const ar = art.width / art.height;
          const canSpan2 = cols >= 3;
          const canSpan3 = cols >= 4;
          // Wide artwork claims more horizontal cells so it actually fills the row
          let colSpan = 1;
          if (canSpan3 && ar > 2.0) colSpan = 3;
          else if (canSpan2 && ar > 1.4) colSpan = 2;
          if (colSpan > cols) colSpan = cols;

          const effectiveWidth = colSpan * colWidth + (colSpan - 1) * GAP;
          const renderedHeight = effectiveWidth / ar;
          const rowSpan = Math.max(
            4,
            Math.round((renderedHeight + GAP) / (ROW_UNIT + GAP))
          );

          return (
            <a
              key={art.id}
              href={art.image}
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden rounded-xl bg-text-secondary/5 ring-1 ring-black/5 shadow-sm"
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={art.image}
                alt={art.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              {/* Title only. Subtle gradient at rest, intensifies on hover. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-4 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                <p
                  className="font-medium text-white drop-shadow-sm leading-snug"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {art.title}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
