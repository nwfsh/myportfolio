import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Linkedin01Icon } from "@hugeicons/core-free-icons";
import { PROFILE /* , spotifyEmbedUrl */ } from "../profile";
import LocalTime from "./LocalTime";
import SplitText from "./SplitText";
import "./ProfileBento.css";

// Letter-by-letter rise (React Bits SplitText) for the bento words, as they scroll into view.
const RISE = { from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, duration: 0.8, delay: 30 } as const;

// Logos shown next to each social link, by label.
const SOCIAL_ICONS = { GitHub: GithubIcon, LinkedIn: Linkedin01Icon } as const;

// Bento-style Profile section: socials, "Let's connect!" + email, and a © / credit tile
// (Spotify and collages hidden for now).
export default function ProfileBento() {
  const socials = PROFILE.socials.filter((s) => s.url);
  // Used by the hidden Spotify / collages tiles below:
  // const embed = PROFILE.spotifyUrl ? spotifyEmbedUrl(PROFILE.spotifyUrl) : null;
  // const collageSlots = PROFILE.collages.length ? PROFILE.collages : Array.from({ length: 4 }, () => null);

  return (
    <div className="bento">
      {socials.length ? (
        <div className="bento__tile bento__socials">
          <SplitText tag="span" className="bento__label" text="Find me on," textAlign="left" {...RISE} />
          {socials.map((s) => (
            <a key={s.label} className="bento__link" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label in SOCIAL_ICONS ? (
                <HugeiconsIcon
                  icon={SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS]}
                  size="1em"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              ) : null}
              <SplitText tag="span" text={s.label} textAlign="left" {...RISE} />
            </a>
          ))}
        </div>
      ) : null}

      <a className="bento__tile bento__talk" href={`mailto:${PROFILE.email}`}>
        <SplitText tag="span" className="bento__label" text="Let's connect!" {...RISE} />
        <SplitText tag="span" className="bento__big" text={PROFILE.email} {...RISE} />
      </a>

      <div className="bento__tile bento__credit">
        <SplitText tag="span" className="bento__label" text={`© ${new Date().getFullYear()}`} textAlign="left" {...RISE} />
        <SplitText tag="span" className="bento__big" text={PROFILE.name} textAlign="left" {...RISE} />
        <span className="bento__small">
          {/* Your current local time, live. */}
          <span className="bento__time">
            <LocalTime timeZone={PROFILE.timeZone} /> · {PROFILE.location}
          </span>
        </span>
      </div>

      {/* "On repeat" (Spotify) and "Favourite collages" tiles — hidden for now. To bring them back,
          uncomment this block (their settings are still in profile.ts, styles in ProfileBento.css).
      <div className="bento__tile bento__spotify">
        <span className="bento__label">On repeat</span>
        {embed ? (
          <iframe
            className="bento__player"
            src={embed}
            title="Spotify player"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="bento__placeholder bento__placeholder--player">Spotify playlist coming soon</div>
        )}
      </div>

      <div className="bento__tile bento__collages">
        <span className="bento__label">Favourite collages</span>
        <div className="bento__collage-grid">
          {collageSlots.map((c, i) =>
            c ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={c.src} className="bento__collage" src={c.src} alt={c.alt} loading="lazy" />
            ) : (
              <div key={i} className="bento__collage bento__placeholder" aria-hidden="true" />
            )
          )}
        </div>
      </div>
      */}
    </div>
  );
}
