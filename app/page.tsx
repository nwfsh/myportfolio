import Dock from "./components/Dock";
import ExperienceLine from "./components/ExperienceLine";
import ProfileBento from "./components/ProfileBento";
// import ProfileBanner from "./components/ProfileBanner"; // banner version, commented out below
// import GlassSurface from "./components/GlassSurface"; // glass panel behind Experience (commented out below)
import DotSnapText from "./components/DotSnapText";
import SplitText from "./components/SplitText";
import ScrollReveal from "./components/ScrollReveal";
import HeroPhoto from "./components/HeroPhoto";
import ProjectGrid from "./components/ProjectGrid";
import TextType from "./components/TextType";

// Your club experience, most recent first. Each organisation holds its roles (newest first);
// `points` (bullet points) are optional on each role.
type Role = { title: string; dates: string; points?: string[] };
const EXPERIENCE: { org: string; location?: string; roles: Role[] }[] = [
    {
        org: "nwPlus",
        location: "Vancouver, British Columbia",
        roles: [
            {
                title: "External Engagement Coordinator",
                dates: "Apr 2026 – Present",
                points: [
                    "Contributing to day-of operations and designed website/merch (reaching 1,250+ participants) for two of Western Canada’s largest hackathons – HackCamp and nwHacks – as part of a 55-member team.",
                ],
            },
            {
                title: "EDI Coordinator & 2nd Year Rep",
                dates: "Oct 2025 – Apr 2026",
                points: [
                    "Led a Pitching 101 and Inclusive Language workshop for 50+ hackers and 40+ mentors/judges/volunteers.",
                    "Contributed to day-of operations and curated an inclusive environment for three of Western Canada’s largest hackathons – HackCamp, nwHacks, cmd-f – as part of a 55-member team.",
                ],
            },
        ],
    },
];

export default function Home() {
  return (
      <>
          <Dock />

          <main>
              <section id="home" className="section section--wide hero">
                  <HeroPhoto />
                  <div className="hero-text">
                      <h1
                          className="hero-title"
                          aria-label="Hi, I'm Avery (Xin Yu), a developer."
                      >
                          {/* Invisible copy of the longest line reserves space so the layout doesn't jump while typing. */}
                          <span
                              className="hero-title__sizer"
                              aria-hidden="true"
                          >
                              Hi, I&apos;m
                              <br />a developer.
                              <span className="text-type__cursor">|</span>
                          </span>
                          {/* "Hi, I'm" stays put on line one; only line two is typed, deleted and retyped. */}
                          <span aria-hidden="true">
                              Hi, I&apos;m
                              <br />
                              <TextType
                                  as="span"
                                  text={["Avery.", "Xin Yu.", "a developer."]}
                                  typingSpeed={75}
                                  pauseDuration={1500}
                                  showCursor
                                  cursorCharacter="|"
                              />
                          </span>
                      </h1>
                      <DotSnapText>
                          I&apos;m a 3rd-year CS student at the University of
                          British Columbia with a love for data, AI, and ML.
                          Sometimes, I design.{" "}
                      </DotSnapText>
                  </div>
              </section>

              <section id="intro" className="section statement">
                  <ScrollReveal
                      baseOpacity={0}
                      enableBlur
                      blurStrength={16}
                      baseRotation={0}
                      // Starts once the text's top is 80% down the screen. The ends are tied to the text's
                      // *bottom*, so even the last line is on screen while it fades in and un-blurs:
                      // fully faded in when the bottom is 75% down, fully sharp when it's 55% down.
                      wordAnimationStart="top 80%"
                      wordAnimationEnd="bottom 75%"
                      blurAnimationEnd="bottom 55%"
                  >
                      I'm obsessed with social media and all the data behind it.
                      I love taking messy stuff (comments, posts, videos, and
                      random internet chatter), organizing it neatly, and
                      building algorithms and models that help computers make
                      sense of it almost like a human would. I'm curious on how
                      this technology would make the world safer, and
                      experiences more personalised!
                  </ScrollReveal>
              </section>

              <section id="projects" className="section section--wide">
                  {/* Same letter-by-letter rise as the Reach Me cards. */}
                  <SplitText
                      tag="h2"
                      text="Projects"
                      textAlign="left"
                      from={{ opacity: 0, y: 24 }}
                      to={{ opacity: 1, y: 0 }}
                      duration={0.8}
                      delay={30}
                  />
                  <ProjectGrid />
              </section>

              <section id="experience" className="section section--wide">
                  <SplitText
                      tag="h2"
                      text="Experience"
                      textAlign="left"
                      from={{ opacity: 0, y: 24 }}
                      to={{ opacity: 1, y: 0 }}
                      duration={0.8}
                      delay={30}
                  />
                  {/* Glass panel behind the timeline — commented out for now. To restore, uncomment the
                      GlassSurface import at the top and this wrapper (and its closing tag below).
                  <GlassSurface
                      width="100%"
                      height="auto"
                      borderRadius={24}
                      borderWidth={0.14}
                      distortionScale={-120}
                      backgroundOpacity={0.05}
                      saturation={1.15}
                      className="experience-glass"
                  >
                  */}
                  {/* Vertical timeline: current at the top, past below. */}
                  <ExperienceLine
                      roles={EXPERIENCE.flatMap((group) =>
                          group.roles.map((role) => ({
                              org: group.org,
                              location: group.location,
                              ...role,
                          }))
                      )}
                  />
                  {/* </GlassSurface> */}
              </section>

              <section id="profile" className="section section--wide">
                  {/* <h2>Reach Me</h2> — hidden for now */}
                  <ProfileBento />
                  {/* <ProfileBanner /> — full-width banner version, hidden for now */}
              </section>
          </main>

      </>
  );
}
