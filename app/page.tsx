import Dock from "./components/Dock";
import HeroPhoto from "./components/HeroPhoto";
import ProjectGrid from "./components/ProjectGrid";
import TextType from "./components/TextType";

// Your club experience, most recent first. `points` are the bullet points under each role.
const EXPERIENCE = [
  {
    role: "Your role (e.g. Data Lead)",
    org: "Club name",
    dates: "Sep 2025 – Present",
    points: ["What you worked on or organised.", "An impact or result, ideally with a number."],
  },
  {
    role: "Another role (e.g. Member)",
    org: "Another club",
    dates: "Sep 2024 – Apr 2025",
    points: ["What you were responsible for.", "Tools or skills you used."],
  },
];

// Your random fun facts — one string each, shown in this order.
const TRIVIA = [
  "Fun fact #1 — replace me with something about you.",
  "Fun fact #2 — a hobby, a hot take, a favourite food…",
  "Fun fact #3 — add as many as you like.",
];

export default function Home() {
  return (
    <>
      <Dock />

      <main>
        <section id="home" className="section hero">
          <HeroPhoto />
          <div className="hero-text">
            <h1 className="hero-title" aria-label="Hi, I'm Avery, a developer.">
              {/* Invisible copy of the longest line reserves space so the layout doesn't jump while typing. */}
              <span className="hero-title__sizer" aria-hidden="true">
                Hi, I&apos;m
                <br />
                a developer.<span className="text-type__cursor">|</span>
              </span>
              {/* "Hi, I'm" stays put on line one; only line two is typed, deleted and retyped. */}
              <span aria-hidden="true">
                Hi, I&apos;m
                <br />
                <TextType
                  as="span"
                  text={["Avery.", "a developer."]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor
                  cursorCharacter="|"
                />
              </span>
            </h1>
            <p>I love everything data, ml, and ai related !! </p>
          </div>
        </section>

        <section id="projects" className="section section--wide">
          <h2>Projects</h2>
          <ProjectGrid />
        </section>

        <section id="experience" className="section">
          <h2>Experience</h2>
          <ol className="timeline">
            {EXPERIENCE.map((job) => (
              <li key={`${job.role}-${job.org}`} className="timeline__item">
                <div className="timeline__head">
                  <h3>
                    {job.role} <span className="timeline__org">· {job.org}</span>
                  </h3>
                  <span className="timeline__dates">{job.dates}</span>
                </div>
                <ul className="timeline__points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="section">
          <h2>Contact</h2>
          <p>Want to get in touch? Send me an email.</p>
          <a className="button" href="mailto:averycx14@gmail.com">
            Say hello
          </a>
        </section>

        <section id="trivia" className="section">
          <h2>Trivia</h2>
          <p>Random fun facts about me.</p>
          <ul className="trivia">
            {TRIVIA.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Avery</footer>
    </>
  );
}
