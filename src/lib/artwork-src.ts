/**
 * Gallery images ship in two sizes:
 *   <name>.webp      long edge 1600 — the lightbox / full view
 *   <name>-sm.webp   long edge  760 — every grid tile
 *
 * Tiles render at roughly 150-600 CSS px, so serving the 1600px file to them
 * was the whole problem: the grid was pulling ~11.8 MB of 2880px JPEGs to
 * paint thumbnails. `thumbSrc` swaps in the small derivative.
 */
export function thumbSrc(image: string): string {
  return image.replace(/\.webp$/, "-sm.webp");
}
