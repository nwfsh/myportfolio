// Everything the Profile (bento) section shows. Empty values are skipped or shown as grey
// placeholders, so nothing links nowhere.

export const PROFILE = {
  name: "Avery",
  location: "Vancouver, BC",
  timeZone: "America/Vancouver", // for the live local-time clock
  email: "averycx14@gmail.com",

  socials: [
    { label: "GitHub", url: "https://github.com/nwfsh" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/cxinyu" },
  ],

  // Spotify: paste a playlist/album/track share link, e.g.
  // "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M". Empty shows a placeholder.
  // Note: Spotify's player sets its own cookies once it loads.
  spotifyUrl: "",

  // Favourite collages: import images from data/ (e.g. `import c1 from "@/data/collage-1.jpg"`)
  // and add { src: c1.src, alt: "…" }. Until then, grey placeholders show.
  collages: [] as { src: string; alt: string }[],
};

/** Turns a normal Spotify share link into its embeddable player URL. */
export function spotifyEmbedUrl(url: string) {
  const m = url.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator` : null;
}
