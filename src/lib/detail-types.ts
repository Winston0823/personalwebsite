export type ProjectDomain = "games" | "ui-ux" | "entrepreneurship";
export type ProjectRole = "designer" | "art-ui" | "engineer";

/** A single thing you did on the project. Caption is the headline, detail
 *  is 1–2 short sentences. image is optional.
 *
 *  `expandable` is only honored by the "minimal" hero style — it renders
 *  the contribution as a click-to-reveal block (large title, click to
 *  expand the detail underneath). Non-minimal layouts ignore it and always
 *  show title + detail inline. */
export interface Contribution {
  title: string;
  detail: string;
  image?: string;
  expandable?: boolean;
  /** One-line summary shown beneath the title, always visible (collapsed or
   *  open). Lets a scanning reader get the gist without having to click. */
  preview?: string;
}

/** A "before → after" or pivot moment. Either side can be omitted. */
export interface ProcessStep {
  caption: string;
  before?: string;
  after?: string;
}

/** A single tilted artifact (sketch, screenshot, mockup) inside a
 *  NarrativeBlock. Rotation + offset let multiple items overlap like
 *  pinned polaroids on a moodboard. */
export interface NarrativeMedia {
  src: string;
  alt: string;
  caption?: string;
  /** Rotation in degrees. Use small values (-6..+6) for a hand-pinned look. */
  rotate?: number;
  /** Vertical pixel offset for staggering. Negative pulls upward into the
   *  preceding item to create overlap. */
  offsetY?: number;
}

/** A long-form storytelling block — title + paragraph + tilted artifacts.
 *  Renders between the Overview and Contributions sections. Use for
 *  decision-point narratives ("we initially ran into conflicts…") that
 *  warrant inline imagery rather than a clean bulleted contribution list. */
export interface NarrativeBlock {
  title: string;
  body: string;
  media?: NarrativeMedia[];
  /** Arrangement of media relative to the body text. Defaults to
   *  "media-right" if omitted.
   *   - `media-stack`: two media items render as an overlapping pair (top
   *     card frontmost, bottom card peeks behind) and fan apart on hover.
   *   - `media-compare`: two media items render as a draggable before/after
   *     slider — vertical divider starts at 50%, drag to reveal more of one
   *     or the other. Captions show under each side. */
  layout?: "media-right" | "media-left" | "media-below" | "media-stack" | "media-compare";
}

export interface CaseStudyLink {
  label: string;
  url: string;
}

/** Top-of-page metadata strip shown right under the hero on a case study.
 *  Inspired by the reference portfolio's "Project Details" block — quick
 *  facts a recruiter can absorb in 3 seconds before reading any prose. */
export interface ProjectDetails {
  /** Development period — e.g. "2 weeks" or "Sep 2023 – May 2024". Displayed
   *  with an hourglass icon. */
  devPeriod?: string;
  /** e.g. "Team of 5" */
  teamSize?: string;
  /** Class, capstone, jam, or program. e.g. "USC IMGD 320 Junior Project" */
  context?: string;
  /** Software/tools used. e.g. ["Unity", "FMOD", "Photoshop"] */
  tools?: string[];
  /** One paragraph in the designer's voice framing the approach. Renders
   *  italic, between the overview and the contributions. */
  statement?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  category: "game-design" | "level-design" | "narrative" | "other";
  /** Top-level domain — drives the section in the filter sidebar. */
  domain: ProjectDomain;
  /** Roles only meaningful when domain === "games". */
  roles: ProjectRole[];
  featured: boolean;
  /** Lower number = higher up in the projects grid. Projects without a
   *  priority fall to the end, preserving the order they appear in the
   *  data file. Use integers (1, 2, 3, …) but gaps are fine. */
  priority?: number;
  thumbnail: string;
  images?: string[];
  videos?: string[];
  date: string;
  role: string;

  // ─── Case-study fields. All optional. Add only what you have for each
  //     project; missing sections won't render. Keep paragraphs short. ───
  /** Hero video (mp4/webm path or YouTube embed url). Plays above the title. */
  heroVideo?: string;
  /** Page-header style for the case study.
   *   - "full-bleed" (default): cinematic 100vh hero with parallax, title
   *     overlaid on the cover image. Best for projects with strong cover art.
   *   - "editorial": article-style header — title typeset like a headline on
   *     the left, cover image as a framed card on the right. Best for
   *     projects whose story is text-heavy or whose cover art doesn't
   *     warrant a full-screen treatment.
   *   - "minimal": stripped-down editorial — pure-black panel, monospace
   *     typography, oversized lowercase title, single centered ~640px column,
   *     no metadata icons / tilted poster / accent labels / narrative
   *     stacks. Best when you want the project to feel like a quiet, deeply
   *     considered single document.
   *   - "awl": bespoke 3-act cinematic experience (heart-slice hero → demo-reel
   *     parallax → floating 3D katana). Project-specific to Assassin's Weakness
   *     is Love; folds the existing case-study prose into the katana act. */
  heroStyle?: "full-bleed" | "editorial" | "minimal" | "awl" | "sublime" | "usc";
  /** Path to a game-engine or platform icon (SVG) rendered to the LEFT of
   *  the editorial header title. E.g. "/icons/unity.svg". White or
   *  currentColor recommended so it reads on the dark detail panel. */
  engineIcon?: string;
  /** Where the cover image renders in case-study layouts.
   *   - "below" (default): full-width centered figure beneath the hero text.
   *   - "beside-hero": shrunk into a portrait card that sits to the right
   *     of the hero text column (currently honored by the minimal style).
   *   - "behind-hero": natural-aspect image rendered as an ambient backdrop
   *     behind the hero text at reduced opacity, with a radial vignette
   *     fading the edges into the panel background. No crop. */
  coverLayout?: "below" | "beside-hero" | "behind-hero";
  /** CSS object-position value for the cover image (e.g. "75% center" to
   *  push the crop window toward the right side of the source). Defaults
   *  to "center center". Useful when the cover is landscape but you want
   *  a portrait crop focused on a specific element. */
  coverFocus?: string;
  /** CSS aspect-ratio value for the cover card in coverLayout="beside-hero"
   *  (e.g. "3 / 4", "4 / 5", "1 / 1"). Defaults to "3 / 4" — a tight
   *  portrait crop. Use a wider ratio to show more of a landscape cover. */
  coverAspect?: string;
  /** Degrees of clockwise rotation applied to the editorial header poster
   *  card. Use small positive values (8–14) for a polaroid-pinned feel.
   *  Omit or set to 0 for a flat presentation. */
  posterRotation?: number;
  /** Top-of-page metadata strip (devPeriod, team, tools, context, statement). */
  details?: ProjectDetails;
  /** One-sentence framing: what design problem this project solved. */
  problem?: string;
  /** One-line hook surfaced on the dashboard ProjectsWidget tile. Replaces
   *  the tag pills with something a recruiter can act on at a glance —
   *  outcome, scope, or scale. Falls back to `description` if omitted. */
  dashboardLine?: string;
  /** Things you specifically contributed. Add images where useful. */
  contributions?: Contribution[];
  /** Long-form storytelling blocks with inline tilted media. Render between
   *  the Overview and Contributions sections. Use for decision-point
   *  narratives that warrant inline imagery. */
  narrativeBlocks?: NarrativeBlock[];
  /** Iteration evidence: before → after pairs or key pivots. */
  process?: ProcessStep[];
  /** Playtest takeaways, results, or what you'd do differently. */
  outcome?: string;
  /** Team credits — just a flat list of names/roles for now. */
  team?: string[];
  /** External links: itch.io, GitHub, devlog, playable build, etc. */
  links?: CaseStudyLink[];
  /** Prominent closing call-to-action block. Renders near the end of the
   *  case study as a heading + optional subline + primary button — louder
   *  than the quiet `links` row. Use to drive the reader to the live
   *  artifact (deployed site, playable build). */
  cta?: {
    heading: string;
    sublabel?: string;
    label: string;
    url: string;
  };
}

export interface Skill {
  name: string;
  category: "design" | "technical" | "tools" | "art" | "languages";
}

export interface PersonalInfo {
  name: string;
  title: string;
  university: string;
  major: string;
  minor?: string;
  bio: string[];
  email: string;
  social: {
    linkedin?: string;
    github?: string;
  };
  resume?: string;
}

export interface Experience {
  id: string;
  company: string;
  location?: string;
  role: string;
  year: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  date: string;
  medium: string;
  tools: string[];
  category: "illustration" | "3d-render" | "ui-ux";
  image: string;
  /** Intrinsic pixel dimensions of the source image. Used by the gallery's
   *  tetris packer to size tiles without waiting for image load. */
  width: number;
  height: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** 600×600 iTunes artwork URL. Empty string if no match was found. */
  albumArt: string;
}
