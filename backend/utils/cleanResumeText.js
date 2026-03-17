/**
 * cleanResumeText.js
 *
 * Basic structural cleaning only (safe regex operations).
 * For merged-word repair, use cleanResumeTextWithAI() instead.
 */

export const cleanResumeText = (text) => {
  let cleaned = text;

  // 1. Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Fix PDF ligatures and unicode artifacts
  cleaned = cleaned
    .replace(/ﬁ/g, "fi").replace(/ﬂ/g, "fl").replace(/ﬀ/g, "ff")
    .replace(/ﬃ/g, "ffi").replace(/ﬄ/g, "ffl")
    .replace(/\u2019/g, "'").replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/\u2013/g, "-").replace(/\u2014/g, " | ")
    .replace(/\u00A0/g, " ");

  // 3. Remove non-printable characters (keep newlines, tabs, standard chars)
  cleaned = cleaned.replace(/[^\x09\x0A\x20-\x7E\u00A1-\uFFFF]/g, "");

  // 4. Fix camelCase splits ONLY (safe — only splits on uppercase boundaries)
  //    e.g. "withStrong" → "with Strong"
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

  // 5. Fix letter+digit / digit+letter merges
  //    e.g. "Aug2023" → "Aug 2023", "7.92/10CGPA" → "7.92/10 CGPA"
  cleaned = cleaned.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  cleaned = cleaned.replace(/([0-9])([a-zA-Z])/g, "$1 $2");

  // 6. Fix bullet/dash merged with text (e.g. "- Builtafull" → "- Built a full")
  cleaned = cleaned.replace(/^([–\-•●▪◦*])([^\s])/gm, "$1 $2");

  // 7. Remove lines that are only punctuation/symbols
  cleaned = cleaned.replace(/^[\s\-–•●▪◦*]+$/gm, "");

  // 8. Collapse multiple spaces (not newlines)
  cleaned = cleaned.replace(/[ \t]+/g, " ");

  // 9. Rejoin section headers broken across lines by PDF parser
  //    e.g. "Career\n\nObjective" → "Career Objective"
  cleaned = cleaned.replace(/\bCareer\s*\n+\s*Objective\b/gi, "Career Objective");
  cleaned = cleaned.replace(/\bTechnical\s*\n+\s*Skills\b/gi, "Technical Skills");
  cleaned = cleaned.replace(/\bAchievements\s*&?\s*\n+\s*Activities\b/gi, "Achievements & Activities");
  cleaned = cleaned.replace(/\bAdditional\s*\n+\s*Information\b/gi, "Additional Information");

  // 10. Insert section headers on their own lines
  const sections = [
    "Career Objective", "Technical Skills", "Projects", "Education",
    "Achievements & Activities", "Achievements", "Activities",
    "Additional Information", "Languages", "Interests",
    "Work Experience", "Experience", "Certifications", "Skills",
    "Summary", "Objective", "Publications", "References",
  ];
  sections.forEach((section) => {
    const regex = new RegExp(`(${section})`, "gi");
    cleaned = cleaned.replace(regex, "\n\n$1");
  });

  // 11. Collapse 3+ newlines → 2
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 12. Trim each line
  cleaned = cleaned.split("\n").map((l) => l.trim()).join("\n");

  return cleaned.trim();
};


/**
 * AI-powered cleaner — fixes merged words using Claude API.
 * Use this in your route for best results.
 *
 * @param {string} text - pre-cleaned text from cleanResumeText()
 * @returns {Promise<string>} - fully cleaned, readable resume text
 */
export const cleanResumeTextWithAI = async (text) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", // fast + cheap for this task
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are a resume text cleaner. The text below was extracted from a PDF and has merged words (e.g. "Builtafull-stack" should be "Built a full-stack", "fromuserprompts" should be "from user prompts").

Fix ONLY merged words — do not rephrase, rewrite, or add any content. Keep all names, technologies, company names, and proper nouns exactly as they are. Keep all section headers exactly as they are. Return only the cleaned text, nothing else.

Text to clean:
${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? text;
};