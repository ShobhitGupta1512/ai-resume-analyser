/**
 * utils/generateFeedback.js
 * AI Resume Analyser — AI-Powered Feedback Generator
 * Uses Groq API (LLaMA 3.1) — Final Correct Version
 *
 * Setup:
 *   1. Go to https://console.groq.com
 *   2. Create free account → API Keys → Create Key
 *   3. Add to .env: GROQ_API_KEY=your_key_here
 */

const GROQ_API_URL     = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL       = "llama-3.1-8b-instant";
const MAX_TOKENS       = 1500;
const MAX_PROMPT_CHARS = 5000;
const MAX_RETRIES      = 3;
const RETRY_DELAY_MS   = 1000;

const REQUIRED_FIELDS = [
  "overallFeedback",
  "strengths",
  "improvements",
  "missingKeywords",
  "rewrittenSummary",
  "quickWins",
];

// ─── Input Validator ───────────────────────────────────────────────────────────

function validateInput(sections, atsScore) {
  if (!sections || typeof sections !== "object") {
    throw new Error("generateFeedback: 'sections' must be a non-null object.");
  }
  if (
    !sections.summary &&
    !sections.skills &&
    !sections.projects &&
    !sections.experience
  ) {
    throw new Error(
      "generateFeedback: sections must have at least one of: summary, skills, projects, experience."
    );
  }
  if (atsScore && typeof atsScore.totalScore !== "number") {
    throw new Error("generateFeedback: atsScore.totalScore must be a number.");
  }
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildPrompt({ sections, atsScore, matchResult, jobDescription }) {
  const name = sections.contact?.name || "the candidate";

  let prompt = `You are an expert resume coach and ATS specialist. Analyse this resume for ${name} and give highly specific actionable feedback.

ATS SCORE: ${atsScore?.totalScore ?? "N/A"}/100 (${atsScore?.label ?? ""})

RESUME SECTIONS:
`;

  const addSection = (label, text, maxChars = 600) => {
    if (!text || typeof text !== "string") return;
    const truncated = text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
    prompt += `\n[${label}]\n${truncated}\n`;
  };

  addSection("Summary/Objective", sections.summary,    400);
  addSection("Skills",            sections.skills,     500);
  addSection("Projects",          sections.projects,   600);
  addSection("Experience",        sections.experience, 400);
  addSection("Education",         sections.education,  200);
  addSection("Achievements",      sections.awards,     200);

  if (jobDescription && jobDescription.trim().length > 20) {
    const jdTrunc = jobDescription.length > 600
      ? jobDescription.slice(0, 600) + "..."
      : jobDescription;
    prompt += `\nJOB DESCRIPTION:\n${jdTrunc}\n`;
  }

  if (matchResult) {
    const matched = matchResult.matchedKeywords?.slice(0, 10).join(", ") || "none";
    const missing = matchResult.missingKeywords?.slice(0, 10).join(", ") || "none";
    prompt += `\nJOB MATCH: ${matchResult.matchScore}/100 (${matchResult.matchLabel})\nMatched: ${matched}\nMissing: ${missing}\n`;
  }

  if (prompt.length > MAX_PROMPT_CHARS) {
    prompt = prompt.slice(0, MAX_PROMPT_CHARS) + "\n[truncated]\n";
  }

  prompt += `
Return ONLY this JSON object, no markdown, no extra text:
{
  "overallFeedback": "2-3 sentence assessment specific to this candidate",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": [
    {
      "section": "section name",
      "issue": "specific problem found",
      "suggestion": "exact actionable fix",
      "priority": "high | medium | low"
    }
  ],
  "missingKeywords": ["keyword1", "keyword2"],
  "rewrittenSummary": "stronger ATS-friendly rewrite of their summary",
  "quickWins": ["quick tip 1", "quick tip 2", "quick tip 3"]
}`;

  return prompt;
}

// ─── Response Validator ────────────────────────────────────────────────────────

function validateResponse(parsed) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in parsed)) {
      throw new Error(`AI response missing required field: "${field}"`);
    }
  }
  if (!Array.isArray(parsed.strengths))    throw new Error("'strengths' must be an array.");
  if (!Array.isArray(parsed.improvements)) throw new Error("'improvements' must be an array.");
  if (!Array.isArray(parsed.quickWins))    throw new Error("'quickWins' must be an array.");
}

// ─── Sleep helper ──────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Groq API Caller ───────────────────────────────────────────────────────────

async function callGroqAPI(prompt, attempt = 1) {
  console.log(`Calling Groq API... (attempt ${attempt})`);

  let response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: 0.3,
        messages: [
          {
            role:    "system",
            content: "You are an expert resume coach. Always respond with valid JSON only. No markdown, no extra text.",
          },
          {
            role:    "user",
            content: prompt,
          },
        ],
      }),
    });
  } catch (networkErr) {
    console.error("Groq network error:", networkErr.message);
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return callGroqAPI(prompt, attempt + 1);
    }
    throw new Error(`Groq API unreachable: ${networkErr.message}`);
  }

  console.log(`Groq response status: ${response.status}`);

  if (response.status === 401) {
    throw new Error("Invalid GROQ_API_KEY — check your .env file.");
  }

  if (response.status === 429) {
    if (attempt < MAX_RETRIES) {
      const retryAfter = parseInt(response.headers.get("retry-after") || "5", 10);
      console.warn(`Groq rate limited. Waiting ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      return callGroqAPI(prompt, attempt + 1);
    }
    throw new Error("Groq rate limit exceeded.");
  }

  if (response.status >= 500) {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt * 2);
      return callGroqAPI(prompt, attempt + 1);
    }
    throw new Error(`Groq server error ${response.status}`);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const raw  = data.choices?.[0]?.message?.content || "";

  console.log("Groq raw response received ✅");

  if (!raw.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.error("Unparseable Groq response:", raw.slice(0, 500));
        throw new Error("Could not parse Groq JSON response.");
      }
    } else {
      console.error("No JSON in Groq response:", raw.slice(0, 500));
      throw new Error("No JSON found in Groq response.");
    }
  }

  validateResponse(parsed);
  console.log("Groq feedback generated successfully ✅");
  return parsed;
}

// ─── Rule-based Fallback ───────────────────────────────────────────────────────

function generateRuleBasedFeedback(sections, atsScore, matchResult) {
  const strengths    = [];
  const improvements = [];
  const quickWins    = [];

  if (sections.projects)          strengths.push("Has real project experience demonstrating practical skills.");
  if (sections.skills)            strengths.push("Skills section is present and well categorized.");
  if (sections.contact?.github)   strengths.push("GitHub profile included — great for technical roles.");
  if (sections.contact?.linkedin) strengths.push("LinkedIn profile is listed.");
  if (sections.awards)            strengths.push("Achievements section shows initiative beyond academics.");
  if (sections.education)         strengths.push("Education section is clearly detailed.");

  if (!sections.experience) {
    improvements.push({
      section:    "Experience",
      issue:      "No work experience section found.",
      suggestion: "Add internships, freelance work, or open source contributions. Even a 1-month internship counts.",
      priority:   "high",
    });
  }

  if (!sections.certifications) {
    improvements.push({
      section:    "Certifications",
      issue:      "No certifications listed.",
      suggestion: "Add free certifications: AWS Cloud Practitioner, Google IT Support, or Meta Frontend Developer.",
      priority:   "medium",
    });
  }

  const summaryWords = sections.summary?.split(/\s+/).length || 0;
  if (summaryWords > 0 && summaryWords < 30) {
    improvements.push({
      section:    "Summary",
      issue:      `Summary is too short (${summaryWords} words).`,
      suggestion: "Expand to 40-60 words. Mention your tech stack, target role, and 1 key achievement.",
      priority:   "high",
    });
  }

  if (!sections.summary) {
    improvements.push({
      section:    "Summary",
      issue:      "No summary or career objective found.",
      suggestion: "Add a 3-4 sentence professional summary at the top of your resume.",
      priority:   "high",
    });
  }

  if (atsScore?.totalScore < 70) {
    improvements.push({
      section:    "Overall ATS",
      issue:      `ATS score is ${atsScore.totalScore}/100 — below the recommended 70+.`,
      suggestion: "Expand project descriptions, add more technical keywords, and ensure all major sections are present.",
      priority:   "high",
    });
  }

  if (matchResult?.missingKeywords?.length > 3) {
    improvements.push({
      section:    "Keywords",
      issue:      `Missing ${matchResult.missingKeywords.length} keywords from the job description.`,
      suggestion: `Naturally add these to your skills or projects: ${matchResult.missingKeywords.slice(0, 6).join(", ")}.`,
      priority:   "high",
    });
  }

  quickWins.push("Add metrics to projects — e.g. 'served 500+ users', 'reduced API response time by 40%'.");
  quickWins.push("Use action verbs at the start of every bullet: Built, Developed, Designed, Deployed, Optimized.");
  quickWins.push("Pin your best GitHub repositories so recruiters see them immediately.");
  quickWins.push("Keep resume to 1 page — replace irrelevant content with skills or projects.");

  return {
    overallFeedback: `Your resume scores ${atsScore?.totalScore ?? "N/A"}/100 (${atsScore?.label ?? ""}). ${
      atsScore?.totalScore >= 70
        ? "You have a solid foundation — targeted improvements will push you into the top candidate range."
        : "There is significant room for improvement. Focus on the high-priority items below."
    }`,
    strengths:        strengths.slice(0, 4),
    improvements,
    missingKeywords:  matchResult?.missingKeywords?.slice(0, 10) || [],
    rewrittenSummary: null,
    quickWins,
  };
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export async function generateFeedback({
  sections,
  atsScore       = null,
  matchResult    = null,
  jobDescription = null,
}) {
  console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "✅ Found" : "❌ Missing");

  validateInput(sections, atsScore);

  if (!process.env.GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not set — using rule-based feedback.");
    return {
      ...generateRuleBasedFeedback(sections, atsScore, matchResult),
      source: "rule-based",
    };
  }

  try {
    const prompt   = buildPrompt({ sections, atsScore, matchResult, jobDescription });
    const feedback = await callGroqAPI(prompt);
    return { ...feedback, source: "ai-groq" };
  } catch (error) {
    console.error("Groq API failed:", error.message);
    return {
      ...generateRuleBasedFeedback(sections, atsScore, matchResult),
      source: "rule-based-fallback",
      error:  error.message,
    };
  }
}