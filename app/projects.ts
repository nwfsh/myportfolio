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
  description: string;
  categories: CategoryId[];
  tags: string[];
  // Optional screenshot/cover URL (e.g. an image imported from data/ and its `.src`).
  // Without one, the card shows a grey placeholder.
  image?: string;
  // Optional preview video (muted; plays while its strip is hovered). Put an H.264 .mp4 in data/ and
  // use new URL("../data/name.mp4", import.meta.url).href so the bundler copies and fingerprints it.
  video?: string;
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
      "A data pipeline that analyzes YouTube comment sections to surface what kinds of hate a creator's community engages in and what the creator tolerates. Comments are scored for sentiment, emotion, and hate category, then modeled in a star schema for a dashboard.",
    categories: ["data", "ml-ai"],
    tags: ["Python", "Airflow", "Docker", "YouTube Data API", "pandas", "Hugging Face", "dbt", "BigQuery"],
  },
  {
    title: "SoCurious",
    date: "Aug 2026",
    kind: "Personal project",
    video: new URL("../data/socurious.mp4", import.meta.url).href,
    description:
      "An ETL pipeline that collects conversation-starter questions from Reddit, then filters, deduplicates, and classifies them. It uses sentence-embedding deduplication and a two-stage NLP classifier for topic and intimacy level.",
    categories: ["data", "ml-ai", "full-stack"],
    tags: ["Python", "FastAPI", "PostgreSQL (Neon)", "Hugging Face", "React", "TypeScript", "GitHub Actions"],
  },
  {
    title: "Eepy",
    kind: "Personal project",
    date: "May 2026 – Present",
    description:
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
      "An AI-powered platform that matches BC high schoolers with local nonprofits to fulfill their 30-hour volunteer graduation requirement. It ranks opportunities with semantic embeddings, and each match comes with an LLM-generated explanation.",
    categories: ["ml-ai", "full-stack"],
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Express", "MongoDB", "Nomic Embed", "Groq", "Clerk", "Vercel"],
  },
  {
    title: "TravelWrap",
    date: "Feb – Apr 2026",
    kind: "School project",
    description:
      "Spotify Wrapped, but for your travels. TravelWrap brings your trips, destinations, and spending together in one place so you can look back on where you've been.",
    categories: ["full-stack", "data"],
    tags: ["React", "TypeScript", "Vite", "Node.js", "Express", "Oracle DB"],
  },
  {
    title: "Lateness Tracker",
    date: "Jan – Apr 2024",
    kind: "School project",
    description:
      "For chronically late people who want to stop being late. You set an alarm for your event plus reminders before it, and when the event alarm goes off, you tap whether you made it on time. Every event gets logged automatically, so you can see your punctuality over days, weeks, months, or years and watch the numbers improve.",
    // A Java desktop app: none of the filter categories fit, so it shows under "All" only.
    categories: [],
    tags: ["Java", "Object-Oriented Programming", "Java Swing", "JSON", "JUnit"],
  },
];
