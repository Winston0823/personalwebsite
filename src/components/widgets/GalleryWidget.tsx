"use client";

import { artworks } from "@/lib/detail-content";

const PREVIEW_IDS = [
  "art-streets-iii",
  "art-peace-of-dawn",
  "art-sonder",
  "art-porsche-918",
];

export default function GalleryWidget() {
  const previews = PREVIEW_IDS
    .map((id) => artworks.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="flex flex-col h-full">
      <h2
        className="font-semibold uppercase tracking-widest text-accent mb-2"
        style={{ fontSize: "var(--text-widget-title)" }}
      >
        Gallery
      </h2>
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {previews.map((art) => (
          <div
            key={art.id}
            className="relative rounded-lg overflow-hidden bg-text-secondary/5 ring-1 ring-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={art.image}
              alt={art.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
