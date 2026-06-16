/**
 * Locally-bundled stroke data for the three characters in 顾文俊.
 *
 * hanzi-writer fetches character JSON from a jsDelivr CDN by default. We bundle
 * just these three files instead so the name widget has no runtime network
 * dependency and works offline — the data rides along in the lazy chunk that
 * imports this module.
 */
import type { CharacterJson, CharDataLoaderFn } from "hanzi-writer";
import gu from "hanzi-writer-data/顾.json";
import wen from "hanzi-writer-data/文.json";
import jun from "hanzi-writer-data/俊.json";

/** Characters in stroke order, surname first: 顾 文 俊. */
export const HANZI = ["顾", "文", "俊"] as const;

const DATA: Record<string, CharacterJson> = {
  顾: gu,
  文: wen,
  俊: jun,
};

/** Synchronous loader — the data is already in memory, no fetch needed. */
export const hanziLoader: CharDataLoaderFn = (char) => DATA[char];
