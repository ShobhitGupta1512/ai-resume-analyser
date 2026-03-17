/**
 * utils/matchJobDescription.js
 * AI Resume Analyser — Job Description Matcher
 *
 * Compares a resume against a job description and returns:
 *   - matchScore (0–100)
 *   - matchedKeywords   — skills/keywords found in BOTH
 *   - missingKeywords   — keywords in JD but NOT in resume
 *   - extraKeywords     — resume skills not mentioned in JD
 *   - sectionScores     — per-section relevance
 *   - suggestions       — actionable tips to improve match
 */

// ─── Common filler words to ignore ────────────────────────────────────────────
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","as","is","are","was","were","be","been","being","have",
  "has","had","do","does","did","will","would","could","should","may",
  "might","shall","must","can","need","this","that","these","those",
  "we","you","they","he","she","it","i","our","your","their","its",
  "not","no","so","if","then","than","also","just","more","about",
  "into","up","out","over","after","before","between","through","during",
  "experience","work","team","role","strong","good","great","excellent",
  "ability","skills","knowledge","understanding","looking","seeking",
  "required","preferred","plus","bonus","including","such","well",
  "using","used","use","etc","via","per","within","across","under",
]);

// ─── Tech synonyms — treat these as the same keyword ──────────────────────────
const SYNONYMS = {
  "js":           "javascript",
  "javascript":   "javascript",
  "ts":           "typescript",
  "typescript":   "typescript",
  "node":         "node.js",
  "node.js":      "node.js",
  "nodejs":       "node.js",
  "react":        "react",
  "reactjs":      "react",
  "react.js":     "react",
  "next":         "next.js",
  "next.js":      "next.js",
  "nextjs":       "next.js",
  "express":      "express.js",
  "express.js":   "express.js",
  "expressjs":    "express.js",
  "mongo":        "mongodb",
  "mongodb":      "mongodb",
  "postgres":     "postgresql",
  "postgresql":   "postgresql",
  "mysql":        "mysql",
  "rest":         "rest api",
  "restful":      "rest api",
  "rest api":     "rest api",
  "restful api":  "rest api",
  "git":          "git",
  "github":       "git",
  "py":           "python",
  "python":       "python",
  "ml":           "machine learning",
  "machine learning": "machine learning",
  "ai":           "artificial intelligence",
  "artificial intelligence": "artificial intelligence",
  "css":          "css",
  "html":         "html",
  "aws":          "aws",
  "amazon web services": "aws",
  "gcp":          "gcp",
  "google cloud": "gcp",
  "docker":       "docker",
  "kubernetes":   "kubernetes",
  "k8s":          "kubernetes",
  "ci/cd":        "ci/cd",
  "cicd":         "ci/cd",
};

// ─── Keyword importance tiers (higher = more important to match) ───────────────
const TIER_1_KEYWORDS = new Set([
  // Core tech skills — highest weight
  "javascript","typescript","python","java","c++","c#","go","rust","swift","kotlin",
  "react","next.js","vue","angular","node.js","express.js","django","flask","spring",
  "mongodb","postgresql","mysql","redis","firebase","supabase",
  "aws","gcp","azure","docker","kubernetes","ci/cd",
  "machine learning","deep learning","tensorflow","pytorch","opencv","keras",
  "rest api","graphql","microservices","sql","nosql",
]);

const TIER_2_KEYWORDS = new Set([
  // Methodologies, tools — medium weight
  "agile","scrum","git","linux","postman","figma","jira","jest","testing",
  "html","css","tailwind","bootstrap","redux","context api",
  "full-stack","backend","frontend","devops","cloud","serverless",
]);

// ─── Text Processing ───────────────────────────────────────────────────────────

function normalizeWord(word) {
  const cleaned = word
    .toLowerCase()
    .replace(/[^a-z0-9.+#/]/g, "")
    .trim();
  return SYNONYMS[cleaned] || cleaned;
}

function extractKeywords(text) {
  if (!text) return new Set();

  const keywords = new Set();

  // First pass: extract multi-word tech phrases
  const multiWordPhrases = [
    "machine learning","deep learning","natural language processing",
    "computer vision","data science","full stack","full-stack",
    "rest api","restful api","web development","software engineer",
    "problem solving","object oriented","data structures","ci/cd",
    "version control","agile methodology","test driven",
  ];

  const lowerText = text.toLowerCase();
  for (const phrase of multiWordPhrases) {
    if (lowerText.includes(phrase)) {
      keywords.add(SYNONYMS[phrase] || phrase);
    }
  }

  // Second pass: single word tokens
  const tokens = text
    .toLowerCase()
    .replace(/[(),;:\n\r\t]/g, " ")
    .split(/[\s/|&+]+/)
    .map(normalizeWord)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  for (const token of tokens) {
    keywords.add(token);
  }

  return keywords;
}

// ─── Scoring Logic ─────────────────────────────────────────────────────────────

function getKeywordWeight(keyword) {
  if (TIER_1_KEYWORDS.has(keyword)) return 3;
  if (TIER_2_KEYWORDS.has(keyword)) return 2;
  return 1;
}

function calculateMatchScore(jdKeywords, resumeKeywords) {
  if (jdKeywords.size === 0) return 0;

  let totalWeight  = 0;
  let matchedWeight = 0;

  for (const kw of jdKeywords) {
    const weight = getKeywordWeight(kw);
    totalWeight += weight;
    if (resumeKeywords.has(kw)) matchedWeight += weight;
  }

  return totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);
}

// ─── Section Relevance ─────────────────────────────────────────────────────────

function scoreSections(sections, jdKeywords) {
  const sectionScores = {};
  const checkSections = ["summary", "skills", "experience", "projects", "education"];

  for (const key of checkSections) {
    const text = typeof sections[key] === "string" ? sections[key] : "";
    if (!text) { sectionScores[key] = { score: 0, matched: [] }; continue; }

    const sectionKws  = extractKeywords(text);
    const matched     = [...jdKeywords].filter((kw) => sectionKws.has(kw));
    const score       = jdKeywords.size
      ? Math.round((matched.length / jdKeywords.size) * 100)
      : 0;

    sectionScores[key] = { score, matched };
  }

  return sectionScores;
}

// ─── Suggestions Generator ────────────────────────────────────────────────────

function generateSuggestions(missingKeywords, matchScore, sectionScores) {
  const suggestions = [];

  if (matchScore < 40) {
    suggestions.push("Your resume matches less than 40% of the job description. Consider tailoring it specifically for this role.");
  } else if (matchScore < 60) {
    suggestions.push("You're at a moderate match. Adding more job-specific keywords will significantly improve your chances.");
  } else if (matchScore < 80) {
    suggestions.push("Good match! A few more targeted keywords will push you into the strong candidate range.");
  } else {
    suggestions.push("Excellent match! Your resume is well-aligned with this job description.");
  }

  // Top missing critical keywords
  const criticalMissing = missingKeywords
    .filter((kw) => TIER_1_KEYWORDS.has(kw))
    .slice(0, 5);

  if (criticalMissing.length > 0) {
    suggestions.push(
      `Add these high-priority missing keywords to your resume: ${criticalMissing.join(", ")}.`
    );
  }

  // Section-specific tips
  if (sectionScores.summary?.score < 30) {
    suggestions.push("Update your Summary/Objective to include more keywords from the job description.");
  }
  if (sectionScores.skills?.score < 40) {
    suggestions.push("Your Skills section is missing several job-required technologies. Add the missing keywords there.");
  }
  if (sectionScores.projects?.score < 30) {
    suggestions.push("Reframe your project descriptions to highlight technologies mentioned in the job description.");
  }

  return suggestions;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * matchJobDescription(sections, skillsAll, jobDescriptionText)
 *
 * @param {object}   sections           — from extractSections()
 * @param {string[]} skillsAll          — flat skills array from extractSkills()
 * @param {string}   jobDescriptionText — raw job description pasted by user
 * @returns {object} full match report
 */
export function matchJobDescription(sections, skillsAll, jobDescriptionText) {
  if (!jobDescriptionText || jobDescriptionText.trim().length < 20) {
    throw new Error("matchJobDescription: job description text is too short or empty.");
  }

  // Extract keywords from JD and resume
  const jdKeywords     = extractKeywords(jobDescriptionText);
  const resumeText     = [
    typeof sections.contact  === "object" ? sections.contact?.raw : sections.contact,
    sections.summary,
    sections.skills,
    sections.experience,
    sections.projects,
    sections.education,
    sections.awards,
    sections.additional,
    ...(skillsAll || []),
  ].filter(Boolean).join(" ");

  const resumeKeywords = extractKeywords(resumeText);

  // Find matched / missing / extra keywords
  const matchedKeywords = [...jdKeywords].filter((kw) => resumeKeywords.has(kw));
  const missingKeywords = [...jdKeywords].filter((kw) => !resumeKeywords.has(kw) && kw.length > 2);
  const extraKeywords   = [...resumeKeywords].filter((kw) => !jdKeywords.has(kw) && kw.length > 2);

  // Calculate overall match score
  const matchScore  = calculateMatchScore(jdKeywords, resumeKeywords);

  // Per-section relevance
  const sectionScores = scoreSections(sections, jdKeywords);

  // Match label
  let matchLabel = "Poor Match";
  if      (matchScore >= 80) matchLabel = "Excellent Match";
  else if (matchScore >= 65) matchLabel = "Good Match";
  else if (matchScore >= 45) matchLabel = "Moderate Match";
  else if (matchScore >= 25) matchLabel = "Weak Match";

  // Suggestions
  const suggestions = generateSuggestions(missingKeywords, matchScore, sectionScores);

  return {
    matchScore,                      // 0–100
    matchLabel,                      // "Excellent Match" etc.
    totalJDKeywords:   jdKeywords.size,
    matchedCount:      matchedKeywords.length,
    missingCount:      missingKeywords.length,
    matchedKeywords:   matchedKeywords.sort(),
    missingKeywords:   missingKeywords.sort(),
    extraKeywords:     extraKeywords.slice(0, 20), // top 20 extras
    sectionScores,
    suggestions,
  };
}