import Link from "next/link";

export const metadata = {
  title: "404 — Winston Gu",
  description: "This page doesn't exist (yet).",
};

export default function NotFound() {
  return (
    <main className="min-h-dvh w-full flex items-center justify-center px-6 py-16 bg-[var(--color-bg)]">
      <div className="max-w-md w-full flex flex-col gap-6 text-center">
        <p
          className="font-semibold uppercase tracking-[0.18em] text-accent"
          style={{ fontSize: "var(--text-widget-title)" }}
        >
          404
        </p>
        <h1
          className="font-bold text-text-primary leading-[0.95] tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)" }}
        >
          This page doesn&apos;t exist (yet).
        </h1>
        <p
          className="text-text-secondary leading-relaxed"
          style={{ fontSize: "var(--text-body)" }}
        >
          The URL might be wrong, or the widget might be still in the drawer.
          Either way — let&apos;s head back to the dashboard.
        </p>
        <div className="flex justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-accent text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
            style={{ fontSize: "var(--text-body)" }}
          >
            <span aria-hidden="true">←</span>
            Back to the dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
