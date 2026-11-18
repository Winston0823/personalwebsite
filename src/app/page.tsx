"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "@phosphor-icons/react";
import { personalInfo, projects } from "@/lib/detail-content";
import StudioNav from "@/components/studio/StudioNav";
import DoggoTransfer from "@/components/studio/DoggoTransfer";
import SquiggleOutline from "@/components/studio/SquiggleOutline";
import ContactCardMotion from "@/components/studio/ContactCardMotion";
import TypedDesignerRole from "@/components/studio/TypedDesignerRole";
import NameSignature from "@/components/common/NameSignature";
import { projectPath } from "@/lib/project-paths";
import "./studio.css";

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
  const visible = [...projects]
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .filter(
      (p) =>
        filter === "all" ||
        (filter === "ui-ux" ? p.domain !== "games" : p.domain === "games"),
    );

  return (
      <div className="studio">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StudioNav />
        <DoggoTransfer />
        <main id="main">
          <section className="sticker-hero" aria-labelledby="hero-title">
            <h1 id="hero-title" className="sr-only">
              Winston Gu — Game and Product Designer
            </h1>
            <div className="doggo-drift">
              <button
                ref={stickerRef}
                className={`doggo-sticker${nudged ? " is-nudged" : ""}`}
                aria-label="Winston Gu, Game and Product Designer. Give doggo a nudge"
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
                <NameSignature
                  className="sticker-name"
                  englishText="Winston Gu"
                  ink="#55554f"
                />
                <TypedDesignerRole />
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
              <h2 id="work-title">
                Work<span className="work-cursor" aria-hidden="true">|</span>
              </h2>
            </div>
            <Link className="work-sandbox-link" href="/sandbox">
              Explore my sandbox!
            </Link>
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
                  </button>
                ))}
              </div>
            </div>
            <div className="project-grid">
              {visible.map((project) => (
                <Link
                  className="studio-project"
                  key={project.id}
                  href={projectPath(project)}
                >
                  <div className="project-image">
                    <SquiggleOutline variant="project" imageSrc={project.thumbnail} />
                    {project.inProgress && (
                      <span className="project-status">
                        <span className="live-dot" /> In progress
                      </span>
                    )}
                  </div>
                  <div className="project-caption">
                    <h3>{project.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          <section className="contact-section" aria-label="Contact Winston Gu">
            <a
              className="contact-card"
              href={`mailto:${personalInfo.email}`}
              aria-label={`Email Winston Gu at ${personalInfo.email}`}
            >
              <ContactCardMotion />
              <span className="contact-card-copy">
                <h2>Winston Gu</h2>
                <span className="contact-card-email">{personalInfo.email}</span>
              </span>
              <span className="contact-card-doggo" aria-hidden="true">
                <img src="/images/cat-mark.png" alt="" width="792" height="411" />
              </span>
            </a>
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
  );
}
