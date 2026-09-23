// Your projects. Each one can belong to several categories; the filter on the Projects
// section brings matching projects to the front and highlights them.

export const CATEGORIES = [
  { id: "data", label: "Data", color: "#0891b2" },
  { id: "ml-ai", label: "ML / AI", color: "#bc13fe" },
  { id: "full-stack", label: "Full Stack", color: "#ff10f0" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type Project = {
  title: string;
  description: string;
  categories: CategoryId[];
  tags: string[];
  // Optional screenshot/cover. Put the file in public/projects/ and use "/projects/name.jpg".
  // Without one, the card shows a placeholder in its category colours.
  image?: string;
};

// Placeholders: swap in your real projects, keeping a `categories` list on each.
export const PROJECTS: Project[] = [
  {
    title: "Project One",
    description: "A short description of what this project does and why it matters.",
    categories: ["data"],
    tags: ["Python", "SQL", "Pandas"],
  },
  {
    title: "Project Two",
    description: "Another project — swap this text out for something you've built.",
    categories: ["ml-ai"],
    tags: ["PyTorch", "scikit-learn"],
  },
  {
    title: "Project Three",
    description: "A third project to fill out the grid. Add as many as you like.",
    categories: ["full-stack"],
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    title: "Project Four",
    description: "Projects can sit in more than one category, like this one.",
    categories: ["data", "ml-ai"],
    tags: ["Python", "Jupyter"],
  },
  {
    title: "Project Five",
    description: "An app that uses a model behind an API, for example.",
    categories: ["ml-ai", "full-stack"],
    tags: ["FastAPI", "React"],
  },
  {
    title: "Project Six",
    description: "A dashboard built on top of your own data pipeline, for example.",
    categories: ["data", "full-stack"],
    tags: ["PostgreSQL", "Next.js"],
  },
];
