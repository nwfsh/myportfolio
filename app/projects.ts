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
  // The pitch: what it is, for anyone. Project text supports **bold** (see components/rich.tsx).
  description: string;
  // Optional "The spark" line under the pitch: what made you want to build it. Pitch view only.
  spark?: string;
  // Optional technical write-up, shown instead of the pitch while the Pitch/Technical switch is on.
  technical?: string;
  // Optional bullet points under the technical write-up; shown in the "Read more" pop-up.
  points?: string[];
  // Optional small aside on the card and in the pop-up (e.g. "my first project").
  note?: string;
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
    title: "BlindEye",
    date: "Sep 2026 – Present",
    kind: "Personal project",
    description:
      "YouTube comment sections are said to be **highly moderated, but are they really?** A deep dive into the communities creators foster and the **hate they seem to tolerate and turn a blind eye to**, broken down into subsets like racism, sexism, homophobia, and more.",
    technical:
      "An **ELT data pipeline** built with **Airflow, Python, and Docker** that analyzes YouTube comment sections to show what kinds of hate a creator's community engages in, using **Hugging Face** AI models, with results stored in **BigQuery** for a dashboard.",
    points: [
      "**Bronze layer:** automatically collects YouTube comments and **stores them untouched**, so any later step can be rerun from the original data.",
      "**Silver layer:** cleans the raw comments and **scores each one for sentiment and emotion** using AI models running on my own machine.",
      "**Gold layer (in progress):** organizes the scored data into a **star schema in BigQuery**, a layout built for fast, simple dashboard queries.",
      "**Redesigned the approach after an earlier version failed.** Figuring out who a comment was aimed at didn't work on sarcasm or indirect wording, so the new version sorts each comment directly into **one of 7 hate categories**, like racism or sexism.",
      "**Documented where the AI model is known to struggle**, such as subtle hate and disability-related comments, instead of hiding those gaps.",
    ],
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
      "It's **We're Not Really Strangers without the box**: an **endless deck of conversation questions**, pulled from across the internet, cleaned up, and sorted by category and by how deep you want to go.",
    // Hidden for now — uncomment to show "The Spark" dropdown.
    // spark:
    //   "Everyone's obsession with bringing this particular game to bonding events. I adore it because it takes the pressure off figuring out what to say, and I wanted that feeling anytime, with questions that never run out.",
    technical:
      "A **Python ETL pipeline** that collects conversation-starter questions from Reddit, cleans them, and sorts them by topic and how personal they are, using **Hugging Face** AI models, a **PostgreSQL** database on **Neon**, and **GitHub Actions** to run it on a schedule.",
    points: [
      "**Built 7 filters** to throw out low-quality posts, ordered so the quickest checks run first. I tested each filter on real data and removed two that were **wrongly rejecting good questions over 80% of the time**.",
      "Improved duplicate detection by replacing fuzzy string matching (comparing spelling) with **sentence embeddings** using **all-MiniLM-L6-v2** (comparing meaning). In a test on 1,212 questions, this **caught 50% more duplicates** without flagging extra false matches.",
      "**Checked the sorting results by hand over 5 rounds**, adjusting the approach each time based on what went wrong.",
    ],
    categories: ["data", "ml-ai", "full-stack"],
    tags: ["Python", "FastAPI", "PostgreSQL (Neon)", "Hugging Face", "React", "TypeScript", "GitHub Actions"],
  },
  {
    title: "Eepy",
    kind: "Personal project",
    date: "May 2026 – Present",
    description:
      "A cozy sleep accountability app for **long-distance couples** that keeps your goodnights and good mornings connected, no matter how far apart your timezones are.",
    technical:
      "A **React Native** app for long-distance couples, backed by a **Node.js/Express** server and a **PostgreSQL** database on **Supabase**.",
    points: [
      "**Designed the entire app myself in Figma** and built the interface directly from those designs, including a **custom sun and moon character system** and a consistent spacing grid.",
      "**Built a streak system that works across timezones.** Handled **timezone gaps of up to 26 hours** and **daylight saving time** changes, with automated tests for tricky cases like nights that cross midnight.",
      "**Prevented race conditions** in streak counting by replacing a two-step read-then-write with a **single atomic database query**, so simultaneous check-ins always count correctly.",
    ],
    categories: ["full-stack"],
    tags: ["React Native", "Expo", "TypeScript", "Node.js", "Express", "PostgreSQL", "Supabase", "Luxon", "Vitest", "Render"],
  },
  {
    title: "Matchie",
    date: "YouCode · Apr 2026",
    kind: "Hackathon project",
    award: "Diversity in CS Winner",
    description:
      "Most volunteer platforms are built for professionals, with skill-based matching and jargon that shut out **passionate BC high schoolers** working toward their 30-hour volunteering requirement. **Matchie is an AI-powered platform that bridges this gap.**",
    technical:
      "A web app that matches BC high school students with local volunteer opportunities, built with **Next.js, React, and TypeScript** on the front end, a **Node.js/Express** server, and a **MongoDB** database.",
    points: [
      "**Matched students to opportunities by meaning rather than keywords.** An AI model turns student profiles and opportunities into comparable numbers, so a student interested in \"helping animals\" can match a shelter listing that never uses those words.",
      "Showed a short, AI-written explanation for why each opportunity was recommended, generated in **under 0.2 seconds**.",
      "**Built the full app** from interface to server to database, with secure sign-up and login through **Clerk**.",
    ],
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
      "**Spotify Wrapped, but for your travels.** TravelWrap brings your trips, destinations, and spending together in one place so you can look back on where you've been.",
    technical:
      "A travel planning web app built by a **team of 3**, with a **React and TypeScript** front end built in **Vite**, a **Node.js/Express REST API**, and an **Oracle** relational database. The front end sends requests to the API, which validates the input and runs SQL queries against a schema of **15+ linked tables** covering travellers, trips, destinations, and purchases.",
    points: [
      "**Designed a database of 15+ tables** covering travellers, trips, destinations, and purchases, organized so each piece of information is **stored in exactly one place**.",
      "Set up the database so deleting a record **automatically cleans up everything connected to it**, preventing leftover orphaned data.",
      "**Protected the server against bad or malicious input**, and **combined database requests** to avoid unnecessary repeated calls.",
      "Built **reusable interface components** from **Figma** designs.",
    ],
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
      "**Built for the chronically late.** Takes the friction out of tracking your punctuality by **checking in with you on your status the moment your event starts**, so you can watch yourself improve over the weeks, months and years.",
    note: "My very first project, kept here for sentimental reasons.",
    technical:
      "A **Java desktop app** with a **Swing** interface that tracks your punctuality, saving your event history to **JSON** files. You set an event with reminder alarms before it, and when the event alarm goes off, the app asks whether you made it on time and logs the answer against that event.",
    points: [
      "**Built an alarm system** with separate reminder alarms before an event and a main alarm when it starts, so **tracking happens at the moment it matters** instead of relying on you to remember later.",
      "Calculated your **weekly punctuality percentage** from any starting date, so you can see whether you're improving over time.",
      "Added **save and load**, so your full event history persists between sessions.",
      "Tested the core logic with **JUnit**.",
    ],
    // A Java desktop app: none of the filter categories fit, so it shows under "All" only.
    categories: [],
    tags: ["Java", "Object-Oriented Programming", "Java Swing", "JSON", "JUnit"],
  },
];
