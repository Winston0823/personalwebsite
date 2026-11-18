import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import StudioNav from "@/components/studio/StudioNav";
import { personalInfo } from "@/lib/detail-content";
import "../studio.css";

export const metadata = {
  title: "About — Winston Gu",
  description: "About Winston Gu, a designer working across games and digital products.",
};

export default function AboutPage() {
  return (
    <div className="studio about-page">
      <a className="skip-link" href="#about-main">Skip to content</a>
      <StudioNav page="about" />
      <main id="about-main">
        <section className="about-page-content" aria-labelledby="about-page-title">
          <span className="eyebrow">ABOUT WINSTON</span>
          <h1 id="about-page-title">
            A designer’s eye.<br />
            A builder’s <em>curiosity.</em>
          </h1>
          <div className="about-page-columns">
            <p className="about-page-lead">
              I’m Winston Gu, a designer and developer studying Interactive Media
              and Game Design at USC.
            </p>
            <div className="about-page-more">
              <p>
                I move between games, interfaces, and the spaces in between. I
                like making complex things feel intuitive, and everyday
                interactions a little more interesting.
              </p>
              <div className="about-page-links">
                <a href="/resume.pdf" target="_blank" rel="noreferrer">
                  Résumé <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <a href={personalInfo.social.github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRight size={17} aria-hidden="true" />
                </a>
                <a href={personalInfo.social.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="studio-footer about-page-footer">
        <Link href="/#work">← Back to work</Link>
        <a href={`mailto:${personalInfo.email}`}>Reach out <ArrowUpRight size={16} aria-hidden="true" /></a>
      </footer>
    </div>
  );
}
