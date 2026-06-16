/* Real Ambit content for the case study. Palette + type are confirmed against
   the Ambit app's own source of truth (Ambit/constants/theme.ts, the locked
   2026-06-05 "Vocabulary-committed" system), not the older vault notes.
   Copy is written without em-dashes by design. */

export const ambit = {
  eyebrow: "Product · 0 to 1",
  tagline: "Chat-first, proximity-based hiring. Bay Area founders meet local talent, within reach.",
  // Winston leads UI, experience, and business strategy; Andy Huang engineers it.
  role: "UI, Experience & Strategy",
  credit: "Engineering by Andy Huang",
  date: "2026, in progress",
  stack: ["React Native", "Expo", "Product Design", "0 to 1"],
};

export const ambitPremise =
  "Hiring in the Bay still runs on cold intros and résumé PDFs. Ambit flips it: " +
  "you meet the person first, in chat, and only people who are actually nearby. " +
  "Founders find local talent within reach, and talent meets founders without a " +
  "recruiter in the middle.";

export const ambitSystemIntro =
  "Ambit runs on a small, strict design system. Eggshell paper, serif heroes, one " +
  "warm-tan decorative voice, and a single signature action: a muted teal fill " +
  "with an ink border and a hard offset edge that makes every button feel " +
  "physical. Premium, clean, function-first.";

export const ambitBuild =
  "I lead the UI, the experience, and the business strategy and planning. Andy " +
  "Huang builds the engineering. Native iOS in React Native and Expo, an atomic " +
  "component library, and a warm, tactile visual language tuned for Hinge-level " +
  "polish.";

export const ambitClose =
  "Ambit is in progress. The system is locked, the screens are coming together, " +
  "and the first build is close.";

/* Curated brand swatches — real token values from Ambit/constants/theme.ts.
   The signature interactive accent is the teal `action`; warm tan is decorative. */
export interface Swatch {
  name: string;
  hex: string;
  rgb: string;
  role: string;
  /* Light chip needs dark ink for the HEX overlay; dark chip needs light. */
  ink: "light" | "dark";
}

export const ambitSwatches: Swatch[] = [
  { name: "Eggshell Paper", hex: "#F2EEE4", rgb: "242 238 228", role: "App canvas", ink: "dark" },
  { name: "Cream Island", hex: "#FBFAF5", rgb: "251 250 245", role: "Lifted cards", ink: "dark" },
  { name: "Teal Action", hex: "#A6C7C2", rgb: "166 199 194", role: "Signature button + selected fill", ink: "dark" },
  { name: "Teal Deep", hex: "#6E9CA1", rgb: "110 156 161", role: "Links, icons, the wave", ink: "light" },
  { name: "Warm Tan", hex: "#D4B490", rgb: "212 180 144", role: "Decorative rails, gradients", ink: "dark" },
  { name: "Seeker Sand", hex: "#F2E8DD", rgb: "242 232 221", role: "Seeker card surface", ink: "dark" },
  { name: "Terracotta", hex: "#C76F4A", rgb: "199 111 74", role: "Skills synthesis", ink: "light" },
  { name: "Ink Edge", hex: "#1C1C1A", rgb: "28 28 26", role: "Headlines, borders, hard edges", ink: "light" },
];

/* Honest placeholder screens — real screen headlines from the spec, labeled by
   flow stage. Frames render as labeled previews using the real tokens, not
   fabricated UI; real Figma exports drop in later. */
export interface ScreenCard {
  category: string;
  headline: string;
  caption: string;
}

export const ambitScreens: ScreenCard[] = [
  { category: "Onboarding", headline: "What’s your vibe?", caption: "Set the tone before the résumé." },
  { category: "Role", headline: "Owner, Seeker, or Both", caption: "One tap picks your side of the table." },
  { category: "Skills", headline: "What are you good at?", caption: "Honest tags, capped, no filler." },
  { category: "Matching", headline: "Within reach", caption: "Proximity first, so coffee is realistic." },
  { category: "Chat", headline: "First contact", caption: "Conversation before commitment." },
];
