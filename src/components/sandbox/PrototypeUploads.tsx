"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowUpRight, UploadSimple, X } from "@phosphor-icons/react";

type Prototype = {
  id: string;
  name: string;
  html: string;
  addedAt: number;
  archived?: boolean;
};
const DB_NAME = "winston-prototypes";

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("prototypes", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPrototypes(): Promise<Prototype[]> {
  const db = await openDatabase();
  try {
    return await new Promise<Prototype[]>((resolve, reject) => {
      const request = db
        .transaction("prototypes")
        .objectStore("prototypes")
        .getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function savePrototype(prototype: Prototype): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("prototypes", "readwrite");
      transaction.objectStore("prototypes").put(prototype);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export default function PrototypeUploads() {
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [active, setActive] = useState<Prototype | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    readPrototypes()
      .then((items) => {
        if (!cancelled)
          setPrototypes(items.sort((a, b) => b.addedAt - a.addedAt));
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Browser storage is unavailable. Enable site storage to save prototypes here.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    previewRef.current?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    previewRef.current?.focus({ preventScroll: true });
  }, [active]);

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!/\.html?$/i.test(file.name)) {
      setError("Choose a single-file HTML prototype (.html or .htm).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an HTML file smaller than 10 MB.");
      return;
    }
    setSaving(true);
    try {
      const prototype = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.html?$/i, ""),
        html: await file.text(),
        addedAt: Date.now(),
      };
      await savePrototype(prototype);
      setPrototypes((items) => [prototype, ...items]);
      setActive(prototype);
    } catch {
      setError(
        "This prototype couldn’t be saved. Check available browser storage and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function setArchived(prototype: Prototype, archived: boolean) {
    setUpdating(true);
    setError("");
    try {
      const updated = { ...prototype, archived };
      await savePrototype(updated);
      setPrototypes((items) =>
        items.map((item) => (item.id === prototype.id ? updated : item)),
      );
      if (active?.id === prototype.id) setActive(null);
    } catch {
      setError("This change couldn’t be saved. Try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="prototype-library">
      <div className="prototype-import">
        <div>
          <h3>Bring something to play with.</h3>
          <p>Import a single-file HTML prototype and interact with it here.</p>
          <span>
            Saved in this browser · HTML up to 10 MB · Bundle assets into the
            file
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm,text/html"
          onChange={importFile}
          aria-label="Choose an HTML prototype"
          hidden
        />
        <button
          className="prototype-upload"
          disabled={saving || loading}
          onClick={() => {
            opener.current = null;
            fileRef.current?.click();
          }}
        >
          <UploadSimple size={18} />
          {saving ? "Importing…" : "Import prototype"}
        </button>
      </div>
      {error && (
        <p className="prototype-error" role="alert">
          {error}
        </p>
      )}
      {prototypes.some((prototype) => !prototype.archived) && (
        <div className="prototype-list" aria-label="Your imported prototypes">
          {prototypes
            .filter((prototype) => !prototype.archived)
            .map((prototype) => (
              <div className="prototype-entry" key={prototype.id}>
                <button
                  aria-pressed={active?.id === prototype.id}
                  onClick={(event) => {
                    opener.current = event.currentTarget;
                    setActive(prototype);
                  }}
                >
                  <span>{prototype.name}</span>
                  <span>
                    Play prototype <ArrowUpRight size={17} />
                  </span>
                </button>
                <button
                  className="prototype-archive"
                  disabled={updating}
                  aria-label={`Archive ${prototype.name}`}
                  onClick={() => setArchived(prototype, true)}
                >
                  Archive
                </button>
              </div>
            ))}
        </div>
      )}
      {prototypes.some((prototype) => prototype.archived) && (
        <details className="prototype-archives">
          <summary>Archived prototypes</summary>
          {prototypes
            .filter((prototype) => prototype.archived)
            .map((prototype) => (
              <div key={prototype.id}>
                <span>{prototype.name}</span>
                <button
                  disabled={updating}
                  onClick={() => setArchived(prototype, false)}
                >
                  Restore
                </button>
              </div>
            ))}
        </details>
      )}
      {active && (
        <div
          className="prototype-preview"
          ref={previewRef}
          tabIndex={-1}
          role="region"
          aria-label={`${active.name} interactive preview`}
        >
          <div className="prototype-preview-bar">
            <span>{active.name}</span>
            <button
              aria-label="Close prototype preview"
              onClick={() => {
                setActive(null);
                opener.current?.focus();
              }}
            >
              <X size={18} /> Close preview
            </button>
          </div>
          <iframe
            key={active.id}
            title={`${active.name} playable prototype`}
            srcDoc={active.html}
            sandbox="allow-scripts allow-pointer-lock"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
