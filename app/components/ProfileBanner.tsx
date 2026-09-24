import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Linkedin01Icon } from "@hugeicons/core-free-icons";
import { PROFILE } from "../profile";
import "./ProfileBanner.css";

const SOCIAL_ICONS = { GitHub: GithubIcon, LinkedIn: Linkedin01Icon } as const;

// Full-width banner: "Let's connect!" + email on the left, GitHub / LinkedIn on the right.
export default function ProfileBanner() {
  const socials = PROFILE.socials.filter((s) => s.url);
  return (
    <div className="banner">
      <div className="banner__inner">
        <a className="banner__talk" href={`mailto:${PROFILE.email}`}>
          <span className="banner__label">Let&apos;s connect!</span>
          <span className="banner__email">{PROFILE.email}</span>
        </a>
        {socials.length ? (
          <div className="banner__socials">
            {socials.map((s) => (
              <a key={s.label} className="banner__link" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label in SOCIAL_ICONS ? (
                  <HugeiconsIcon
                    icon={SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS]}
                    size="1em"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                ) : null}
                {s.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
