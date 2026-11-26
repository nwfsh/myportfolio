// The resumes the dock's "Resume" button offers. Put the PDF in data/ and use
// new URL("../data/name.pdf", import.meta.url).href so the bundler copies and fingerprints it.
// Order matters: the first sits at the front of the folder (leftmost once it opens), the last at
// the back.
export const RESUMES = [
  {
    role: "AI/ML Engineering",
    href: new URL("../data/Chong_Xin_Yu_Resume_AI_ML_Engineering.pdf", import.meta.url).href,
  },
  {
    role: "Data Engineering",
    href: new URL("../data/Avery_Chong_Data_Engineering_Resume.pdf", import.meta.url).href,
  },
  {
    role: "Backend Engineering",
    href: new URL("../data/Avery_Chong_Resume_Backend_Engineering.pdf", import.meta.url).href,
  },
];
