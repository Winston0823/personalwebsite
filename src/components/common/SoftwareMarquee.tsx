"use client";

/**
 * Auto-scrolling strip of software marks, shared by the Skills widget and the
 * Skills inspect so the two can never drift apart.
 *
 * Brand glyphs come from simple-icons. Adobe and Procreate pulled their marks
 * from that set, so Photoshop / Premiere / Procreate — and Maya, whose real
 * mark is a solid block that breaks the line weight — are authored monogram
 * tiles in the same visual language.
 */

export const SOFTWARE = [
  { file: "unity", label: "Unity" },
  { file: "unreal-engine", label: "Unreal Engine" },
  { file: "blender", label: "Blender" },
  { file: "maya", label: "Maya" },
  { file: "figma", label: "Figma" },
  { file: "photoshop", label: "Photoshop" },
  { file: "premiere-pro", label: "Premiere Pro" },
  { file: "procreate", label: "Procreate" },
  { file: "wordpress", label: "WordPress" },
] as const;

export default function SoftwareMarquee({
  size = "sm",
  label = "Software I use",
}: {
  /** sm = dashboard widget, lg = inspect panel. */
  size?: "sm" | "lg";
  label?: string;
}) {
  return (
    <div
      className={`skill-marquee skill-marquee--${size}`}
      role="group"
      aria-label={label}
    >
      <div className="skill-marquee__track">
        {/* Rendered twice back-to-back: the track translates by exactly -50%,
            so the second copy lands where the first started and the loop seam
            is invisible. The duplicate is hidden from assistive tech. */}
        {[0, 1].map((copy) => (
          <div className="skill-marquee__group" key={copy} aria-hidden={copy === 1}>
            {SOFTWARE.map((s) => (
              <span
                key={s.file}
                className="skill-marquee__logo"
                role={copy === 0 ? "img" : undefined}
                aria-label={copy === 0 ? s.label : undefined}
                title={copy === 0 ? s.label : undefined}
                style={{ "--logo-src": `url(/icons/software/${s.file}.svg)` } as React.CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
