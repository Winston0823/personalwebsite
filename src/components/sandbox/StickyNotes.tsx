"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Check, DotsSix, Key, Minus, Trash, X } from "@phosphor-icons/react";
import type { PublicNote } from "@/lib/sandbox-notes";
import PeelingPaper from "./PeelingPaper";

type Point = { x: number; y: number };
type Grab = {
  start: Point;
  current: Point;
  lifted: boolean;
  grip: number;
  width: number;
};
type MovingNote = {
  id: string;
  start: Point;
  original: Point;
  next: Point;
  width: number;
  height: number;
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ENDPOINT = "/api/sandbox/notes";

export default function StickyNotes({
  project,
  context,
}: {
  project: string;
  context: unknown;
}) {
  const layer = useRef<HTMLDivElement>(null);
  const grabRef = useRef<Grab | null>(null);
  const didDrag = useRef(false);
  const movingRef = useRef<MovingNote | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Point | null>(null);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [owner, setOwner] = useState(false);
  const [ownerForm, setOwnerForm] = useState(false);
  const [key, setKey] = useState("");

  async function load() {
    try {
      const response = await fetch(ENDPOINT, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNotes(data.notes);
      setOwner(data.owner);
      setReady(true);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Notes couldn’t load.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, [project]);

  function position(client: Point): Point {
    const rect = layer.current!.getBoundingClientRect();
    // Keep even the expanded note within reach at narrow viewport widths.
    return {
      x: Math.max(
        0,
        Math.min(
          1,
          (client.x - rect.left - 104) / Math.max(1, rect.width - 222),
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          1,
          (client.y - rect.top - 45) / Math.max(1, rect.height - 230),
        ),
      ),
    };
  }
  function begin(event: PointerEvent<HTMLButtonElement>) {
    if (draft || busy || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    didDrag.current = false;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = event.currentTarget.offsetWidth;
    const radians = (7 * Math.PI) / 180;
    const localX =
      (event.clientX - rect.left - rect.width / 2) * Math.cos(radians) -
      (event.clientY - rect.top - rect.height / 2) * Math.sin(radians) +
      width / 2;
    const next = {
      start: { x: event.clientX, y: event.clientY },
      current: { x: event.clientX, y: event.clientY },
      lifted: false,
      grip: clamp(localX / width),
      width,
    };
    grabRef.current = next;
    setGrab(next);
  }
  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = grabRef.current;
    if (!current) return;
    const distance = current.start.y - event.clientY;
    if (Math.hypot(event.clientX - current.start.x, distance) > 6)
      didDrag.current = true;
    const next = {
      ...current,
      current: { x: event.clientX, y: event.clientY },
      lifted:
        current.lifted ||
        (distance > 8 &&
          (Math.hypot(event.clientX - current.start.x, distance) * 106) /
            current.width >
            75),
    };
    grabRef.current = next;
    setGrab(next);
  }
  function finish(cancelled = false) {
    const current = grabRef.current;
    if (current?.lifted && !cancelled) {
      setDraft(position(current.current));
      setText("");
      setExpanded(null);
    }
    grabRef.current = null;
    setGrab(null);
  }
  async function savePosition(id: string, next: Point, original: Point) {
    setBusy(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...next }),
      });
      if (!response.ok)
        throw new Error(
          "The note’s new position couldn’t be saved. Please try again.",
        );
    } catch (error) {
      setNotes((current) =>
        current.map((note) =>
          note.id === id ? { ...note, ...original } : note,
        ),
      );
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function beginMove(
    event: PointerEvent<HTMLButtonElement>,
    note: Pick<PublicNote, "id" | "x" | "y">,
  ) {
    if (busy || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = layer.current!.getBoundingClientRect();
    movingRef.current = {
      id: note.id,
      start: { x: event.clientX, y: event.clientY },
      original: { x: note.x, y: note.y },
      next: { x: note.x, y: note.y },
      width: Math.max(1, rect.width - 222),
      height: Math.max(1, rect.height - 230),
    };
    setMoving(note.id);
    setFresh(null);
  }
  function moveNote(event: PointerEvent<HTMLButtonElement>) {
    const current = movingRef.current;
    if (!current) return;
    current.next = {
      x: clamp(
        current.original.x + (event.clientX - current.start.x) / current.width,
      ),
      y: clamp(
        current.original.y + (event.clientY - current.start.y) / current.height,
      ),
    };
    if (current.id === "draft") {
      setDraft(current.next);
      return;
    }
    setNotes((notes) =>
      notes.map((note) =>
        note.id === current.id ? { ...note, ...current.next } : note,
      ),
    );
  }
  function finishMove(cancelled = false) {
    const current = movingRef.current;
    if (!current) return;
    movingRef.current = null;
    setMoving(null);
    if (current.id === "draft") {
      if (cancelled) setDraft(current.original);
      return;
    }
    if (cancelled)
      setNotes((notes) =>
        notes.map((note) =>
          note.id === current.id ? { ...note, ...current.original } : note,
        ),
      );
    else if (
      current.next.x !== current.original.x ||
      current.next.y !== current.original.y
    )
      void savePosition(current.id, current.next, current.original);
  }
  function moveHandle(
    note: Pick<PublicNote, "id" | "x" | "y" | "mine">,
    index: number,
  ) {
    return (
      <button
        type="button"
        className="note-drag-handle"
        aria-label={
          note.id === "draft" ? "Move draft note" : `Move note ${index + 1}`
        }
        title="Drag to move · Arrow keys to nudge"
        disabled={busy}
        onPointerDown={(event) => beginMove(event, note)}
        onPointerMove={moveNote}
        onPointerUp={() => finishMove()}
        onPointerCancel={() => finishMove(true)}
        onLostPointerCapture={() => {
          if (movingRef.current) finishMove(true);
        }}
        onKeyDown={(event) => {
          if (
            !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
              event.key,
            )
          )
            return;
          event.preventDefault();
          const step = event.shiftKey ? 0.1 : 0.025;
          const next = {
            x: clamp(
              note.x +
                (event.key === "ArrowRight"
                  ? step
                  : event.key === "ArrowLeft"
                    ? -step
                    : 0),
            ),
            y: clamp(
              note.y +
                (event.key === "ArrowDown"
                  ? step
                  : event.key === "ArrowUp"
                    ? -step
                    : 0),
            ),
          };
          if (note.id === "draft") {
            setDraft(next);
            return;
          }
          setNotes((notes) =>
            notes.map((item) =>
              item.id === note.id ? { ...item, ...next } : item,
            ),
          );
          void savePosition(note.id, next, note);
        }}
      >
        <DotsSix size={14} />
        {(note.id === "draft" || expanded === note.id) && (
          <span>
            {note.id === "draft"
              ? "A little thought?"
              : note.mine
                ? "Your note"
                : "Guest note"}
          </span>
        )}
      </button>
    );
  }
  async function post() {
    if (!text.trim() || !draft || busy || !ready) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, text, ...draft, context, website }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setNotes((current) => [...current, data.note]);
      setFresh(data.note.id);
      setDraft(null);
      setText("");
      setExpanded(null);
      setMessage("Note posted. Only you and Winston can see it.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Your note couldn’t be posted. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    setBusy(true);
    try {
      const response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("The note couldn’t be removed.");
      setNotes((current) => current.filter((note) => note.id !== id));
      setExpanded(null);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function ownerAccess(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${ENDPOINT}/owner`, {
        method: owner ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: owner ? undefined : JSON.stringify({ key }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setKey("");
      setOwnerForm(false);
      if (owner) {
        setNotes([]);
        setOwner(false);
      }
      await load();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const placement = (point: Point): CSSProperties => ({
    left: `calc(${point.x} * (100% - 222px) + 8px)`,
    top: `calc(${point.y} * (100% - 230px) + 8px)`,
  });
  const radians = (7 * Math.PI) / 180;
  const dx = grab ? ((grab.current.x - grab.start.x) * 106) / grab.width : 0;
  const dy = grab ? ((grab.current.y - grab.start.y) * 106) / grab.width : 0;
  const paperX = dx * Math.cos(radians) - dy * Math.sin(radians);
  const paperY = Math.min(0, dx * Math.sin(radians) + dy * Math.cos(radians));
  const flightAngle =
    -7 +
    Math.max(-18, Math.min(18, ((Math.atan2(dx, -dy) * 180) / Math.PI) * 0.2));

  return (
    <div
      ref={layer}
      className="notes-layer"
      aria-label="Private feedback notes"
    >
      {notes.map((note, index) => (
        <article
          key={note.id}
          className={`sticky-note ${expanded === note.id ? "is-open" : "is-contracted"} ${fresh === note.id ? "just-posted" : ""} ${moving === note.id ? "is-moving" : ""}`}
          style={placement(note)}
          onAnimationEnd={() => {
            if (fresh === note.id) setFresh(null);
          }}
        >
          {expanded === note.id ? (
            <>
              <div className="note-topline">
                {moveHandle(note, index)}
                <button
                  aria-label="Contract note"
                  onClick={() => setExpanded(null)}
                >
                  <Minus size={15} />
                </button>
              </div>
              <p className="note-body">{note.text}</p>
              <div className="note-bottomline">
                <span>
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · Private
                </span>
                <button
                  disabled={busy}
                  aria-label="Delete note"
                  onClick={() => void remove(note.id)}
                >
                  <Trash size={14} />
                </button>
              </div>
            </>
          ) : (
            <>
              {moveHandle(note, index)}
              <button
                className="note-pin"
                aria-label={`Read ${note.mine ? "your" : "guest"} note ${index + 1}`}
                onClick={() => setExpanded(note.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span className="note-preview-lines" aria-hidden="true" />
              </button>
            </>
          )}
        </article>
      ))}
      {draft && (
        <form
          className={`sticky-note is-draft ${moving === "draft" ? "is-moving" : ""}`}
          style={placement(draft)}
          onSubmit={(event) => {
            event.preventDefault();
            void post();
          }}
        >
          <div className="note-topline">
            {moveHandle({ id: "draft", ...draft, mine: true }, -1)}
            <button
              type="button"
              disabled={busy}
              aria-label="Cancel note"
              onClick={() => setDraft(null)}
            >
              <X size={14} />
            </button>
          </div>
          <textarea
            id="sticky-comment"
            aria-label="A little thought?"
            autoFocus
            maxLength={1000}
            placeholder="What would you change?"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
            disabled={busy}
          />
          <label className="note-honeypot" aria-hidden="true">
            Website
            <input
              name="website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
          <div className="note-bottomline">
            <span>Just you + Winston</span>
            <button
              className="note-post"
              disabled={busy || !ready || !text.trim()}
              type="submit"
            >
              {busy ? "Posting…" : "Post"}
              <Check size={13} />
            </button>
          </div>
        </form>
      )}
      {grab?.lifted && (
        <div
          className="sticky-flight"
          style={
            {
              left: grab.current.x,
              top: grab.current.y,
              "--flight-angle": `${flightAngle}deg`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <span>A little thought?</span>
        </div>
      )}
      <div className="note-station">
        <button
          className={`note-pad ${grab ? "is-peeling" : ""}`}
          aria-label="Add a private note"
          disabled={!!draft || busy}
          onPointerDown={begin}
          onPointerMove={move}
          onPointerUp={() => finish()}
          onPointerCancel={() => finish(true)}
          onLostPointerCapture={() => {
            if (grabRef.current) finish(true);
          }}
          onClick={(event) => {
            if (!didDrag.current || event.detail === 0) {
              setDraft({ x: 0.12, y: 0.2 });
              setText("");
            }
          }}
        >
          <span className="pad-back" />
          <PeelingPaper
            dx={paperX}
            dy={paperY}
            grip={grab?.grip ?? 0.5}
            active={!!grab && !grab.lifted}
          />
        </button>
        <span className="note-station-hint">Peel up to leave a note</span>
        <button
          className="note-owner"
          aria-label={owner ? "Owner notes active" : "Owner access"}
          onClick={() => setOwnerForm(!ownerForm)}
        >
          <Key size={12} />
          {owner ? "All notes" : "Private notes"}
        </button>
      </div>
      {ownerForm && (
        <form className="owner-access" onSubmit={ownerAccess}>
          <div className="note-topline">
            <strong>{owner ? "Owner view" : "For Winston"}</strong>
            <button
              type="button"
              aria-label="Close owner access"
              onClick={() => setOwnerForm(false)}
            >
              <X size={14} />
            </button>
          </div>
          <p>
            {owner
              ? "You can see every guest’s notes."
              : "Your access key unlocks all guest notes."}
          </p>
          {!owner && (
            <input
              aria-label="Owner access key"
              type="password"
              autoComplete="current-password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              required
            />
          )}
          <button className="owner-submit" disabled={busy}>
            {owner ? "Leave owner view" : "Unlock notes"}
          </button>
        </form>
      )}
      {message && (
        <div className="note-message" role="status">
          {message}
          <button
            aria-label="Dismiss note message"
            onClick={() => setMessage("")}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
