// Your projects. Each one can belong to several categories; the filter on the Projects
// section brings matching projects to the front and highlights them.

export const CATEGORIES = [
  { id: "data", label: "Data Engineering", color: "#0891b2" },
  { id: "ml-ai", label: "ML / AI", color: "#bc13fe" },
  { id: "full-stack", label: "Full Stack", color: "#ff10f0" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type ProjectKind = "Personal project" | "School project" | "Hackathon project";

export type Project = {
  title: string;
  // What kind of project it is; shown as the first label on its strip.
  kind?: ProjectKind;
  // When it was made, as display text (e.g. "Feb – Apr 2026"); shown on the right of the title row.
  date?: string;
  // The pitch: what it is, for anyone.
  description: string;
  // Optional "The spark" line under the pitch: what made you want to build it. Pitch view only.
  spark?: string;
  // Optional technical write-up, shown instead of the pitch while the Pitch/Technical switch is on.
  technical?: string;
  // Optional "Wins" dropdown: one line per award, result, or milestone.
  wins?: string[];
  categories: CategoryId[];
  tags: string[];
  // Optional screenshot/cover URL (e.g. an image imported from data/ and its `.src`).
  // Without one, the card shows a grey placeholder.
  image?: string;
  // Optional preview video (muted; plays while its strip is hovered). Put an H.264 .mp4 in data/ and
  // use new URL("../data/name.mp4", import.meta.url).href so the bundler copies and fingerprints it.
  video?: string;
  // First frame of the video, shown in the box until the video has loaded.
  poster?: string;
  // Optional small badges shown next to the category labels.
  award?: string;
  status?: string;
};

export const PROJECTS: Project[] = [
  {
    title: "BlindSpot",
    date: "Sep 2026 – Present",
    kind: "Personal project",
    description:
      "YouTube comment sections are said to be highly moderated, but are they really? A deep dive into the communities creators foster and the hate they seem to tolerate and turn a blind eye to, broken down into subsets like racism, sexism, homophobia, and more.",
    technical:
      "A data pipeline that analyzes YouTube comment sections to surface what kinds of hate a creator's community engages in and what the creator tolerates. Comments are scored for sentiment, emotion, and hate category, then modeled in a star schema for a dashboard.",
    categories: ["data", "ml-ai"],
    tags: ["Python", "Airflow", "Docker", "YouTube Data API", "pandas", "Hugging Face", "dbt", "BigQuery"],
  },
  {
    title: "SoCurious",
    date: "Aug 2026",
    kind: "Personal project",
    video: new URL("../data/socurious.mp4", import.meta.url).href,
    poster: new URL("../data/socurious-poster.jpg", import.meta.url).href,
    description:
      "It's We're Not Really Strangers without the box: an endless deck of conversation questions, pulled from across the internet, cleaned up, and sorted by category and by how deep you want to go.",
    // Hidden for now — uncomment to show "The Spark" dropdown.
    // spark:
    //   "Everyone's obsession with bringing this particular game to bonding events. I adore it because it takes the pressure off figuring out what to say, and I wanted that feeling anytime, with questions that never run out.",
    technical:
      "An ETL pipeline collects conversation-starter questions from Reddit, then filters, deduplicates, and classifies them. Near-duplicates are caught with sentence embeddings, and a two-stage NLP classifier tags each question by topic and intimacy level. The questions live in Postgres (Neon) behind a FastAPI API, with a React front end.",
    categories: ["data", "ml-ai", "full-stack"],
    tags: ["Python", "FastAPI", "PostgreSQL (Neon)", "Hugging Face", "React", "TypeScript", "GitHub Actions"],
  },
  {
    title: "Eepy",
    kind: "Personal project",
    date: "May 2026 – Present",
    description:
      "A cozy sleep accountability app for long-distance couples that keeps your goodnights and good mornings connected, no matter how far apart your timezones are.",
    technical:
      "A sleep accountability app for long-distance couples in different timezones. It tracks shared sleep streaks using a timezone-aware cycle-matching system that handles partner timezone gaps of 26+ hours, with database-level access control through Row-Level Security.",
    categories: ["full-stack"],
    tags: ["React Native", "Expo", "TypeScript", "Node.js", "Express", "PostgreSQL", "Supabase", "Luxon", "Vitest", "Render"],
  },
  {
    title: "Matchie",
    date: "YouCode · Apr 2026",
    kind: "Hackathon project",
    award: "Diversity in CS Winner",
    description:
      "Most volunteer platforms are built for professionals, with skill-based matching and jargon that shut out passionate BC high schoolers working toward their 30-hour volunteering requirement. Matchie is an AI-powered platform that bridges this gap.",
    technical:
      "An AI-powered platform that matches BC high schoolers with local nonprofits to fulfill their 30-hour volunteer graduation requirement. It ranks opportunities with semantic embeddings, and each match comes with an LLM-generated explanation.",
    categories: ["ml-ai", "full-stack"],
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Express", "MongoDB", "Nomic Embed", "Groq", "Clerk", "Vercel"],
  },
  {
    title: "TravelWrap",
    date: "Feb – Apr 2026",
    kind: "School project",
    video: new URL("../data/travelwrap.mp4", import.meta.url).href,
    poster: new URL("../data/travelwrap-poster.jpg", import.meta.url).href,
    description:
      "Spotify Wrapped, but for your travels. TravelWrap brings your trips, destinations, and spending together in one place so you can look back on where you've been.",
    categories: ["full-stack", "data"],
    tags: ["React", "TypeScript", "Vite", "Node.js", "Express", "Oracle DB"],
  },
  {
    title: "LateTrack",
    date: "Jan – Apr 2024",
    kind: "School project",
    video: new URL("../data/latetrack.mp4", import.meta.url).href,
    poster: new URL("../data/latetrack-poster.jpg", import.meta.url).href,
    description:
      "Built for the chronically late. Takes the friction out of tracking your punctuality by checking in with you on your status the moment your event starts, so you can watch yourself improve over the weeks, months and years.",
    // A Java desktop app: none of the filter categories fit, so it shows under "All" only.
    categories: [],
    tags: ["Java", "Object-Oriented Programming", "Java Swing", "JSON", "JUnit"],
  },
];
