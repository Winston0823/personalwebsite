"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Asterisk } from "@phosphor-icons/react";
import { personalInfo, projects } from "@/lib/detail-content";
import type { WidgetType } from "@/lib/grid-types";
import StudioNav from "@/components/studio/StudioNav";
import DoggoTransfer from "@/components/studio/DoggoTransfer";
import SquiggleOutline from "@/components/studio/SquiggleOutline";
import { projectPath } from "@/lib/project-paths";
import "./studio.css";

const DetailOverlay = dynamic(
  () => import("@/components/detail/DetailOverlay"),
  {
    ssr: false,
    loading: () => (
      <div className="studio-loading" role="status">
        Opening project…
      </div>
    ),
  },
);
type Filter = "all" | "ui-ux" | "games";
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "ui-ux", label: "Digital experiences" },
  { value: "games", label: "Games & worlds" },
];

export default function Home() {
  const [explored, setExplored] = useState(false);
  const [nudged, setNudged] = useState(false);
  const stickerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 12) setExplored(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [filter, setFilter] = useState<Filter>("all");
  const [detail, setDetail] = useState<{
    type: WidgetType;
    rect: DOMRect;
    projectId?: string;
  } | null>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const visible = [...projects]
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .filter(
      (p) =>
        filter === "all" ||
        (filter === "ui-ux" ? p.domain !== "games" : p.domain === "games"),
    );

  useEffect(() => {
    if (!detail) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    homeRef.current?.setAttribute("inert", "");
    return () => {
      document.body.style.overflow = oldOverflow;
      homeRef.current?.removeAttribute("inert");
      triggerRef.current?.focus();
    };
  }, [detail]);

  function open(type: WidgetType, target: HTMLElement, projectId?: string) {
    triggerRef.current = target;
    setDetail({ type, rect: target.getBoundingClientRect(), projectId });
  }

  return (
    <>
      <div className="studio" ref={homeRef}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StudioNav />
        <DoggoTransfer />
        <main id="main">
          <section className="sticker-hero" aria-labelledby="hero-title">
            <h1 id="hero-title" className="sr-only">
              Winston Gu — Designer
            </h1>
            <div className="doggo-drift">
              <button
                ref={stickerRef}
                className={`doggo-sticker${nudged ? " is-nudged" : ""}`}
                aria-label="Winston Gu, Designer. Give doggo a nudge"
                onPointerMove={(event) => {
                  if (event.pointerType !== "mouse") return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  event.currentTarget.style.setProperty(
                    "--tilt-x",
                    `${((event.clientY - rect.top) / rect.height - 0.5) * -14}deg`,
                  );
                  event.currentTarget.style.setProperty(
                    "--tilt-y",
                    `${((event.clientX - rect.left) / rect.width - 0.5) * 14}deg`,
                  );
                }}
                onPointerLeave={() => {
                  stickerRef.current?.style.setProperty("--tilt-x", "0deg");
                  stickerRef.current?.style.setProperty("--tilt-y", "0deg");
                }}
                onClick={() => setNudged(true)}
                onAnimationEnd={() => setNudged(false)}
              >
                <SquiggleOutline variant="sticker" />
                <img
                  data-hero-doggo="true"
                  src="/images/cat-mark.png"
                  alt=""
                  width="792"
                  height="412"
                  fetchPriority="high"
                  draggable="false"
                />
                <span className="sticker-name">Winston Gu</span>
                <span className="sticker-role">Designer</span>
              </button>
            </div>
            <a
              className={`explore-cue${explored ? " is-dismissed" : ""}`}
              href="#work"
              aria-hidden={explored}
              tabIndex={explored ? -1 : 0}
              onClick={(event) => {
                event.preventDefault();
                event.currentTarget.blur();
                setExplored(true);
                document.getElementById("work")?.scrollIntoView({
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "instant"
                    : "smooth",
                  block: "start",
                });
              }}
            >
              Explore <ArrowDown size={22} aria-hidden="true" />
            </a>
          </section>

          <section
            className="work-section"
            id="work"
            aria-labelledby="work-title"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">01 / SELECTED WORK</span>
                <h2 id="work-title">
                  Ideas out in the world<span className="lime-text">.</span>
                </h2>
              </div>
              <span className="section-note">
                From first question to final pixel.
              </span>
            </div>
            <div className="work-toolbar">
              <div
                className="filter-group"
                role="group"
                aria-label="Filter projects"
              >
                {filters.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    aria-pressed={filter === f.value}
                  >
                    {f.label}
                    {filter === f.value && (
                      <span>{visible.length.toString().padStart(2, "0")}</span>
                    )}
                  </button>
                ))}
              </div>
              <span className="toolbar-note" aria-live="polite">
                {visible.length.toString().padStart(2, "0")} PROJECTS
              </span>
            </div>
            <div className="project-grid">
              {visible.map((project, index) => (
                <Link
                  className="studio-project"
                  key={project.id}
                  href={projectPath(project)}
                >
                  <div className="project-image">
                    <img src={project.thumbnail} alt="" loading="lazy" />
                    <span className="project-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {project.inProgress && (
                      <span className="project-status">
                        <span className="live-dot" /> In progress
                      </span>
                    )}
                    <span className="project-open" aria-hidden="true">
                      <ArrowUpRight size={23} />
                    </span>
                  </div>
                  <div className="project-caption">
                    <div>
                      <span className="project-domain">
                        {project.domain === "games"
                          ? "GAME DESIGN & DEVELOPMENT"
                          : "DIGITAL PRODUCT & WEB"}
                      </span>
                      <h3>{project.title}</h3>
                    </div>
                    <ArrowUpRight size={21} aria-hidden="true" />
                  </div>
                  <p>{project.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section
            className="about-section"
            id="about"
            aria-labelledby="about-title"
          >
            <div>
              <span className="eyebrow">02 / THE HUMAN BEHIND THE TABS</span>
              <h2 id="about-title">
                A designer’s eye.
                <br />A builder’s curiosity<span className="lime-text">.</span>
              </h2>
              <div className="about-links">
                <button
                  className="quiet-link"
                  onClick={(e) => open("about", e.currentTarget)}
                >
                  A bit more about me <ArrowUpRight size={17} />
                </button>
                <a
                  className="quiet-link"
                  href="/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Résumé <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
            <div className="about-copy">
              <Asterisk size={48} weight="bold" className="lime-text" />
              <p>
                I’m Winston, a designer and developer studying Interactive Media
                and Game Design at USC.
              </p>
              <p>
                I move between games, interfaces, and the spaces in between. I
                like making complex things feel intuitive, and everyday
                interactions a little more interesting.
              </p>
              <a
                href={personalInfo.social.github}
                target="_blank"
                rel="noreferrer"
              >
                Find me on GitHub <ArrowUpRight size={16} />
              </a>
            </div>
          </section>
          <section className="contact-section">
            <span className="eyebrow">
              HAVE A THOUGHT, A PROJECT, OR A GOOD WHAT IF?
            </span>
            <a href={`mailto:${personalInfo.email}`}>
              Let’s make
              <br />
              something <span>click.</span>
              <ArrowUpRight />
            </a>
            <div className="contact-bottom">
              <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
              <span>OPEN TO GOOD CONVERSATIONS</span>
            </div>
          </section>
        </main>
        <footer className="studio-footer">
          <a className="wordmark" href="#" aria-label="Back to top">
            <img
              src="/images/cat-mark.png"
              alt="Winston’s doggo mark"
              width="72"
              height="38"
            />
          </a>
          <span>© {new Date().getFullYear()} WINSTON GU</span>
          <div>
            <a
              href={personalInfo.social.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <ArrowUpRight size={14} />
            </a>
            <a
              href={personalInfo.social.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={14} />
            </a>
            <a href="#">Back to top ↑</a>
          </div>
        </footer>
      </div>
      {detail && (
        <DetailOverlay
          widget={{
            id: `studio-${detail.type}`,
            type: detail.type,
            position: { col: 0, row: 0 },
            size: { cols: 4, rows: 4 },
          }}
          originRect={detail.rect}
          initialProjectId={detail.projectId}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
