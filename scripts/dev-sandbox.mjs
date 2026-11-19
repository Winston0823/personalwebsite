import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
// Read Next's env files, but let each app load its own environment. In
// particular, never pass the portfolio's private owner key into the prototype.
const childEnv = { ...process.env };
const { combinedEnv } = require("@next/env").loadEnvConfig(root, true);
const prototypeRoot = path.resolve(root, combinedEnv.TTOA_DIR || "../TTOA");
const configuredPreview = combinedEnv.NEXT_PUBLIC_TTOA_PREVIEW_URL;
const preview =
  configuredPreview ||
  (existsSync(path.join(prototypeRoot, "package.json"))
    ? "http://localhost:3001"
    : "");
const children = [];
let stopping = false;

function listening(port, host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1000);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
  });
}
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  await Promise.all(
    children
      .filter((child) => child.exitCode === null)
      .map((child) => {
        if (process.platform !== "win32") {
          child.kill("SIGTERM");
          return;
        }
        // next dev forks its server. Stop only the process trees this launcher owns.
        return new Promise((resolve) => {
          const task = spawn(
            "taskkill",
            ["/PID", String(child.pid), "/T", "/F"],
            { windowsHide: true, stdio: "ignore" },
          );
          task.once("close", resolve);
          task.once("error", resolve);
        });
      }),
  );
  process.exit(code);
}
function launch(directory, args, env = childEnv) {
  const localRequire = createRequire(path.join(directory, "package.json"));
  const next = localRequire.resolve("next/dist/bin/next");
  const child = spawn(process.execPath, [next, "dev", ...args], {
    cwd: directory,
    env,
    stdio: "inherit",
    windowsHide: true,
  });
  children.push(child);
  child.once("error", (error) => {
    console.error(error.message);
    void shutdown(1);
  });
  child.once("exit", (code) => {
    if (!stopping) void shutdown(code ?? 1);
  });
}
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

try {
  if (preview) {
    const url = new URL(preview);
    if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
      if (port === 3000)
        throw new Error(
          "TTOA and the portfolio need separate ports. Use http://localhost:3001 for TTOA.",
        );
      if (await listening(port, url.hostname.replace(/[\[\]]/g, ""))) {
        console.log(`Using the running prototype at ${url.origin}`);
      } else {
        if (
          !existsSync(
            path.join(prototypeRoot, "node_modules/next/dist/bin/next"),
          )
        )
          throw new Error(
            `TTOA isn't installed at ${prototypeRoot}. Follow docs/ttoa-integration.md, or set TTOA_DIR to its checkout.`,
          );
        console.log(`Starting TTOA at ${url.origin}`);
        launch(prototypeRoot, ["-p", String(port)]);
      }
    }
  }
  console.log("Starting the portfolio at http://localhost:3000/sandbox");
  launch(root, ["-p", "3000", ...process.argv.slice(2)], {
    ...childEnv,
    ...(preview ? { NEXT_PUBLIC_TTOA_PREVIEW_URL: preview } : {}),
  });
} catch (error) {
  console.error(error.message);
  await shutdown(1);
}
