"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { WidgetType } from "@/lib/grid-types";
import ImageLightbox from "@/components/common/ImageLightbox";
import NameSignature from "@/components/common/NameSignature";
import MobileSectionNav from "@/components/common/MobileSectionNav";
import { GithubLogo, LinkedinLogo, EnvelopeSimple, MusicNotes, ArrowRight, ArrowLeft, ArrowUpRight } from "@phosphor-icons/react";

// Section targets for the mobile bottom nav.
const HOME_SECTIONS = [
  { id: "home-top", label: "Top" },
  { id: "home-work", label: "Work" },
  { id: "home-hiking", label: "Hobbies" },
  { id: "home-skills", label: "Skills" },
  { id: "home-gallery", label: "Gallery" },
  { id: "home-contact", label: "Connect" },
];
import {
  projects,
  skills,
  personalInfo,
  artworks,
} from "@/lib/detail-content";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { usePrefersStatic } from "@/hooks/usePrefersStatic";

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

// Native cover aspect ratios (w/h) so the Work tiles show the real image shape
// instead of a forced portrait crop. Falls back to 16:10 for any new project.
const COVER_AR: Record<string, number> = {
  "project-usc-racing": 1.68,
  "project-5": 1.61, // AWL
  "project-6": 1.61, // Sublime
  "project-7": 2.14, // Unrealtor (wide, short)
  "project-1": 1.6, // Dreaming
  "project-ambit": 1.69,
};
const arOf = (id: string) => COVER_AR[id] ?? 1.6;

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

/* Hobbies carousel. Each hobby is a card paged with arrows; its photos fill the
   right of the card (a hero + thumbnails). A photo with a `src` renders an
   optimized image; without one, the `tone` is a fallback shown while loading or
   as a placeholder until real photos are added (e.g. tennis). */
type HobbyPhoto = { src?: string; alt?: string; label: string; tone: string };
type Hobby = { name: string; photos: HobbyPhoto[] };
const hobbies: Hobby[] = [
  {
    name: "Hiking",
    photos: [
      { src: "/images/hiking/hike-1.jpeg", alt: "Crouching by a creek in the redwoods", label: "by the creek", tone: "linear-gradient(155deg,#a7c0cb,#5b7d77 55%,#33504a)" },
      { src: "/images/hiking/hike-2.jpeg", alt: "Stepping across a forest stream bed", label: "creek crossing", tone: "linear-gradient(155deg,#bcca9d,#6f8f5a 55%,#3e5a35)" },
      { src: "/images/hiking/hike-3.jpeg", alt: "Dappled light through a wooden pergola walkway", label: "dappled light", tone: "linear-gradient(155deg,#abc4d7,#6d94b0 55%,#3e5f78)" },
    ],
  },
  {
    name: "Tennis",
    photos: [
      { label: "photos soon", tone: "linear-gradient(155deg,#d9a05b,#bd6f3c 55%,#7e4422)" },
      { label: "baseline", tone: "linear-gradient(155deg,#caa06b,#a86f3e 52%,#6f4423)" },
      { label: "first serve", tone: "linear-gradient(155deg,#d6b07a,#b07c45 52%,#75481f)" },
    ],
  },
];

/* Unified section header — type-forward to match the hero: a quiet mono index
   (accent, echoing the hero's mono titles) beside a Plein display heading. No
   eyebrow. Used on every section so they read consistently. */
function SectionHead({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3">
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", color: "var(--color-accent)" }}>
        {index}
      </span>
      <h2
        className="leading-[0.95]"
        style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(40px, 12vw, 58px)", letterSpacing: "-0.03em", color: "var(--color-text-primary)" }}
      >
        {children}
      </h2>
    </div>
  );
}

export default function MobileLayout({
  onOpen,
}: {
  onOpen?: (type: WidgetType, rect: DOMRect, projectId?: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const track = useNowPlaying();
  const [navActive, setNavActive] = useState("home-top");
  const [showNav, setShowNav] = useState(false);
  const [hobbyIdx, setHobbyIdx] = useState(0);
  // Hobby card transition: content fades + drifts DOWN on exit, then the next
  // hobby fades in from ABOVE. Sequential (out fully, then in).
  const [hobbyPhase, setHobbyPhase] = useState<"idle" | "out" | "in-prep" | "in">("idle");
  const hobbyAnim = useRef(false);
  const hobbyTimers = useRef<number[]>([]);
  const staticMode = usePrefersStatic();
  useEffect(() => () => { hobbyTimers.current.forEach((t) => clearTimeout(t)); }, []);
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

  // Cinematic hero exit: the pinned hero dissolves (fade + drift + soft blur) as
  // you scroll the first ~half-screen into Work, instead of just sliding off.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const vh = window.innerHeight || 1;
      const p = Math.max(0, Math.min(1, window.scrollY / (vh * 0.42)));
      el.style.opacity = String(1 - p);
      // Stays in place — just a slight upward drift while it dissolves.
      el.style.transform = `translateY(${(-8 * p).toFixed(1)}px) scale(${(1 - p * 0.035).toFixed(3)})`;
      el.style.filter = p > 0.002 ? `blur(${(p * 2).toFixed(1)}px)` : "none";

      // Drive the bottom section nav: active section + show once past the hero.
      const probe = window.scrollY + vh * 0.4;
      let act = HOME_SECTIONS[0].id;
      for (const s of HOME_SECTIONS) {
        const sEl = document.getElementById(s.id);
        if (sEl && sEl.getBoundingClientRect().top + window.scrollY <= probe) act = s.id;
      }
      setNavActive((prev) => (prev === act ? prev : act));
      const sn = window.scrollY > vh * 0.5;
      setShowNav((prev) => (prev === sn ? prev : sn));
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  const open = (type: WidgetType) => (e: React.MouseEvent<HTMLElement>) => {
    onOpen?.(type, e.currentTarget.getBoundingClientRect());
  };

  // Tapping a project card jumps straight into that project's case study.
  const openProject = (projectId: string) => (e: React.MouseEvent<HTMLElement>) => {
    onOpen?.("projects", e.currentTarget.getBoundingClientRect(), projectId);
  };

  // One Work tile, sized to its cover's native aspect ratio (no crop). `lead`
  // bumps the title for the full-width hero tile.
  const tile = (p: (typeof mobileProjects)[number], lead = false) => (
    <button
      key={p.id}
      onClick={openProject(p.id)}
      className="relative block w-full overflow-hidden rounded-2xl text-left cursor-pointer"
      style={{ aspectRatio: String(arOf(p.id)), boxShadow: "0 14px 30px -20px rgba(20,30,60,0.5)" }}
    >
      <Image
        src={p.thumbnail}
        alt={p.title}
        fill
        sizes={lead ? "(max-width: 480px) 92vw, 440px" : "(max-width: 480px) 44vw, 210px"}
        className="object-cover"
      />
      <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.16) 48%, transparent 72%)" }} />
      {p.comingSoon && (
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.14em", color: "#1a1a1a", background: "rgba(233,201,138,0.95)", fontWeight: 600 }}>
          <span style={{ width: 3, height: 3, borderRadius: 9999, background: "#1a1a1a" }} />
          Soon
        </span>
      )}
      <span className={lead ? "absolute left-4 right-4 bottom-4 text-white" : "absolute left-3 right-3 bottom-3 text-white"}>
        <span className="block font-bold tracking-tight leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: lead ? "1.3rem" : "0.92rem" }}>{p.title}</span>
        <span className="block mt-0.5" style={{ fontFamily: "var(--font-mono)", fontSize: lead ? "0.66rem" : "0.58rem", opacity: 0.86 }}>{p.role}</span>
      </span>
    </button>
  );

  // Hobbies carousel: page between hobby cards (wraps around) with a fade +
  // vertical-drift transition (exit down, enter from above).
  const hobby = hobbies[hobbyIdx];
  const HB_OUT = 300, HB_IN = 340, HB_SHIFT = 16;
  const goHobby = (dir: number) => {
    if (hobbyAnim.current) return;
    const next = (hobbyIdx + dir + hobbies.length) % hobbies.length;
    if (staticMode) { setHobbyIdx(next); return; }
    hobbyAnim.current = true;
    setHobbyPhase("out");
    hobbyTimers.current.push(
      window.setTimeout(() => {
        setHobbyIdx(next);
        setHobbyPhase("in-prep"); // snap above, invisible
        requestAnimationFrame(() => requestAnimationFrame(() => setHobbyPhase("in")));
        hobbyTimers.current.push(
          window.setTimeout(() => {
            setHobbyPhase("idle");
            hobbyAnim.current = false;
          }, HB_IN + 30)
        );
      }, HB_OUT)
    );
  };
  const hobbyContentStyle: React.CSSProperties =
    hobbyPhase === "out"
      ? { opacity: 0, transform: `translateY(${HB_SHIFT}px)`, transition: `opacity ${HB_OUT}ms cubic-bezier(0.4,0,1,1), transform ${HB_OUT}ms cubic-bezier(0.4,0,1,1)`, willChange: "opacity, transform" }
      : hobbyPhase === "in-prep"
      ? { opacity: 0, transform: `translateY(-${HB_SHIFT}px)`, transition: "none", willChange: "opacity, transform" }
      : hobbyPhase === "in"
      ? { opacity: 1, transform: "translateY(0)", transition: `opacity ${HB_IN}ms cubic-bezier(0,0,0.2,1), transform ${HB_IN}ms cubic-bezier(0,0,0.2,1)`, willChange: "opacity, transform" }
      : { opacity: 1, transform: "translateY(0)" };

  // One photo inside a hobby card — tappable to zoom when it has a real image.
  const hobbyPhoto = (ph: HobbyPhoto, hero: boolean) => {
    const inner = (
      <>
        {ph.src && <Image src={ph.src} alt={ph.alt ?? hobby.name} fill sizes={hero ? "(max-width: 480px) 60vw, 280px" : "(max-width: 480px) 30vw, 140px"} className="object-cover" />}
        <span
          className="absolute inset-0 flex items-end p-2.5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.34), transparent 58%)" }}
        >
          {hero && (
            <span className="uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.92)" }}>
              {ph.label}
            </span>
          )}
        </span>
      </>
    );
    const cls = "relative block w-full overflow-hidden rounded-xl";
    const style = { aspectRatio: hero ? "4 / 3" : "1 / 1", background: ph.tone } as const;
    return ph.src ? (
      <button onClick={() => setLightbox({ image: ph.src!, title: `${hobby.name} — ${ph.label}` })} className={`${cls} cursor-pointer text-left`} style={style}>
        {inner}
      </button>
    ) : (
      <div className={cls} style={style}>{inner}</div>
    );
  };

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-12 px-5 pt-6 pb-20 max-w-[480px] mx-auto">
      {/* 1 ── HERO — pinned name + titles that fade out cinematically as you
          scroll into Work (the track gives the scroll room for the dissolve). */}
      <div id="home-top" className="relative" style={{ height: "125dvh" }}>
        <section className="sticky top-0 @container" style={{ height: "100dvh" }}>
          <div ref={heroRef} className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ willChange: "opacity, transform" }}>
            {/* Faint dot-grid backdrop, masked so it pools behind the name. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(46,51,54,0.16) 1px, transparent 1.6px)",
                backgroundSize: "22px 22px",
                WebkitMaskImage: "radial-gradient(ellipse 66% 56% at 50% 44%, #000 26%, transparent 80%)",
                maskImage: "radial-gradient(ellipse 66% 56% at 50% 44%, #000 26%, transparent 80%)",
              }}
            />
            <div className="relative w-full flex flex-col items-center">
              <NameSignature className="relative w-full overflow-hidden" style={{ height: "clamp(108px, 19vh, 168px)" }} />
              <div className="flex flex-col items-center gap-1.5" style={{ marginTop: "0.25rem" }}>
                {["Game Designer", "UIUX Engineer", "Product Designer"].map((t) => (
                  <span
                    key={t}
                    className="uppercase"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", letterSpacing: "0.2em", color: "var(--color-accent)", fontWeight: 600 }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 2 ── WORK — project gallery (its own section, below the hero) */}
      <section id="home-work" className="m-rise flex flex-col scroll-mt-4">
        <SectionHead index="01">work.</SectionHead>
        {/* Lead project full-width, the rest masonry-packed at native cover
            shape — split across two columns so differing heights interlock
            cleanly with no gaps (alt-index keeps higher-priority tiles on top). */}
        <div className="mt-5 flex flex-col gap-3">
          {mobileProjects[0] && tile(mobileProjects[0], true)}
          <div className="flex items-start gap-3">
            <div className="flex-1 flex flex-col gap-3">
              {mobileProjects.slice(1).filter((_, i) => i % 2 === 0).map((p) => tile(p))}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {mobileProjects.slice(1).filter((_, i) => i % 2 === 1).map((p) => tile(p))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 ── HOBBIES — paged card carousel: vertical title on the left, photos
          on the right. Arrows page between hobby cards (hiking, tennis…). */}
      <section id="home-hiking" className="m-rise flex flex-col scroll-mt-4">
        <SectionHead index="02">hobbies.</SectionHead>

        <div className="mt-5">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl" style={{ background: "#1c1f21", padding: 14, boxShadow: "0 18px 40px -24px rgba(20,30,60,0.55)" }}>
            <div className="flex gap-3" style={hobbyContentStyle}>
              {/* vertical hobby title */}
              <div className="flex items-end pb-1" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
                  {hobby.name}
                </span>
              </div>

              {/* photos */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                {hobbyPhoto(hobby.photos[0], true)}
                {hobby.photos.length > 1 && (
                  <div className="flex gap-2.5">
                    {hobby.photos.slice(1, 3).map((ph, i) => (
                      <div key={i} className="flex-1 min-w-0">{hobbyPhoto(ph, false)}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls — prev / dots / next */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => goHobby(-1)}
              aria-label="Previous hobby"
              className="grid place-items-center rounded-full cursor-pointer"
              style={{ width: 46, height: 46, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,51,54,0.16)", color: "var(--color-text-primary)", boxShadow: "0 4px 12px -8px rgba(20,30,60,0.4)" }}
            >
              <ArrowLeft size={18} weight="bold" />
            </button>

            <div className="flex gap-2" aria-hidden>
              {hobbies.map((_, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: 9999, background: i === hobbyIdx ? "var(--color-accent)" : "rgba(46,51,54,0.22)", transition: "background 200ms ease" }} />
              ))}
            </div>

            <button
              onClick={() => goHobby(1)}
              aria-label="Next hobby"
              className="grid place-items-center rounded-full cursor-pointer"
              style={{ width: 46, height: 46, background: "rgba(255,255,255,0.7)", border: "1px solid rgba(46,51,54,0.16)", color: "var(--color-text-primary)", boxShadow: "0 4px 12px -8px rgba(20,30,60,0.4)" }}
            >
              <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 ── SKILLS — headed section */}
      <section id="home-skills" className="m-rise flex flex-col scroll-mt-4">
        <SectionHead index="03">skills.</SectionHead>
        <div className="mt-5 flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.name} style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#374151", background: "rgba(46,51,54,0.06)", border: "1px solid rgba(46,51,54,0.08)", padding: "6px 11px", borderRadius: 9999 }}>
              {s.name}
            </span>
          ))}
        </div>
      </section>

      {/* 5 ── GALLERY — big title, tap-to-zoom thumbnails, View all below */}
      <section id="home-gallery" className="m-rise flex flex-col scroll-mt-4">
        <SectionHead index="04">gallery.</SectionHead>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
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
          View all artwork
          <ArrowUpRight size={15} weight="bold" />
        </button>
      </section>

      {/* 6 ── NOW PLAYING — slim accent */}
      <div className="m-rise flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.65)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
        <div className="shrink-0 overflow-hidden rounded-lg flex items-center justify-center" style={{ width: 44, height: 44, background: "linear-gradient(135deg,#c94b4b,#f0a35e)" }}>
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.albumArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <MusicNotes size={20} weight="fill" color="#fff" />
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

      {/* 7 ── CONNECT + LINKS — headed section */}
      <section id="home-contact" className="m-rise flex flex-col scroll-mt-4">
        <SectionHead index="05">connect.</SectionHead>
        <a href={`mailto:${personalInfo.email}`} className="mt-4" style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
          {personalInfo.email}
        </a>
        <a
          href={`mailto:${personalInfo.email}`}
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full font-semibold"
          style={{ background: "var(--color-accent)", color: "#fff", fontSize: "0.9rem", padding: "10px 22px", boxShadow: "0 12px 26px -10px rgba(0,122,255,0.6)" }}
        >
          Say Hello
          <ArrowRight size={16} weight="bold" />
        </a>
        <div className="mt-5 flex gap-2.5">
          {personalInfo.social.github && (
            <SocialPill href={personalInfo.social.github} label="GitHub">
              <GithubLogo size={20} weight="fill" />
            </SocialPill>
          )}
          {personalInfo.social.linkedin && (
            <SocialPill href={personalInfo.social.linkedin} label="LinkedIn">
              <LinkedinLogo size={20} weight="fill" />
            </SocialPill>
          )}
          <SocialPill href={`mailto:${personalInfo.email}`} label="Email">
            <EnvelopeSimple size={20} weight="regular" />
          </SocialPill>
        </div>
      </section>

      {/* Gallery lightbox — zoom the tapped artwork */}
      <ImageLightbox item={lightbox} onClose={() => setLightbox(null)} />

      {/* Bottom section nav — appears once past the hero */}
      <MobileSectionNav
        items={HOME_SECTIONS}
        activeId={navActive}
        onJump={jumpTo}
        accent="var(--color-accent)"
        variant="light"
        show={showNav}
      />
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
      {children}
    </a>
  );
}
