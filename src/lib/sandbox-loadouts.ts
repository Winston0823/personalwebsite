export type LabSettings = {
  font: "original" | "editorial" | "mono";
  button: "artwork" | "soft" | "outline";
  layout: "original" | "roomy" | "compact";
  ink: Record<
    | "voidTop"
    | "voidBottom"
    | "waterTop"
    | "waterMid"
    | "waterDeep"
    | "surface"
    | "caustic"
    | "rope"
    | "splat"
    | "rareGlow",
    string
  >;
  currentStrength: number;
  ropeDamping: number;
  waveAmplitude: number;
};
export type Loadout = {
  id: string;
  name: string;
  description: string;
  settings: LabSettings;
};
export const originalSettings: LabSettings = {
  font: "original",
  button: "artwork",
  layout: "original",
  ink: {
    voidTop: "#1b0f38",
    voidBottom: "#0d0722",
    waterTop: "#3d1a6b",
    waterMid: "#2a1152",
    waterDeep: "#150a33",
    surface: "#8de8ff",
    caustic: "#a06bff",
    rope: "#fff3dc",
    splat: "#ff2d9b",
    rareGlow: "#ffd23d",
  },
  currentStrength: 260,
  ropeDamping: 0.99,
  waveAmplitude: 22,
};
export const loadouts: Loadout[] = [
  {
    id: "original",
    name: "Original ink",
    description: "The original palette, artwork, and game feel.",
    settings: originalSettings,
  },
  {
    id: "lagoon",
    name: "Quiet lagoon",
    description: "Cool water, gentler currents, and softer controls.",
    settings: {
      ...originalSettings,
      button: "soft",
      layout: "roomy",
      currentStrength: 120,
      ropeDamping: 0.98,
      waveAmplitude: 12,
      ink: {
        voidTop: "#123f47",
        voidBottom: "#092c34",
        waterTop: "#246674",
        waterMid: "#174b5e",
        waterDeep: "#0a293a",
        surface: "#b5f1e3",
        caustic: "#64bfca",
        rope: "#fff4d9",
        splat: "#e79073",
        rareGlow: "#f4d787",
      },
    },
  },
  {
    id: "afterhours",
    name: "After hours",
    description: "Near-black water, electric blue, and outlined controls.",
    settings: {
      ...originalSettings,
      font: "mono",
      button: "outline",
      layout: "compact",
      ink: {
        voidTop: "#202535",
        voidBottom: "#10131c",
        waterTop: "#313a54",
        waterMid: "#242c43",
        waterDeep: "#11182b",
        surface: "#a7caff",
        caustic: "#7183ba",
        rope: "#e8eef8",
        splat: "#d6a8db",
        rareGlow: "#e8d3a1",
      },
    },
  },
];
export function isLabSettings(value: unknown): value is LabSettings {
  if (!value || typeof value !== "object") return false;
  const item = value as LabSettings;
  return (
    ["original", "editorial", "mono"].includes(item.font) &&
    ["artwork", "soft", "outline"].includes(item.button) &&
    ["original", "roomy", "compact"].includes(item.layout) &&
    !!item.ink &&
    Object.keys(originalSettings.ink).every((key) =>
      /^#[\da-f]{6}$/i.test(item.ink[key as keyof LabSettings["ink"]]),
    ) &&
    Number.isFinite(item.currentStrength) &&
    item.currentStrength >= 0 &&
    item.currentStrength <= 500 &&
    Number.isFinite(item.ropeDamping) &&
    item.ropeDamping >= 0.95 &&
    item.ropeDamping <= 0.999 &&
    Number.isFinite(item.waveAmplitude) &&
    item.waveAmplitude >= 0 &&
    item.waveAmplitude <= 45
  );
}
export const ttoaPrototype = {
  id: "ttoa",
  name: "Fisherman’s Nose",
  repo: "https://github.com/Winston0823/TTOA",
  liveUrl: "https://ttoa-vert.vercel.app",
  description: "Steer with your nose. Open your mouth. Catch something good.",
  sourceCommit: "98018fc948434b327095edce92b933653abe1f16",
};
