// Screenshot the drawer handle in its hover/expanded state by driving Chrome
// via the DevTools Protocol. We use Emulation.forceElementState equivalents
// through CSS.forcePseudoState on the handle's button so its :hover styles
// apply during the capture.
//
// Usage:
//   node scripts/qa-screenshot-hover.mjs <url> <output>

import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = promisify(execFile);

const [, , url, output] = process.argv;
if (!url || !output) {
  console.error("Usage: node qa-screenshot-hover.mjs <url> <output>");
  process.exit(1);
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9229;

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

  // Wait for debugging endpoint
  const start = Date.now();
  let target = null;
  while (Date.now() - start < 10_000) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const versionRes = await fetch(`http://127.0.0.1:${PORT}/json`);
        const tabs = await versionRes.json();
        target = tabs.find((t) => t.type === "page");
        if (target) break;
      }
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!target) throw new Error("Chrome debug endpoint never came up");

  // Connect WebSocket via undici/ws — but we don't have ws. Use node:WebSocket (Node 22+).
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
  await send("DOM.enable");
  await send("CSS.enable");

  // Navigate
  await send("Page.navigate", { url });
  // Wait for load
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
  // Settle
  await new Promise((r) => setTimeout(r, 800));

  // Find handle button (aria-label="Toggle widget drawer")
  const { root } = await send("DOM.getDocument", { depth: -1 });
  const { nodeId } = await send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector: 'button[aria-label="Toggle widget drawer"]',
  });
  if (!nodeId) throw new Error("Handle button not found");

  // Force :hover + :focus-visible pseudo states
  await send("CSS.forcePseudoState", {
    nodeId,
    forcedPseudoClasses: ["hover", "focus", "focus-visible"],
  });

  // Allow CSS transition (220ms width + 150ms label fade w/ 80ms delay = ~230ms) to settle.
  await new Promise((r) => setTimeout(r, 500));

  // Crop to the right edge so the handle is clearly visible at presentation size.
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 1240, y: 300, width: 200, height: 300, scale: 1 },
  });
  await writeFile(output, Buffer.from(data, "base64"));
  console.log(`[qa-screenshot-hover] wrote ${output}`);
  ws.close();
} catch (err) {
  console.error("[qa-screenshot-hover] failed:", err.message);
  process.exit(1);
} finally {
  if (chromeProc) {
    try { chromeProc.kill("SIGTERM"); } catch {}
  }
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
}
