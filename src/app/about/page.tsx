import Link from "next/link";
import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import StudioNav from "@/components/studio/StudioNav";
import AboutDoggo from "@/components/studio/AboutDoggo";
import { personalInfo } from "@/lib/detail-content";
import "../studio.css";
import "./about.css";

export const metadata = {
  title: "About — Winston Gu",
  description:
    "Winston Gu, a designer and developer making games, interfaces, and curious little experiments.",
};

export default function AboutPage() {
  return (
    <div className="studio about-page">
      <a className="skip-link" href="#about-main">
        Skip to content
      </a>
      <StudioNav page="about" />
      <main id="about-main">
        <section
          className="about-introduction"
          aria-labelledby="about-page-title"
        >
          <div className="about-sticker-wrap">
            <AboutDoggo />
            <span className="about-sticker-caption">
              A familiar face. A little more about me.
            </span>
          </div>
          <div className="about-intro-copy">
            <span className="eyebrow">BEHIND THE PROJECTS</span>
            <h1 id="about-page-title">
              Hi, I’m
              <br />
              <em>Winston.</em>
            </h1>
            <p className="about-intro-lead">
              A designer and developer who likes
              <br className="about-desktop-break" /> to figure things out by
              making them.
            </p>
            <p>
              I’m studying Interactive Media and Game Design at USC, with a
              minor in Computer Programming. I move between games, interfaces,
              and the spaces in between.
            </p>
            <p>
              I like making complex things feel intuitive, and everyday
              interactions a little more interesting.
            </p>
            <div className="about-page-links">
              <a href={personalInfo.resume} target="_blank" rel="noreferrer">
                Résumé <ArrowSquareOut size={16} />
              </a>
              <a
                href={personalInfo.social.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <ArrowSquareOut size={16} />
              </a>
              <a
                href={personalInfo.social.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub <ArrowSquareOut size={16} />
              </a>
            </div>
          </div>
        </section>
        <section
          className="about-small-things"
          aria-label="A few more things about Winston"
        >
          <div>
            <span className="eyebrow">CURRENTLY</span>
            <h2>Learning in Los Angeles.</h2>
            <p>
              Game design, new tools, and ideas worth turning into something you
              can play with.
            </p>
          </div>
          <div>
            <span className="eyebrow">WHEN I’M NOT MAKING</span>
            <h2>Up for a rally.</h2>
            <p>
              I’m always happy to talk about tennis, a project, or whatever
              you’re curious about.
            </p>
          </div>
        </section>
        <section className="about-reach-out" aria-label="Get in touch">
          <div>
            <span className="eyebrow">SOMETHING IN MIND?</span>
            <h2>Let’s talk about it.</h2>
          </div>
          <a href={`mailto:${personalInfo.email}`}>
            Reach out <ArrowRight size={22} />
          </a>
        </section>
      </main>
      <footer className="studio-footer about-page-footer">
        <Link href="/#work">← Back to work</Link>
        <span>Winston Gu</span>
      </footer>
    </div>
  );
}
