#!/usr/bin/env node
// One-time script: hits the iTunes Search API for each seed track and writes
// src/lib/playlist.ts with album-art URLs baked in. Re-run if the seed changes.
//
//   node scripts/fetch-album-art.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SEED = [
  { title: "End of Beginning", artist: "Djo", album: "DECIDE" },
  { title: "blue", artist: "yung kai", album: "blue" },
  { title: "Cruel Summer", artist: "Taylor Swift", album: "Lover" },
  { title: "Photograph", artist: "Ed Sheeran", album: "x" },
  { title: "Viva La Vida", artist: "Coldplay", album: "Viva La Vida or Death and All His Friends" },
  { title: "Stitches", artist: "Shawn Mendes", album: "Handwritten" },
  { title: "Treat You Better", artist: "Shawn Mendes", album: "Illuminate" },
  { title: "Attention", artist: "Charlie Puth", album: "Voicenotes" },
  { title: "Careless Whisper", artist: "George Michael", album: "Ladies & Gentlemen" },
  { title: "Stereo Hearts", artist: "Gym Class Heroes", album: "The Papercut Chronicles II" },
  { title: "I Want It That Way", artist: "Backstreet Boys", album: "Millennium" },
  { title: "Night Changes", artist: "One Direction", album: "FOUR" },
  { title: "Yellow", artist: "Coldplay", album: "Parachutes" },
  { title: "Mary On A Cross", artist: "Ghost", album: "Seven Inches of Satanic Panic" },
  { title: "Demons", artist: "Imagine Dragons", album: "Night Visions" },
  { title: "Love The Way You Lie", artist: "Eminem", album: "Recovery" },
  { title: "Soft Spot", artist: "keshi", album: "Requiem" },
  { title: "One Last Time", artist: "Ariana Grande", album: "My Everything" },
  { title: "golden hour", artist: "JVKE", album: "this is what feels like" },
  { title: "Until I Found You", artist: "Stephen Sanchez", album: "Angel Face" },
  { title: "back to friends", artist: "sombr", album: "I Barely Know Her" },
  { title: "We Don't Talk Anymore", artist: "Charlie Puth", album: "Nine Track Mind" },
  { title: "Heather", artist: "Conan Gray", album: "Kid Krow" },
  { title: "Glimpse of Us", artist: "Joji", album: "SMITHEREENS" },
  { title: "Somewhere Only We Know", artist: "Keane", album: "Hopes And Fears" },
  { title: "Atlantis", artist: "Seafret", album: "Tell Me It's Real" },
  { title: "2 soon", artist: "keshi", album: "2 soon" },
  { title: "WANTCHU", artist: "keshi", album: "WANTCHU" },
  { title: "drunk text", artist: "Henry Moodie", album: "in all of my lonely nights" },
  { title: "War", artist: "keshi", album: "Requiem" },
  { title: "I Think They Call This Love", artist: "Elliot James Reay", album: "I Think They Call This Love" },
  { title: "Spring Snow", artist: "10CM", album: "Lovely Runner Pt. 8" },
  { title: "Everytime", artist: "Chen", album: "Descendants Of The Sun Pt.2" },
  { title: "Bodies", artist: "keshi", album: "Requiem" },
  { title: "intentions", artist: "starfall", album: "alone tonight" },
  { title: "Cry", artist: "Cigarettes After Sex", album: "Cry" },
  { title: "Vodka Cranberry", artist: "Conan Gray", album: "Wishbone" },
  { title: "I Love You So", artist: "The Walters", album: "I Love You So" },
  { title: "Memories", artist: "Conan Gray", album: "Superache" },
  { title: "The Exit", artist: "Conan Gray", album: "Superache" },
  { title: "Maniac", artist: "Conan Gray", album: "Kid Krow" },
  { title: "Those Eyes", artist: "New West", album: "Based On A True Story" },
  { title: "That Should Be Me", artist: "Justin Bieber", album: "My World 2.0" },
  { title: "Beauty And A Beat", artist: "Justin Bieber", album: "Believe" },
  { title: "Love Yourself", artist: "Justin Bieber", album: "Purpose" },
  { title: "Eenie Meenie", artist: "Sean Kingston", album: "Eenie Meenie EP" },
  { title: "Good Luck, Babe!", artist: "Chappell Roan", album: "Good Luck, Babe!" },
  { title: "Lonely", artist: "Justin Bieber", album: "Justice" },
  { title: "Actor", artist: "Conan Gray", album: "Wishbone" },
  { title: "YUKON", artist: "Justin Bieber", album: "SWAG II" },
];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function lookup({ title, artist }) {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "personal-website/1.0" } });
  if (!res.ok) throw new Error(`iTunes ${res.status} for ${title}`);
  const json = await res.json();
  const hit = json.results?.[0];
  if (!hit) return null;
  // Upgrade 100x100 → 600x600 for high-DPI displays.
  const art = (hit.artworkUrl100 || "").replace(/\/\d+x\d+bb\.jpg$/, "/600x600bb.jpg");
  return {
    albumArt: art,
    resolvedTitle: hit.trackName,
    resolvedArtist: hit.artistName,
    resolvedAlbum: hit.collectionName,
  };
}

async function main() {
  const enriched = [];
  for (let i = 0; i < SEED.length; i++) {
    const seed = SEED[i];
    process.stdout.write(`[${String(i + 1).padStart(2, "0")}/${SEED.length}] ${seed.title} — ${seed.artist} … `);
    let result = null;
    try {
      result = await lookup(seed);
    } catch (err) {
      console.log(`ERROR (${err.message})`);
    }
    if (result?.albumArt) {
      console.log("ok");
    } else {
      console.log("no match");
    }
    enriched.push({
      id: `track-${String(i + 1).padStart(2, "0")}-${slugify(seed.title)}`,
      title: seed.title,
      artist: seed.artist,
      album: seed.album,
      albumArt: result?.albumArt || "",
    });
    // Be polite to iTunes — small delay between calls.
    await new Promise((r) => setTimeout(r, 120));
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outPath = path.resolve(__dirname, "../src/lib/playlist.ts");
  const body = `// AUTO-GENERATED by scripts/fetch-album-art.mjs — do not edit by hand.
// Re-run \`node scripts/fetch-album-art.mjs\` to refresh.

import type { Track } from "./detail-types";

export const playlist: Track[] = ${JSON.stringify(enriched, null, 2)};
`;
  await writeFile(outPath, body, "utf8");
  const missing = enriched.filter((t) => !t.albumArt).length;
  console.log(`\nWrote ${outPath}`);
  console.log(`${enriched.length} tracks, ${missing} missing artwork`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
