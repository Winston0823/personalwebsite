"use client";

import { Fragment, useState } from "react";
import { Project } from "@/lib/detail-types";
import Reveal from "./Reveal";
import KunaiTransition from "./KunaiTransition";
import TrailerButton from "./TrailerButton";

/* ── Editorial case-study body (dark) ────────────────────────────────────────
   Full-width reading section that flows below the katana beat. Mono voice kept
   for cohesion, but organised like a designed case study: a pull-quote, numbered
   sticky section labels in a two-column grid, consistently-treated captioned
   media, and a credits footer. Everything reveals on scroll. */

const ACCENT = "#3b82f6";

function slug(label: string) {
  return "awl-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function SectionRow({
  index,
  label,
  anchor,
  children,
}: {
  index: string;
  label: string;
  anchor: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      id={anchor}
      data-awl-section=""
      data-awl-label={label}
      className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-x-10 gap-y-4 scroll-mt-24"
      style={{
        paddingTop: "3.5rem",
        marginTop: "3.5rem",
        borderTop: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {/* Sticky numbered label */}
      <div className="md:sticky md:top-24 self-start">
        <div
          className="flex items-baseline gap-3 md:flex-col md:gap-1"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>
            {index}
          </span>
          <span
            className="uppercase"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.72rem",
              letterSpacing: "0.22em",
            }}
          >
            {label}
          </span>
        </div>
      </div>
      {/* Content column */}
      <div className="min-w-0">{children}</div>
    </Reveal>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-white"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(1.2rem, 1.8vw, 1.55rem)",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        marginBottom: "1rem",
      }}
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-white/75"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(0.95rem, 1.05vw, 1.02rem)",
        lineHeight: 1.75,
        marginBottom: "1rem",
        maxWidth: "62ch",
      }}
    >
      {children}
    </p>
  );
}

function MediaGrid({
  media,
}: {
  media: { src: string; alt: string; caption?: string }[];
}) {
  if (!media.length) return null;
  return (
    <div
      className={`mt-6 grid gap-5 ${media.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}
    >
      {media.map((m, i) => (
        <Reveal key={i} delay={i * 90}>
          <figure className="m-0">
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "#0b0b0d",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.src}
                alt={m.alt}
                className="block w-full h-auto"
                loading="lazy"
                decoding="async"
              />
            </div>
            {m.caption && (
              <figcaption
                className="text-white/45 mt-2.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.74rem",
                  letterSpacing: "0.04em",
                }}
              >
                {m.caption}
              </figcaption>
            )}
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

function ExpandableContribution({
  num,
  title,
  preview,
  detail,
}: {
  num: string;
  title: string;
  preview?: string;
  detail: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingTop: "1.3rem",
        marginTop: "1.3rem",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-baseline gap-3 text-left w-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span style={{ color: ACCENT, fontSize: "0.72rem" }}>{num}</span>
        <span
          aria-hidden="true"
          className="text-white/40 inline-block transition-transform duration-200"
          style={{ fontSize: "0.6em", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ▸
        </span>
        <span
          className="text-white"
          style={{ fontSize: "clamp(1rem, 1.4vw, 1.15rem)", fontWeight: 700 }}
        >
          {title}
        </span>
      </button>
      {preview && (
        <p
          className="text-white/70"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginTop: "0.5rem",
            paddingLeft: "2.4rem",
          }}
        >
          {preview}
        </p>
      )}
      {open && (
        <p
          className="text-white/50"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
            marginTop: preview ? "0.55rem" : "0.8rem",
            paddingLeft: "2.4rem",
            maxWidth: "60ch",
          }}
        >
          {detail}
        </p>
      )}
    </div>
  );
}

export default function AwlProse({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  // Walking section counter so numbering stays correct as blocks vary.
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  // Prefer an explicit trailer link; otherwise turn the embed URL into a watch URL.
  const trailerHref =
    project.links?.find((l) => /trailer/i.test(l.label))?.url ??
    (project.videos?.[0] ? project.videos[0].replace("/embed/", "/watch?v=") : "");

  return (
    <div className="text-white mx-auto w-full" style={{ maxWidth: "1080px" }}>
      {/* Hero question — the design problem, centered like a hero statement. */}
      {project.problem && (
        <Reveal
          id="awl-question"
          data-awl-section=""
          data-awl-label="The question"
          className="flex flex-col items-center justify-center text-center scroll-mt-24"
          style={{ minHeight: "62vh", paddingBottom: "2rem" }}
        >
          <div
            className="uppercase mb-7"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.34em",
              color: ACCENT,
            }}
          >
            The Question
          </div>
          <blockquote className="m-0" style={{ maxWidth: "660px" }}>
            <p
              className="text-white"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(1.2rem, 1.9vw, 1.7rem)",
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                fontWeight: 600,
              }}
            >
              {project.problem}
            </p>
          </blockquote>
        </Reveal>
      )}

      {project.longDescription && (
        <SectionRow index={next()} label="Overview" anchor="awl-overview">
          <Body>{project.longDescription}</Body>
        </SectionRow>
      )}

      {project.narrativeBlocks?.map((block, i) => {
        const label = i === 0 ? "Process" : "Build";
        const blocks = project.narrativeBlocks!;
        return (
          <Fragment key={i}>
            <SectionRow index={next()} label={label} anchor={`${slug(label)}-${i}`}>
              <H3>{block.title}</H3>
              <Body>{block.body}</Body>
              {block.media && <MediaGrid media={block.media} />}
            </SectionRow>
            {/* Kunai spirals across the gap between Process and Build */}
            {i === 0 && blocks.length > 1 && <KunaiTransition />}
          </Fragment>
        );
      })}

      {project.contributions && project.contributions.length > 0 && (
        <SectionRow index={next()} label="Contributions" anchor="awl-contributions">
          <H3>What I built</H3>
          {project.contributions.map((c, i) => (
            <ExpandableContribution
              key={i}
              num={String(i + 1).padStart(2, "0")}
              title={c.title}
              preview={c.preview}
              detail={c.detail}
            />
          ))}
        </SectionRow>
      )}

      {project.outcome && (
        <Reveal
          id="awl-outcome"
          data-awl-section=""
          data-awl-label="Outcome"
          className="scroll-mt-24"
          style={{
            position: "relative",
            width: "100vw",
            left: "calc(-50vw + 50%)",
            marginTop: "4rem",
          }}
        >
          <div
            className="relative flex items-center"
            style={{
              minHeight: "440px",
              backgroundImage:
                "linear-gradient(90deg, #050505 0%, #050505 44%, rgba(5,5,5,0.35) 64%, rgba(5,5,5,0) 82%), url('/images/awl/awl-3rd-person-gameplay.png')",
              backgroundSize: "cover",
              backgroundPosition: "center right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div
              style={{
                width: "100%",
                paddingLeft: "max(1.5rem, calc((100vw - 1040px) / 2))",
                paddingRight: "1.5rem",
                paddingTop: "4rem",
                paddingBottom: "4rem",
              }}
            >
              {/* Same grid format as the other sections: numbered label column
                  on the left, H3 + body in the content column. */}
              <div
                className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-x-10 gap-y-4"
                style={{ maxWidth: "720px" }}
              >
                <div className="md:sticky md:top-24 self-start">
                  <div
                    className="flex items-baseline gap-3 md:flex-col md:gap-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>
                      {next()}
                    </span>
                    <span
                      className="uppercase"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.22em",
                      }}
                    >
                      Outcome
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <H3>Where it landed</H3>
                  <Body>{project.outcome}</Body>
                </div>
              </div>
            </div>

            {/* Trailer affordance floats over the footage on the right, like a
                play overlay on a video poster. */}
            {trailerHref && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "75%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 2,
                }}
              >
                <TrailerButton href={trailerHref} size={144} />
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Credits footer */}
      <Reveal
        style={{
          marginTop: "3.5rem",
          paddingTop: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {project.team && project.team.length > 0 && (
          <div
            className="text-white/45 mb-6"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.7 }}
          >
            {project.team.map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/55">
          <button
            onClick={onBack}
            className="hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
          >
            ← all projects
          </button>
          {project.links?.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
            >
              {l.label.toLowerCase()} ↗
            </a>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
