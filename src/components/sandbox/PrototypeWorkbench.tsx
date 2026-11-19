"use client";

import { useEffect, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  SlidersHorizontal,
  SquaresFour,
  ArrowSquareOut,
  ArrowCounterClockwise,
  DeviceMobile,
  Laptop,
  Check,
  DownloadSimple,
} from "@phosphor-icons/react";
import StickyNotes from "./StickyNotes";
import SquiggleOutline from "@/components/studio/SquiggleOutline";
import StudioNav from "@/components/studio/StudioNav";
import {
  isLabSettings,
  loadouts,
  originalSettings,
  ttoaPrototype,
  type LabSettings,
  type Loadout,
} from "@/lib/sandbox-loadouts";

const STORE = "winston:sandbox:ttoa:loadouts:v1";
type BridgeState = "connecting" | "ready" | "preview" | "error";
export default function PrototypeWorkbench({
  previewUrl,
}: {
  previewUrl: string;
}) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [stylesOpen, setStylesOpen] = useState(true);
  useEffect(() => {
    const narrow = matchMedia("(max-width: 999px)");
    const resize = () => {
      if (narrow.matches) {
        setProjectsOpen(false);
        setStylesOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectsOpen(false);
        setStylesOpen(false);
      }
    };
    resize();
    narrow.addEventListener("change", resize);
    window.addEventListener("keydown", escape);
    return () => {
      narrow.removeEventListener("change", resize);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const [device, setDevice] = useState<"phone" | "laptop">("phone");
  const [input, setInput] = useState<"touch" | "camera">("touch");
  const [settings, setSettings] = useState<LabSettings>(originalSettings);
  const [preset, setPreset] = useState("original");
  const [saved, setSaved] = useState<Loadout[]>([]);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [restart, setRestart] = useState(0);
  const [status, setStatus] = useState<BridgeState>("connecting");
  const [frameUrl, setFrameUrl] = useState("");
  const [scale, setScale] = useState(0.65);
  const [runState, setRunState] = useState<{ phase: string; timeLeft: number }>(
    { phase: "title", timeLeft: 30 },
  );
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const lastAck = useRef(0);
  const origin = new URL(previewUrl).origin;
  const allLoadouts = [...loadouts, ...saved];

  useEffect(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem(STORE) || "[]");
      if (Array.isArray(data))
        setSaved(
          data.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              isLabSettings(item.settings),
          ),
        );
    } catch {
      setNotice("Saved loadouts couldn’t be read in this browser.");
    }
  }, []);
  useEffect(() => {
    const url = new URL(previewUrl);
    url.searchParams.set("sandbox", "1");
    url.searchParams.set("parentOrigin", location.origin);
    url.searchParams.set("sandboxInput", input);
    setStatus("connecting");
    setRunState({ phase: "title", timeLeft: 30 });
    setFrameUrl(url.href);
  }, [previewUrl, input, restart]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setScale(
        Math.min(
          (width - 32) / (device === "phone" ? 414 : 1304),
          (height - 40) / (device === "phone" ? 868 : 836),
          1,
        ),
      );
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [device]);
  useEffect(() => {
    if (!frameUrl) return;
    const hello = () =>
      frameRef.current?.contentWindow?.postMessage(
        { type: "winston:hello", version: 1 },
        origin,
      );
    let interval: ReturnType<typeof setInterval>;
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== origin ||
        event.source !== frameRef.current?.contentWindow ||
        !event.data ||
        event.data.version !== 1
      )
        return;
      if (
        event.data.type === "winston:ready" &&
        event.data.prototype === "ttoa"
      ) {
        setStatus("ready");
        clearInterval(interval);
      }
      if (
        event.data.type === "winston:state" &&
        ["title", "playing", "result"].includes(event.data.phase) &&
        Number.isFinite(event.data.timeLeft)
      )
        setRunState({ phase: event.data.phase, timeLeft: event.data.timeLeft });
      if (
        event.data.type === "winston:applied" &&
        Number.isInteger(event.data.requestId)
      )
        lastAck.current = event.data.requestId;
    };
    window.addEventListener("message", receive);
    interval = setInterval(hello, 1000);
    hello();
    const timeout = setTimeout(
      () => setStatus((current) => (current === "ready" ? current : "preview")),
      12000,
    );
    return () => {
      window.removeEventListener("message", receive);
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [frameUrl, origin]);
  useEffect(() => {
    if (status !== "ready") return;
    const id = ++requestId.current;
    frameRef.current?.contentWindow?.postMessage(
      { type: "winston:apply", version: 1, requestId: id, settings },
      origin,
    );
    const timeout = setTimeout(() => {
      if (lastAck.current < id)
        setNotice(
          "The prototype hasn’t confirmed this change. Try reconnecting the preview.",
        );
    }, 3000);
    return () => clearTimeout(timeout);
  }, [settings, status, origin]);

  function change(patch: Partial<LabSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
    setPreset("custom");
    setNotice("");
  }
  function choose(id: string) {
    const item = allLoadouts.find((item) => item.id === id);
    if (item) {
      setSettings(structuredClone(item.settings));
      setPreset(id);
      setNotice("");
    }
  }
  function save() {
    if (!name.trim()) {
      setNotice("Give this loadout a name first.");
      return;
    }
    const item = {
      id: `saved-${crypto.randomUUID()}`,
      name: name.trim().slice(0, 60),
      description: "Saved in this browser",
      settings: structuredClone(settings),
    };
    const next = [...saved, item];
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
      setSaved(next);
      setPreset(item.id);
      setName("");
      setNotice("Loadout saved in this browser.");
    } catch {
      setNotice(
        "This loadout couldn’t be saved. Browser storage may be full or disabled.",
      );
    }
  }
  function exportSettings() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            prototype: "ttoa",
            version: 1,
            sourceCommit: ttoaPrototype.sourceCommit,
            settings,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ttoa-loadout.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const locked = status !== "ready";
  const paletteFields: { key: keyof LabSettings["ink"]; label: string }[] = [
    { key: "waterTop", label: "Shallow water" },
    { key: "waterMid", label: "Water" },
    { key: "waterDeep", label: "Deep water" },
    { key: "voidTop", label: "Sky" },
    { key: "voidBottom", label: "Backdrop" },
    { key: "surface", label: "Surface + UI" },
    { key: "splat", label: "Accent" },
    { key: "rope", label: "Rope" },
    { key: "caustic", label: "Caustics" },
    { key: "rareGlow", label: "Rare glow" },
  ];
  return (
    <div className="studio lab-page">
      <a className="skip-link" href="#playground">
        Skip to playground
      </a>
      <StudioNav page="sandbox" />
      <main className="lab-main" id="playground">
        <div
          className={`lab-layout ${projectsOpen ? "projects-open" : ""} ${stylesOpen ? "styles-open" : ""}`}
        >
          <aside
            id="project-drawer"
            className="project-drawer"
            aria-label="Projects"
            inert={!projectsOpen}
          >
            <SquiggleOutline variant="drawer" />
            <div className="drawer-inner">
              <div className="drawer-heading">
                <div>
                  <span className="library-kicker">A PLACE TO TRY THINGS</span>
                  <h2>Projects</h2>
                </div>
                <button
                  className="lab-icon-button"
                  aria-label="Close projects"
                  onClick={() => setProjectsOpen(false)}
                >
                  <CaretLeft size={18} />
                </button>
              </div>
              <button
                className="project-choice"
                aria-current="page"
                onClick={() => {
                  if (innerWidth < 1000) setProjectsOpen(false);
                }}
              >
                <img src="/images/sandbox/ttoa.webp" alt="" />
                <span>
                  <strong>Fisherman’s Nose</strong>
                  <small>A little nose-powered fishing.</small>
                </span>
                <span className="project-choice-index">01</span>
              </button>
              <p className="drawer-footnote">
                A collection of things in progress.
                <br />
                Pick one. Make it feel different.
              </p>
            </div>
          </aside>
          <button
            className="drawer-tab projects-tab"
            aria-label={projectsOpen ? "Hide projects" : "Show projects"}
            aria-expanded={projectsOpen}
            aria-controls="project-drawer"
            onClick={() => {
              setProjectsOpen(!projectsOpen);
              if (innerWidth < 1000) setStylesOpen(false);
            }}
          >
            <SquiggleOutline variant="drawer" />
            <SquaresFour size={17} />
            <span>Projects</span>
            {projectsOpen ? <CaretLeft size={12} /> : <CaretRight size={12} />}
          </button>
          <section
            className="preview-panel"
            aria-label="Interactive prototype preview"
          >
            <div className="lab-heading">
              <div>
                <span className="library-kicker">THE SANDBOX</span>
                <h1>
                  Fisherman’s Nose
                  <span className="work-cursor" aria-hidden="true">
                    |
                  </span>
                </h1>
              </div>
              <div className="lab-heading-actions">
                <div
                  className="device-tabs"
                  role="group"
                  aria-label="Device preview"
                >
                  <button
                    onClick={() => setDevice("phone")}
                    aria-label="Phone"
                    title="Phone"
                    aria-pressed={device === "phone"}
                  >
                    <DeviceMobile
                      size={20}
                      weight={device === "phone" ? "fill" : "regular"}
                    />
                  </button>
                  <button
                    onClick={() => setDevice("laptop")}
                    aria-label="Laptop"
                    title="Laptop"
                    aria-pressed={device === "laptop"}
                  >
                    <Laptop
                      size={21}
                      weight={device === "laptop" ? "fill" : "regular"}
                    />
                  </button>
                </div>
                <div
                  className="preview-toolbar"
                  role="group"
                  aria-label="Prototype actions"
                >
                  <button
                    className="lab-icon-button"
                    aria-label="Restart prototype"
                    title="Restart prototype"
                    onClick={() => setRestart((value) => value + 1)}
                  >
                    <ArrowCounterClockwise size={18} />
                  </button>
                  <a
                    className="lab-source"
                    aria-label="Open prototype in a new tab"
                    title="Open prototype in a new tab"
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArrowSquareOut size={20} />
                  </a>
                </div>
              </div>
            </div>
            <div className="device-stage" ref={stageRef}>
              <div
                className="scaled-device"
                style={{
                  width:
                    (device === "phone" ? 414 : 1304) * Math.max(0.1, scale),
                  height:
                    (device === "phone" ? 868 : 836) * Math.max(0.1, scale),
                }}
              >
                <div
                  className={`device-hardware device-${device}`}
                  style={{ transform: `scale(${Math.max(0.1, scale)})` }}
                >
                  {device === "phone" && (
                    <span className="device-island" aria-hidden="true" />
                  )}
                  {frameUrl && (
                    <iframe
                      key={`${restart}-${frameUrl}`}
                      ref={frameRef}
                      src={frameUrl}
                      title="Fisherman’s Nose interactive prototype"
                      width={device === "phone" ? 390 : 1280}
                      height={device === "phone" ? 844 : 800}
                      allow="camera; autoplay; fullscreen; web-share"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-modals"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() =>
                        frameRef.current?.contentWindow?.postMessage(
                          { type: "winston:hello", version: 1 },
                          origin,
                        )
                      }
                      onError={() => setStatus("error")}
                    />
                  )}
                </div>
              </div>
              <StickyNotes project="ttoa" context={{ device, settings }} />
            </div>
            {(status === "preview" || status === "error") && (
              <div className="bridge-note">
                The app can be played as-is. Live editing needs the sandbox
                adapter running on the preview build.
                <button onClick={() => setRestart((value) => value + 1)}>
                  Reconnect
                </button>
              </div>
            )}
          </section>
          <button
            className="drawer-tab styles-tab"
            aria-label={stylesOpen ? "Hide style editor" : "Show style editor"}
            aria-expanded={stylesOpen}
            aria-controls="style-drawer"
            onClick={() => {
              setStylesOpen(!stylesOpen);
              if (innerWidth < 1000) setProjectsOpen(false);
            }}
          >
            <SquiggleOutline variant="drawer" />
            <SlidersHorizontal size={17} />
            <span>Style & feel</span>
            {stylesOpen ? <CaretRight size={12} /> : <CaretLeft size={12} />}
          </button>
          <aside
            id="style-drawer"
            className="style-editor"
            aria-labelledby="editor-title"
            inert={!stylesOpen}
          >
            <SquiggleOutline variant="drawer" />
            <div className="drawer-inner">
              <div className="editor-heading">
                <div>
                  <span className="library-kicker">MAKE A LITTLE CHANGE</span>
                  <h2 id="editor-title">Style & feel</h2>
                </div>
                <button
                  className="lab-icon-button"
                  aria-label="Close style editor"
                  onClick={() => setStylesOpen(false)}
                >
                  <CaretRight size={18} />
                </button>
                <button
                  className="lab-icon-button"
                  aria-label="Reset to original loadout"
                  disabled={locked}
                  onClick={() => choose("original")}
                >
                  <ArrowCounterClockwise size={17} />
                </button>
              </div>
              <label className="editor-field">
                Starting loadout
                <select
                  value={preset}
                  disabled={locked}
                  onChange={(event) => choose(event.target.value)}
                >
                  {allLoadouts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                  {preset === "custom" && (
                    <option value="custom">Custom changes</option>
                  )}
                </select>
              </label>
              <p className="loadout-description">
                {allLoadouts.find((item) => item.id === preset)?.description ||
                  "Your own combination. Keep playing while you tune."}
              </p>
              <fieldset disabled={locked}>
                <legend>Typography</legend>
                <label className="editor-field">
                  Interface font
                  <select
                    value={settings.font}
                    onChange={(event) =>
                      change({
                        font: event.target.value as LabSettings["font"],
                      })
                    }
                  >
                    <option value="original">Original rounded</option>
                    <option value="editorial">Editorial serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </label>
                <p className="editor-hint">
                  Changes interface text. Lettering baked into artwork stays
                  original.
                </p>
              </fieldset>
              <fieldset disabled={locked}>
                <legend>Color palette</legend>
                <div className="palette-editor">
                  {paletteFields.map((field) => (
                    <label key={field.key}>
                      <input
                        type="color"
                        aria-label={field.label}
                        value={settings.ink[field.key]}
                        onChange={(event) =>
                          change({
                            ink: {
                              ...settings.ink,
                              [field.key]: event.target.value,
                            },
                          })
                        }
                      />
                      <span>{field.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset disabled={locked}>
                <legend>Components & layout</legend>
                <label className="editor-field">
                  Start button
                  <select
                    value={settings.button}
                    onChange={(event) =>
                      change({
                        button: event.target.value as LabSettings["button"],
                      })
                    }
                  >
                    <option value="artwork">Original artwork</option>
                    <option value="soft">Soft fill</option>
                    <option value="outline">Outline</option>
                  </select>
                </label>
                <label className="editor-field">
                  Screen spacing
                  <select
                    value={settings.layout}
                    onChange={(event) =>
                      change({
                        layout: event.target.value as LabSettings["layout"],
                      })
                    }
                  >
                    <option value="original">Original</option>
                    <option value="roomy">Roomy</option>
                    <option value="compact">Compact</option>
                  </select>
                </label>
              </fieldset>
              <fieldset disabled={locked}>
                <legend>Game feel</legend>
                <label className="editor-slider">
                  Current strength<output>{settings.currentStrength}</output>
                  <input
                    aria-label="Current strength"
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={settings.currentStrength}
                    onChange={(event) =>
                      change({ currentStrength: Number(event.target.value) })
                    }
                  />
                </label>
                <label className="editor-slider">
                  Rope momentum
                  <output>{settings.ropeDamping.toFixed(3)}</output>
                  <input
                    aria-label="Rope momentum"
                    type="range"
                    min="0.95"
                    max="0.999"
                    step="0.001"
                    value={settings.ropeDamping}
                    onChange={(event) =>
                      change({ ropeDamping: Number(event.target.value) })
                    }
                  />
                </label>
                <label className="editor-slider">
                  Wave height<output>{settings.waveAmplitude}</output>
                  <input
                    aria-label="Wave height"
                    type="range"
                    min="0"
                    max="45"
                    step="1"
                    value={settings.waveAmplitude}
                    onChange={(event) =>
                      change({ waveAmplitude: Number(event.target.value) })
                    }
                  />
                </label>
              </fieldset>
              <fieldset>
                <legend>Test setup</legend>
                <label className="editor-field">
                  Controls
                  <select
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value as "touch" | "camera")
                    }
                  >
                    <option value="touch">Drag / touch</option>
                    <option value="camera">Camera / face tracking</option>
                  </select>
                </label>
                <p className="editor-hint">
                  {input === "camera"
                    ? "Press Start fishing inside the simulator to request camera access. If no prompt appears, use the Prototype link to check browser permissions outside the simulator."
                    : "Drag mode never requests camera access. Choose Camera / face tracking to test with your webcam."}
                </p>
                {input === "touch" && (
                  <button
                    className="lab-test-run"
                    disabled={
                      locked || input !== "touch" || runState.phase !== "title"
                    }
                    onClick={() =>
                      frameRef.current?.contentWindow?.postMessage(
                        {
                          type: "winston:action",
                          version: 1,
                          action: "start-touch",
                        },
                        origin,
                      )
                    }
                  >
                    {runState.phase === "playing"
                      ? `Playing · ${runState.timeLeft}s`
                      : runState.phase === "result"
                        ? "Run finished · restart to play"
                        : "Start touch run"}
                  </button>
                )}
              </fieldset>
              <div className="save-loadout">
                <label className="editor-field" htmlFor="loadout-name">
                  Keep this combination
                  <input
                    id="loadout-name"
                    maxLength={60}
                    value={name}
                    placeholder="Name your loadout"
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <button className="lab-save" disabled={locked} onClick={save}>
                  <Check size={16} />
                  Save loadout
                </button>
                <button
                  className="lab-export"
                  disabled={locked}
                  onClick={exportSettings}
                >
                  <DownloadSimple size={15} />
                  Export settings
                </button>
                <p className="editor-hint">
                  Saved loadouts stay in this browser. Export to keep a portable
                  copy.
                </p>
              </div>
              {notice && (
                <p className="editor-notice" role="status">
                  {notice}
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
