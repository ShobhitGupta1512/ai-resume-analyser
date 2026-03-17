/**
 * utils/extractSections.js
 * AI Resume Analyser — Section Extractor
 *
 * Built specifically to handle pdf2json output where section headers
 * are often split across lines or merged with content.
 *
 * Handles patterns like:
 *   "Career\n\nObjective ..."     → summary
 *   "Technical\n\nSkills ..."     → skills
 *   "Achievements&\n\nActivities" → awards
 *   "Education Quantum Univ..."   → education (inline)
 *   "Projects Interior AI..."     → projects (inline)
 */

// ─── Two-line split headers ────────────────────────────────────────────────────
// e.g. line[i]="Career"  line[i+1]="Objective blah blah..."
const SPLIT_HEADERS = [
  { a: /^career$/i,        b: /^objective\b/i,  section: "summary" },
  { a: /^technical$/i,     b: /^skills?\b/i,    section: "skills"  },
  { a: /^achievements&$/i, b: /^activities\b/i, section: "awards"  },
];

// ─── Single-line exact headers (whole line = header keyword only) ──────────────
const EXACT_HEADERS = [
  { re: /^(summary|professional summary|career objective|objective|profile|about me)$/i, section: "summary"        },
  { re: /^(skills|technical skills)$/i,                                                  section: "skills"         },
  { re: /^(experience|work experience|professional experience|internships?)$/i,          section: "experience"     },
  { re: /^(education|educational background)$/i,                                         section: "education"      },
  { re: /^(projects?|portfolio|personal projects?)$/i,                                   section: "projects"       },
  { re: /^(certifications?|licenses?|credentials?)$/i,                                  section: "certifications" },
  { re: /^(achievements?\s*[&]\s*activities?|achievements?|awards?|honors?)$/i,          section: "awards"         },
  { re: /^(additional information|additional|interests?)$/i,                             section: "additional"     },
  { re: /^languages?$/i,                                                                 section: "languages"      },
];

// ─── Inline headers — header keyword starts the line, content follows ──────────
const INLINE_HEADERS = [
  { re: /^(career\s+objective)\s+/i,     section: "summary",    strip: /^career\s+objective\s+/i     },
  { re: /^(technical\s+skills?)\s+/i,    section: "skills",     strip: /^technical\s+skills?\s+/i    },
  { re: /^projects?\s+[A-Z\-]/i,         section: "projects",   strip: /^projects?\s+/i              },
  { re: /^education\s+[A-Z]/i,           section: "education",  strip: /^education\s+/i              },
  { re: /^additional\s+information\s*/i, section: "additional", strip: /^additional\s+information\s*/i },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseContact(text) {
  return {
    raw:       text,
    name:      (text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/) || [])[1]          || null,
    email:     (text.match(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/) || [])[0]        || null,
    phone:     (text.match(/\+?\d[\d\s\-]{7,}\d/) || [])[0]?.trim()          || null,
    linkedin:  /linked\s*in/i.test(text)  ? "LinkedIn (see resume)"           : null,
    github:    /git\s*hub/i.test(text)    ? "GitHub (see resume)"             : null,
    portfolio: /portfolio/i.test(text)    ? "Portfolio (see resume)"          : null,
  };
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export function extractSections(text) {
  if (!text || typeof text !== "string") {
    throw new Error("extractSections: input must be a non-empty string.");
  }

  // Split into lines, keep only non-empty with their positions
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines
    .map((line, i) => ({ i, line: line.trim() }))
    .filter((e) => e.line);

  const sectionBuffers = { contact: [] };
  let currentSection   = "contact";

  let i = 0;
  while (i < nonEmpty.length) {
    const { line } = nonEmpty[i];
    let matched = false;

    // ── 1. Two-line split header ─────────────────────────────────────────────
    if (i + 1 < nonEmpty.length) {
      const nextLine = nonEmpty[i + 1].line;
      for (const { a, b, section } of SPLIT_HEADERS) {
        if (a.test(line) && b.test(nextLine)) {
          currentSection = section;
          if (!sectionBuffers[section]) sectionBuffers[section] = [];
          // Content after the keyword on the B line
          const content = nextLine.replace(b, "").trim();
          if (content) sectionBuffers[section].push(content);
          i += 2;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // ── 2. Exact single-line header ──────────────────────────────────────────
    for (const { re, section } of EXACT_HEADERS) {
      if (re.test(line)) {
        currentSection = section;
        if (!sectionBuffers[section]) sectionBuffers[section] = [];
        matched = true;
        break;
      }
    }
    if (matched) { i++; continue; }

    // ── 3. Inline header + content on same line ──────────────────────────────
    for (const { re, section, strip } of INLINE_HEADERS) {
      if (re.test(line)) {
        currentSection = section;
        if (!sectionBuffers[section]) sectionBuffers[section] = [];
        const content = line.replace(strip, "").trim();
        if (content) sectionBuffers[section].push(content);
        matched = true;
        break;
      }
    }
    if (matched) { i++; continue; }

    // ── 4. Regular content line ──────────────────────────────────────────────
    if (!sectionBuffers[currentSection]) sectionBuffers[currentSection] = [];
    sectionBuffers[currentSection].push(line);
    i++;
  }

  // ── Build final sections object ────────────────────────────────────────────
  const result = {
    contact:        null,
    summary:        null,
    skills:         null,
    experience:     null,
    education:      null,
    projects:       null,
    certifications: null,
    languages:      null,
    awards:         null,
    additional:     null,
  };

  for (const [key, bufLines] of Object.entries(sectionBuffers)) {
    const cleaned = bufLines.join("\n").trim();
    if (!cleaned) continue;
    if (key in result) {
      result[key] = key === "contact" ? parseContact(cleaned) : cleaned;
    }
  }

  return result;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

export function getSection(sections, key) {
  return sections?.[key] ?? "";
}

export function listAvailableSections(sections) {
  return Object.entries(sections)
    .filter(([, val]) => val !== null && val !== "")
    .map(([key]) => key);
}