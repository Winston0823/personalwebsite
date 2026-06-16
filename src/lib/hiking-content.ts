/* Shared source for the hiking widget — the compact tile and the full-screen
   water experience both read from here so photos and copy stay in sync.
   Mirrors the mobile hiking section in MobileLayout. */

export interface HikePhoto {
  src: string;
  alt: string;
  label: string;
}

export const hikingPhotos: HikePhoto[] = [
  { src: "/images/hiking/hike-1.jpeg", alt: "Crouching by a creek in the redwoods", label: "by the creek" },
  { src: "/images/hiking/hike-2.jpeg", alt: "Stepping across a forest stream bed", label: "creek crossing" },
  { src: "/images/hiking/hike-3.jpeg", alt: "Dappled light through a wooden pergola walkway", label: "dappled light" },
];

export const hikingBlurb =
  "Lately I’ve been hiking around the Bay most weekends — drawn to the quiet " +
  "stretches near creeks, getting close to the water and skipping stones across the current.";

export const hikingEyebrow = "Off the grid";
