// Lightweight Chrome headless screenshot driver.
// Used by QA to capture before/after of the drawer handle without needing
// puppeteer/playwright as a dep.
//
// Usage:
//   node scripts/qa-screenshot.mjs <url> <output-path>

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);

const [, , url, output] = process.argv;
if (!url || !output) {
  console.error("Usage: node qa-screenshot.mjs <url> <output>");
  process.exit(1);
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

let tmpDir;
try {
  tmpDir = await mkdtemp(join(tmpdir(), "qa-chrome-"));
  await run(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-sandbox",
    `--user-data-dir=${tmpDir}`,
    "--window-size=1440,900",
    `--screenshot=${output}`,
    "--virtual-time-budget=2500",
    url,
  ], { timeout: 30_000 });
  console.log(`[qa-screenshot] wrote ${output}`);
} catch (err) {
  console.error("[qa-screenshot] failed:", err.message);
  process.exit(1);
} finally {
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
}
