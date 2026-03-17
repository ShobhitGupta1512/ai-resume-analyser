/**
 * utils/scoreResume.js
 * AI Resume Analyser — ATS Score Calculator
 *
 * Scores a resume out of 100 across 5 categories:
 *   1. Completeness   (25pts) — are key sections present?
 *   2. Skills         (25pts) — how many relevant skills found?
 *   3. Summary        (15pts) — is there a strong objective/summary?
 *   4. Experience     (15pts) — projects/experience content quality
 *   5. Formatting     (20pts) — contact info, length, keywords, structure
 */

// ─── Weights ───────────────────────────────────────────────────────────────────

const WEIGHTS = {
  completeness: 25,
  skills:       25,
  summary:      15,
  experience:   15,
  formatting:   20,
};

// ─── 1. COMPLETENESS — checks which key sections exist ────────────────────────

function scoreCompleteness(sections) {
  const checks = [
    { key: "contact",    points: 5,  label: "Contact info"     },
    { key: "summary",    points: 5,  label: "Summary/Objective"},
    { key: "skills",     points: 5,  label: "Skills section"   },
    { key: "education",  points: 5,  label: "Education"        },
    { key: "projects",   points: 5,  label: "Projects/Experience"},
  ];

  let earned = 0;
  const breakdown = [];

  for (const { key, points, label } of checks) {
    const exists = sections[key] &&
      (typeof sections[key] === "string"
        ? sections[key].trim().length > 10
        : sections[key]?.name || sections[key]?.email);

    breakdown.push({ label, earned: exists ? points : 0, max: points, present: !!exists });
    if (exists) earned += points;
  }

  return { score: earned, max: WEIGHTS.completeness, breakdown };
}

// ─── 2. SKILLS — based on total unique skills found ───────────────────────────

function scoreSkills(skillsData) {
  const total = skillsData?.totalCount || 0;
  const groupCount = Object.keys(skillsData?.grouped || {}).length;

  // Scoring scale:
  // 20+ skills across 4+ categories = full marks
  // 15-19 skills = 20pts
  // 10-14 skills = 15pts
  // 5-9   skills = 10pts
  // 1-4   skills = 5pts
  // 0     skills = 0pts

  let earned = 0;
  if      (total >= 20 && groupCount >= 4) earned = 25;
  else if (total >= 15)                    earned = 20;
  else if (total >= 10)                    earned = 15;
  else if (total >= 5)                     earned = 10;
  else if (total >= 1)                     earned = 5;

  const breakdown = [
    { label: "Total unique skills",    value: total      },
    { label: "Skill categories found", value: groupCount },
  ];

  return { score: earned, max: WEIGHTS.skills, breakdown };
}

// ─── 3. SUMMARY — quality of the career objective/summary ────────────────────

const STRONG_SUMMARY_KEYWORDS = [
  "experience", "engineer", "developer", "seeking", "passionate",
  "proficient", "skilled", "background", "expertise", "graduate",
  "full-stack", "mern", "ai", "machine learning", "software",
  "solutions", "scalable", "production", "entry-level", "professional",
];

function scoreSummary(summaryText) {
  if (!summaryText || summaryText.trim().length < 20) {
    return {
      score: 0,
      max: WEIGHTS.summary,
      breakdown: [{ label: "No summary/objective found", value: "missing" }],
    };
  }

  const lower    = summaryText.toLowerCase();
  const words    = summaryText.trim().split(/\s+/).length;
  const hits     = STRONG_SUMMARY_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  let earned = 0;

  // Length scoring (max 7pts)
  if      (words >= 40) earned += 7;
  else if (words >= 25) earned += 5;
  else if (words >= 10) earned += 3;

  // Keyword richness (max 8pts)
  if      (hits >= 5) earned += 8;
  else if (hits >= 3) earned += 6;
  else if (hits >= 1) earned += 3;

  earned = Math.min(earned, WEIGHTS.summary);

  return {
    score: earned,
    max: WEIGHTS.summary,
    breakdown: [
      { label: "Word count",          value: words },
      { label: "Keyword hits",        value: hits  },
    ],
  };
}

// ─── 4. EXPERIENCE / PROJECTS — content quality ───────────────────────────────

const ACTION_VERBS = [
  "built", "developed", "designed", "created", "implemented", "deployed",
  "integrated", "optimized", "led", "managed", "delivered", "engineered",
  "architected", "automated", "collaborated", "improved", "reduced",
  "increased", "launched", "maintained", "solved", "contributed",
];

const IMPACT_KEYWORDS = [
  "performance", "scalable", "production", "users", "api", "database",
  "authentication", "real-time", "efficiency", "automated", "reduced",
  "increased", "improved", "%", "team", "system",
];

function scoreExperience(sections) {
  const text = [sections.experience, sections.projects]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!text || text.trim().length < 30) {
    return {
      score: 0,
      max: WEIGHTS.experience,
      breakdown: [{ label: "No experience/projects found", value: "missing" }],
    };
  }

  const actionHits = ACTION_VERBS.filter((v) => text.includes(v)).length;
  const impactHits = IMPACT_KEYWORDS.filter((k) => text.includes(k)).length;
  const wordCount  = text.trim().split(/\s+/).length;

  let earned = 0;

  // Word count (max 5pts)
  if      (wordCount >= 150) earned += 5;
  else if (wordCount >= 80)  earned += 4;
  else if (wordCount >= 30)  earned += 2;

  // Action verbs (max 5pts)
  if      (actionHits >= 6) earned += 5;
  else if (actionHits >= 3) earned += 4;
  else if (actionHits >= 1) earned += 2;

  // Impact keywords (max 5pts)
  if      (impactHits >= 5) earned += 5;
  else if (impactHits >= 3) earned += 3;
  else if (impactHits >= 1) earned += 2;

  earned = Math.min(earned, WEIGHTS.experience);

  return {
    score: earned,
    max: WEIGHTS.experience,
    breakdown: [
      { label: "Content word count", value: wordCount  },
      { label: "Action verbs used",  value: actionHits },
      { label: "Impact keywords",    value: impactHits },
    ],
  };
}

// ─── 5. FORMATTING — contact completeness, structure signals ─────────────────

function scoreFormatting(sections, rawText) {
  let earned = 0;
  const breakdown = [];

  // Contact fields (max 10pts)
  const contact = sections.contact || {};
  const hasEmail    = !!contact.email;
  const hasPhone    = !!contact.phone;
  const hasLinkedin = !!contact.linkedin;
  const hasGithub   = !!contact.github;
  const hasName     = !!contact.name;

  const contactScore = [hasName, hasEmail, hasPhone, hasLinkedin, hasGithub]
    .filter(Boolean).length * 2; // 2pts each = max 10

  earned += contactScore;
  breakdown.push({
    label:  "Contact completeness",
    value:  `${contactScore}/10`,
    detail: { name: hasName, email: hasEmail, phone: hasPhone, linkedin: hasLinkedin, github: hasGithub },
  });

  // Resume length (max 5pts)
  const wordCount = rawText?.trim().split(/\s+/).length || 0;
  let lengthScore = 0;
  if      (wordCount >= 300 && wordCount <= 800) lengthScore = 5;
  else if (wordCount >= 200)                      lengthScore = 3;
  else if (wordCount >= 100)                      lengthScore = 1;
  earned += lengthScore;
  breakdown.push({ label: "Resume length (words)", value: wordCount });

  // Education present (max 5pts)
  const hasEducation = !!(sections.education?.trim().length > 10);
  earned += hasEducation ? 5 : 0;
  breakdown.push({ label: "Education details", value: hasEducation ? "present" : "missing" });

  earned = Math.min(earned, WEIGHTS.formatting);

  return { score: earned, max: WEIGHTS.formatting, breakdown };
}

// ─── Grade Helper ──────────────────────────────────────────────────────────────

function getGrade(score) {
  if (score >= 85) return { grade: "A",  label: "Excellent",    color: "#22c55e" };
  if (score >= 70) return { grade: "B",  label: "Good",         color: "#84cc16" };
  if (score >= 55) return { grade: "C",  label: "Average",      color: "#eab308" };
  if (score >= 40) return { grade: "D",  label: "Needs Work",   color: "#f97316" };
  return               { grade: "F",  label: "Poor",         color: "#ef4444" };
}

// ─── Suggestions Generator ────────────────────────────────────────────────────

function generateSuggestions(results, sections) {
  const suggestions = [];

  if (!sections.summary || sections.summary.trim().length < 20)
    suggestions.push("Add a Career Objective or Professional Summary section.");

  if (!sections.experience && !sections.projects)
    suggestions.push("Add a Projects or Work Experience section with detailed descriptions.");

  if (!sections.certifications)
    suggestions.push("Consider adding Certifications to strengthen your profile.");

  if (!sections.contact?.linkedin)
    suggestions.push("Add your LinkedIn profile URL to the resume.");

  if (!sections.contact?.github)
    suggestions.push("Add your GitHub profile URL to showcase your code.");

  if (results.skills.score < 15)
    suggestions.push("List more technical skills — aim for 15+ across multiple categories.");

  if (results.summary.score < 8)
    suggestions.push("Expand your summary with more keywords and specific goals (aim for 40+ words).");

  if (results.experience.score < 8)
    suggestions.push("Use strong action verbs (Built, Developed, Led) and quantify your impact.");

  if (results.formatting.score < 12)
    suggestions.push("Ensure your resume has complete contact info: name, email, phone, LinkedIn, GitHub.");

  return suggestions;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * scoreResume(sections, skillsData, rawText)
 *
 * @param {object} sections   — from extractSections()
 * @param {object} skillsData — from extractSkills()  { grouped, all, totalCount }
 * @param {string} rawText    — cleaned resume text
 * @returns {object} full ATS score report
 */
export function scoreResume(sections, skillsData, rawText) {
  const results = {
    completeness: scoreCompleteness(sections),
    skills:       scoreSkills(skillsData),
    summary:      scoreSummary(sections.summary),
    experience:   scoreExperience(sections),
    formatting:   scoreFormatting(sections, rawText),
  };

  const totalScore = Object.values(results).reduce((sum, r) => sum + r.score, 0);
  const { grade, label, color } = getGrade(totalScore);
  const suggestions = generateSuggestions(results, sections);

  return {
    totalScore,                    // 0–100
    maxScore: 100,
    grade,                         // A / B / C / D / F
    label,                         // "Excellent" / "Good" etc.
    color,                         // hex color for UI
    categories: {
      completeness: { ...results.completeness, weight: WEIGHTS.completeness },
      skills:       { ...results.skills,       weight: WEIGHTS.skills       },
      summary:      { ...results.summary,      weight: WEIGHTS.summary      },
      experience:   { ...results.experience,   weight: WEIGHTS.experience   },
      formatting:   { ...results.formatting,   weight: WEIGHTS.formatting   },
    },
    suggestions,                   // array of improvement tips
  };
}