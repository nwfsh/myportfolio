// The resumes the dock's "Resume" button offers. Put the PDF in data/ and use
// new URL("../data/name.pdf", import.meta.url).href so the bundler copies and fingerprints it.
// `file` is the name the browser saves it as on Download.
export const RESUMES = [
  {
    role: "Data Engineering",
    href: new URL("../data/Avery_Chong_Data_Engineering_Resume.pdf", import.meta.url).href,
    file: "Avery_Chong_Data_Engineering_Resume.pdf",
  },
  {
    role: "Backend Engineering",
    href: new URL("../data/Avery_Chong_Resume_Backend_Engineering.pdf", import.meta.url).href,
    file: "Avery_Chong_Resume_Backend_Engineering.pdf",
  },
  {
    role: "AI/ML Engineering",
    href: new URL("../data/Chong_Xin_Yu_Resume_AI_ML_Engineering.pdf", import.meta.url).href,
    file: "Chong_Xin_Yu_Resume_AI_ML_Engineering.pdf",
  },
];
