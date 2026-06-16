/**
 * Ambient declarations for the handwriting libraries used by NameWidget.
 *
 * - `vara` ships no types (its package `main` is a minified bundle), so we
 *   declare the slice of the API the widget actually drives.
 * - `hanzi-writer-data/*.json` are per-character stroke files we bundle
 *   locally (instead of hitting the default CDN at runtime); typing them as
 *   hanzi-writer's `CharacterJson` lets the loader stay fully typed.
 */

declare module "vara" {
  interface VaraText {
    text: string;
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    id?: string | number;
    duration?: number;
    textAlign?: "left" | "center" | "right";
    autoAnimation?: boolean;
    queued?: boolean;
    letterSpacing?: number;
    x?: number;
    y?: number;
    delay?: number;
  }

  interface VaraOptions {
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: "left" | "center" | "right";
    autoAnimation?: boolean;
    queued?: boolean;
    letterSpacing?: number;
  }

  export default class Vara {
    constructor(
      element: string,
      fontSource: string,
      text: VaraText[],
      options?: VaraOptions,
    );
    ready(cb: () => void): void;
    animationEnd(cb: (index: number, obj: unknown) => void): void;
    draw(id: number): void;
    playAll(): void;
  }
}

declare module "hanzi-writer-data/*.json" {
  const data: import("hanzi-writer").CharacterJson;
  export default data;
}
