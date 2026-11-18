import Link from "next/link";
import { ArrowUpRight, ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import StudioNav from "@/components/studio/StudioNav";
import PrototypeUploads from "@/components/sandbox/PrototypeUploads";
import MotionStudy from "@/components/sandbox/MotionStudy";
import "../studio.css";

export const metadata = {
  title: "Sandbox — Winston Gu",
  description:
    "Interactive prototypes, experiments, and projects by Winston Gu.",
};
export default function SandboxPage() {
  return (
    <div className="studio sandbox-page">
      <a className="skip-link" href="#sandbox">
        Skip to content
      </a>
      <StudioNav page="sandbox" />
      <main>
        <section
          className="sandbox-section"
          id="sandbox"
          aria-labelledby="sandbox-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow violet-text">THE SANDBOX</span>
              <h1 id="sandbox-title">
                Ideas you can
                <br />
                actually play with<span className="lime-text">.</span>
              </h1>
            </div>
            <p className="sandbox-intro">
              Prototypes and projects, ready to try.
              <br />
              Open one up and get hands-on.
            </p>
          </div>
          <PrototypeUploads />
          <div className="sandbox-grid">
            <article className="study-card">
              <MotionStudy />
              <div className="experiment-caption">
                <div>
                  <h3>Form, meet motion.</h3>
                  <p>An interactive exploration of repetition and space.</p>
                </div>
                <span className="small-pill">PLAY WITH IT ↑</span>
              </div>
            </article>
            <Link href="/playground" className="playground-card">
              <div className="playground-top">
                <span className="eyebrow">EXPERIMENT / 002</span>
                <ArrowUpRight size={24} />
              </div>
              <div className="mini-desktop" aria-hidden="true">
                <div className="mini-name">
                  Make
                  <br />
                  <span>it yours.</span>
                </div>
                <div className="mini-window">
                  <span />
                  <span />
                  <span />
                  <i>✳</i>
                </div>
                <div className="mini-tile">↗</div>
                <div className="mini-lines">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="playground-caption">
                <span className="small-pill">INTERACTIVE</span>
                <h3>A desktop with no rules.</h3>
                <p>Rearrange the widgets. Find your own way around.</p>
                <span className="text-link">
                  Open the widget playground <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          </div>
          <div className="sandbox-next">
            <span className="next-mark">
              <Plus size={25} />
            </span>
            <div>
              <h3>A home for the next iteration.</h3>
              <p>
                Bring a prototype, try it out, and keep building. Shared
                publishing, version history, and feedback are the next pieces.
              </p>
            </div>
            <span className="small-pill">UP NEXT</span>
          </div>
        </section>
      </main>
      <footer className="studio-footer">
        <Link href="/">← Back to the studio</Link>
      </footer>
    </div>
  );
}

