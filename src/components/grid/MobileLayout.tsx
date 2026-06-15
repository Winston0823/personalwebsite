"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { WidgetType } from "@/lib/grid-types";
import ImageLightbox from "@/components/common/ImageLightbox";
import {
  projects,
  skills,
  personalInfo,
  artworks,
} from "@/lib/detail-content";
import { useNowPlaying } from "@/hooks/useNowPlaying";

/* Mobile hybrid layout (≤767px).

   The desktop free-canvas widget dashboard doesn't translate to a phone — no
   drag, no spatial arrangement — so mobile keeps the widgets as *content* but
   drops the floating-card framing for most of them. Identity blocks (Name,
   Skills, Contact) stay glass cards; content-heavy blocks (Projects, Experience,
   Gallery) become full-width editorial sections that breathe. Order is
   recruiter-first: work → experience → skills → contact.

   Tapping Projects / Gallery opens the real detail panel via `onOpen`. */

// Featured-domain projects, sorted exactly like the desktop "All" grid.
const mobileProjects = projects
  .filter((p) => p.domain != null)
  .map((p, i) => ({ p, i }))
  .sort((a, b) => {
    const ap = a.p.priority ?? Infinity;
    const bp = b.p.priority ?? Infinity;
    return ap !== bp ? ap - bp : a.i - b.i;
  })
  .map(({ p }) => p);

const galleryIds = [
  "art-streets-iii",
  "art-peace-of-dawn",
  "art-sonder",
  "art-porsche-918",
  "art-streets-iv",
  "art-noise-of-night",
];
const galleryArt = galleryIds
  .map((id) => artworks.find((a) => a.id === id))
  .filter((a): a is NonNullable<typeof a> => a != null);

/* Hiking photo strip. Tiles with a `src` render an optimized photo; the `tone`
   is a nature-toned fallback shown while loading or if a photo is missing. */
type HikePhoto = { src?: string; alt?: string; label: string; tone: string };
const hikingPhotos: HikePhoto[] = [
  { src: "/images/hiking/hike-1.jpeg", alt: "Crouching by a creek in the redwoods", label: "by the creek", tone: "linear-gradient(155deg,#a7c0cb,#5b7d77 55%,#33504a)" },
  { src: "/images/hiking/hike-2.jpeg", alt: "Stepping across a forest stream bed", label: "creek crossing", tone: "linear-gradient(155deg,#bcca9d,#6f8f5a 55%,#3e5a35)" },
  { src: "/images/hiking/hike-3.jpeg", alt: "Dappled light through a wooden pergola walkway", label: "dappled light", tone: "linear-gradient(155deg,#abc4d7,#6d94b0 55%,#3e5f78)" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="uppercase"
      style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.18em", color: "var(--color-accent)", fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

export default function MobileLayout({
  onOpen,
}: {
  onOpen?: (type: WidgetType, rect: DOMRect, projectId?: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const track = useNowPlaying();
  // Tapping a gallery thumbnail zooms it in a lightbox; "View all" opens the
  // full gallery overlay.
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);

  // Reveal on scroll — but never leave a block blank. Blocks default hidden via
  // `.m-rise`; this reveals each as it enters, and a fallback reveals everything
  // after a short delay (so a fast scroll, a screenshot, or an IO failure can't
  // strand content invisible — the bug the old version had).
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(".m-rise"));
    const reveal = (el: Element) => el.classList.add("is-in");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
    );
    blocks.forEach((b) => io.observe(b));
    const fallback = window.setTimeout(() => blocks.forEach(reveal), 1500);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const open = (type: WidgetType) => (e: React.MouseEvent<HTMLElement>) => {
    onOpen?.(type, e.currentTarget.getBoundingClientRect());
  };

  // Tapping a project card jumps straight into that project's case study.
  const openProject = (projectId: string) => (e: React.MouseEvent<HTMLElement>) => {
    onOpen?.("projects", e.currentTarget.getBoundingClientRect(), projectId);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-7 px-4 pt-6 pb-16 max-w-[480px] mx-auto">
      {/* 1 ── HERO — title + project gallery on the first screen (mobile only) */}
      <section className="m-rise flex flex-col">
        <h1
          className="pt-[12vh] font-extrabold leading-[0.84]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            fontSize: "clamp(76px, 23vw, 124px)",
            letterSpacing: "-0.035em",
          }}
        >
          <span className="block">Winston</span>
          <span className="flex items-end gap-3.5">
            <span>Gu</span>
            {/* Roles tucked into the negative space beside the short "Gu" line */}
            <span
              className="flex flex-col pb-[0.5em]"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: "0.7rem",
                lineHeight: 1.55,
                letterSpacing: "0.12em",
                color: "var(--color-accent)",
              }}
            >
              <span className="uppercase">Game Designer</span>
              <span className="uppercase">UIUX Engineer</span>
              <span className="uppercase">Product Designer</span>
            </span>
          </span>
        </h1>

        {/* project gallery — flows straight out of the name, no heading */}
        <div className="mt-10 grid grid-cols-2 gap-3">
          {mobileProjects.map((p) => (
            <button
              key={p.id}
              onClick={openProject(p.id)}
              className="relative block w-full overflow-hidden rounded-2xl text-left cursor-pointer"
              style={{ aspectRatio: "4 / 5", boxShadow: "0 14px 30px -20px rgba(20,30,60,0.5)" }}
            >
              <Image
                src={p.thumbnail}
                alt={p.title}
                fill
                sizes="(max-width: 480px) 46vw, 220px"
                className="object-cover"
              />
              <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.16) 48%, transparent 72%)" }} />
              {p.comingSoon && (
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.14em", color: "#1a1a1a", background: "rgba(233,201,138,0.95)", fontWeight: 600 }}>
                  <span style={{ width: 3, height: 3, borderRadius: 9999, background: "#1a1a1a" }} />
                  Soon
                </span>
              )}
              <span className="absolute left-3 right-3 bottom-3 text-white">
                <span className="block font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: "0.98rem" }}>{p.title}</span>
                <span className="block mt-0.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", opacity: 0.86 }}>{p.role}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3 ── HIKING — personal section (replaces Experience) */}
      <section className="m-rise flex flex-col">
        <h2
          className="font-extrabold leading-[0.9]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            fontSize: "clamp(44px, 13vw, 68px)",
            letterSpacing: "-0.03em",
          }}
        >
          Hiking
        </h2>
        <p
          className="mt-3.5 max-w-[36ch]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1rem",
            lineHeight: 1.62,
            color: "rgba(46,51,54,0.82)",
          }}
        >
          Lately I&rsquo;ve been hiking around the Bay most weekends. I&rsquo;m drawn to the
          quiet stretches near creeks &mdash; getting close to the water and skipping
          stones across the current.
        </p>

        {/* Horizontal photo strip — bleeds to the screen edges, snaps as you swipe. */}
        <div
          className="mt-6 -mx-4 flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          style={{ paddingInline: "1rem", scrollPaddingLeft: "1rem" }}
        >
          {hikingPhotos.map((h, i) => (
            <div
              key={i}
              className="relative shrink-0 snap-start overflow-hidden rounded-2xl"
              style={{
                width: "62vw",
                maxWidth: 248,
                aspectRatio: "3 / 4",
                background: h.tone,
                boxShadow: "0 14px 30px -20px rgba(20,30,60,0.5)",
              }}
            >
              {h.src ? (
                <Image src={h.src} alt={h.alt ?? "Hike photo"} fill sizes="62vw" className="object-cover" />
              ) : (
                <span
                  className="absolute inset-0 flex items-end p-3"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.30), transparent 55%)" }}
                >
                  <span className="uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.92)" }}>
                    {h.label}
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4 ── SKILLS — glass card */}
      <section className="m-rise glass p-5">
        <div className="relative z-10">
          <Eyebrow>Skills</Eyebrow>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.name} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#374151", background: "rgba(46,51,54,0.06)", border: "1px solid rgba(46,51,54,0.08)", padding: "6px 11px", borderRadius: 9999 }}>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5 ── GALLERY — big title, tap-to-zoom thumbnails, View all below */}
      <section className="m-rise flex flex-col">
        <h2
          className="font-extrabold leading-[0.9]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            fontSize: "clamp(44px, 13vw, 68px)",
            letterSpacing: "-0.03em",
          }}
        >
          Gallery
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {galleryArt.map((a) => (
            <button
              key={a.id}
              onClick={() => setLightbox({ image: a.image, title: a.title })}
              className="relative overflow-hidden rounded-xl cursor-pointer"
              style={{ aspectRatio: "1", boxShadow: "0 10px 24px -16px rgba(20,30,60,0.4)" }}
            >
              <Image src={a.image} alt={a.title} fill sizes="46vw" className="object-cover" />
            </button>
          ))}
        </div>
        <button
          onClick={open("gallery")}
          className="mt-5 self-center inline-flex items-center justify-center gap-1.5 rounded-full cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--color-text-primary)",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(46,51,54,0.16)",
            padding: "12px 26px",
            boxShadow: "0 6px 16px -10px rgba(20,30,60,0.4)",
          }}
        >
          View all artwork →
        </button>
      </section>

      {/* 6 ── NOW PLAYING — slim accent */}
      <div className="m-rise flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.65)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
        <div className="shrink-0 overflow-hidden rounded-lg flex items-center justify-center" style={{ width: 44, height: 44, background: "linear-gradient(135deg,#c94b4b,#f0a35e)" }}>
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: "#fff", fontSize: 18 }}>♪</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.04em", color: "var(--color-text-secondary)" }}>I&rsquo;m currently listening to</div>
          <div className="truncate font-semibold" style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem" }}>{track.title}</div>
          <div className="truncate" style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{track.artist}</div>
        </div>
        {/* animated equalizer */}
        <div className="flex items-end gap-[3px] shrink-0" style={{ height: 16 }} aria-hidden>
          <span className="eq-bar" style={{ animationDelay: "-200ms" }} />
          <span className="eq-bar" style={{ animationDelay: "-500ms" }} />
          <span className="eq-bar" style={{ animationDelay: "-80ms" }} />
          <span className="eq-bar" style={{ animationDelay: "-350ms" }} />
        </div>
      </div>

      {/* 7 ── CONTACT + LINKS — glass card */}
      <section className="m-rise glass p-5">
        <div className="relative z-10 flex flex-col">
          <Eyebrow>Let&rsquo;s Connect</Eyebrow>
          <a href={`mailto:${personalInfo.email}`} className="mt-2.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
            {personalInfo.email}
          </a>
          <a
            href={`mailto:${personalInfo.email}`}
            className="mt-3.5 inline-flex w-fit items-center rounded-full font-semibold"
            style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.9rem", padding: "10px 22px", boxShadow: "0 12px 26px -10px rgba(0,122,255,0.6)" }}
          >
            Say Hello
          </a>
          <div className="mt-4 flex gap-2.5">
            {personalInfo.social.github && (
              <SocialPill href={personalInfo.social.github} label="GitHub">
                <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
              </SocialPill>
            )}
            {personalInfo.social.linkedin && (
              <SocialPill href={personalInfo.social.linkedin} label="LinkedIn">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </SocialPill>
            )}
            <SocialPill href={`mailto:${personalInfo.email}`} label="Email">
              <path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm10 9L2.5 6.8v11.2h19V6.8L12 13zm0-2L21.3 5H2.7L12 11z" />
            </SocialPill>
          </div>
        </div>
      </section>

      {/* Gallery lightbox — zoom the tapped artwork */}
      <ImageLightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function SocialPill({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      aria-label={label}
      className="grid place-items-center rounded-full transition-colors"
      style={{
        width: 44,
        height: 44,
        background: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(46,51,54,0.16)",
        color: "var(--color-text-primary)",
        boxShadow: "0 4px 12px -8px rgba(20,30,60,0.4)",
      }}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
