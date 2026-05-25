// Screenshot the drawer in its open state by clicking the handle via CDP.
//
// Usage:
//   node scripts/qa-screenshot-open.mjs <url> <output>

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , url, output] = process.argv;
if (!url || !output) {
  console.error("Usage: node qa-screenshot-open.mjs <url> <output>");
  process.exit(1);
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9230;

let tmpDir;
let chromeProc;
try {
  tmpDir = await mkdtemp(join(tmpdir(), "qa-chrome-"));
  chromeProc = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-sandbox",
    `--user-data-dir=${tmpDir}`,
    "--window-size=1440,900",
    "--force-device-scale-factor=2",
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ], { stdio: "ignore", detached: false });

  let target = null;
  const start = Date.now();
  while (Date.now() - start < 10_000) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      if (res.ok) {
        const tabs = await res.json();
        target = tabs.find((t) => t.type === "page");
        if (target) break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!target) throw new Error("Chrome debug endpoint never came up");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const reqId = ++id;
      pending.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url });
  await new Promise((resolve) => {
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === "Page.loadEventFired") {
        ws.removeEventListener("message", onMsg);
        resolve();
      }
    };
    ws.addEventListener("message", onMsg);
  });
  await new Promise((r) => setTimeout(r, 800));

  // Click the handle via JS
  await send("Runtime.evaluate", {
    expression: `document.querySelector('button[aria-label="Toggle widget drawer"]').click()`,
  });
  // Wait for drawer spring animation
  await new Promise((r) => setTimeout(r, 900));

  // Force hover/focus so we can see the chevron-flipped state
  const { result: nodeIdResult } = await send("Runtime.evaluate", {
    expression: `document.querySelector('button[aria-label="Toggle widget drawer"]').getAttribute('aria-expanded')`,
    returnByValue: true,
  });
  console.log("[qa-screenshot-open] aria-expanded:", nodeIdResult.value);

  // Capture the right half of the viewport so we see drawer + handle
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 900, y: 0, width: 540, height: 900, scale: 1 },
  });
  await writeFile(output, Buffer.from(data, "base64"));
  console.log(`[qa-screenshot-open] wrote ${output}`);
  ws.close();
} catch (err) {
  console.error("[qa-screenshot-open] failed:", err.message);
  process.exit(1);
} finally {
  if (chromeProc) {
    try { chromeProc.kill("SIGTERM"); } catch {}
  }
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
}
