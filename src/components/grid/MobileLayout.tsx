"use client";

import { useEffect, useRef } from "react";
import { WidgetType } from "@/lib/grid-types";
import {
  projects,
  experience,
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
  onOpen?: (type: WidgetType, rect: DOMRect) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const track = useNowPlaying();

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

  return (
    <div ref={containerRef} className="flex flex-col gap-7 px-4 pt-6 pb-16 max-w-[480px] mx-auto">
      {/* 1 ── NAME — glass card */}
      <section className="m-rise glass p-5">
        <div className="relative z-10 flex flex-col">
          <Eyebrow>Game Designer · UIUX Engineer · Product Designer</Eyebrow>
          <h1 className="name-poster mt-2 font-extrabold leading-[0.9] tracking-tight" style={{ color: "rgba(46,51,54,0.14)" }}>
            Winston<br />Gu
          </h1>
          <p className="mt-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>
            available summer 2026 · let&rsquo;s build something
          </p>
        </div>
      </section>

      {/* 2 ── PROJECTS — full-width section */}
      <section className="m-rise flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Projects</Eyebrow>
          <button onClick={open("projects")} className="cursor-pointer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
            View all →
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {mobileProjects.map((p) => (
            <button
              key={p.id}
              onClick={open("projects")}
              className="relative block w-full overflow-hidden rounded-2xl text-left cursor-pointer"
              style={{ aspectRatio: "16 / 10", boxShadow: "0 16px 34px -20px rgba(20,30,60,0.5)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumbnail} alt={p.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.74) 0%, rgba(0,0,0,0.12) 46%, transparent 70%)" }} />
              {p.comingSoon && (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.16em", color: "#1a1a1a", background: "rgba(233,201,138,0.95)", fontWeight: 600 }}>
                  <span style={{ width: 4, height: 4, borderRadius: 9999, background: "#1a1a1a" }} />
                  Coming soon
                </span>
              )}
              <span className="absolute left-4 right-4 bottom-3.5 text-white">
                <span className="block font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}>{p.title}</span>
                <span className="block mt-0.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", opacity: 0.86 }}>{p.role}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3 ── EXPERIENCE — full-width section */}
      <section className="m-rise flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Experience</Eyebrow>
          {personalInfo.resume && (
            <a href={personalInfo.resume} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
              ↓ PDF
            </a>
          )}
        </div>
        <div className="flex flex-col gap-5 pl-4" style={{ borderLeft: "1.5px solid rgba(46,51,54,0.12)" }}>
          {experience.map((xp) => (
            <div key={xp.id} className="relative">
              <span className="absolute" style={{ left: -21, top: 5, width: 8, height: 8, borderRadius: 9999, background: "var(--color-accent)", boxShadow: "0 0 0 3px var(--color-bg)" }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-accent)" }}>{xp.year}</div>
              <div className="mt-0.5 font-semibold" style={{ fontFamily: "var(--font-sans)", fontSize: "0.98rem", color: "var(--color-text-primary)" }}>{xp.role}</div>
              <div className="mt-0.5" style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                {xp.company}{xp.location ? ` · ${xp.location}` : ""}
              </div>
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

      {/* 5 ── GALLERY — full-width section */}
      <section className="m-rise flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Eyebrow>Gallery</Eyebrow>
          <button onClick={open("gallery")} className="cursor-pointer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-secondary)" }}>
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {galleryArt.map((a) => (
            <button key={a.id} onClick={open("gallery")} className="overflow-hidden rounded-xl cursor-pointer" style={{ aspectRatio: "1", boxShadow: "0 10px 24px -16px rgba(20,30,60,0.4)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.image} alt={a.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
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
          <div className="uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", color: "var(--color-text-secondary)" }}>Now playing</div>
          <div className="truncate font-semibold" style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem" }}>{track.title}</div>
          <div className="truncate" style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{track.artist}</div>
        </div>
        <span style={{ color: "var(--color-accent)", fontSize: 16 }}>▮▮▮</span>
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
            {personalInfo.social.github && <SocialPill href={personalInfo.social.github} label="GH" />}
            {personalInfo.social.linkedin && <SocialPill href={personalInfo.social.linkedin} label="in" />}
            <SocialPill href={`mailto:${personalInfo.email}`} label="@" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SocialPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="grid place-items-center rounded-full"
      style={{ width: 40, height: 40, border: "1px solid rgba(46,51,54,0.12)", color: "#374151", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
    >
      {label}
    </a>
  );
}
