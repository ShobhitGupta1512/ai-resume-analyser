import { create } from 'zustand'

/**
 * Global resume analysis store.
 * Matches the actions used in useResumeUpload.js:
 *   setRawFile(file)  — called immediately on upload start
 *   setResult(data)   — called after successful /api/upload
 *   clearAnalysis()   — wipe everything for a new run
 */
const useResumeStore = create((set) => ({
  // ── Raw file (set immediately so navbar can show filename) ─────────────────
  rawFile:     null,   // File object

  // ── API response fields ────────────────────────────────────────────────────
  sections:    null,   // { contact, summary, skills, experience, education, projects, certifications, awards, additional }
  skills:      null,   // { grouped, all, totalCount }
  atsScore:    null,   // { totalScore, grade, label, color, categories, suggestions }
  matchResult: null,   // { matchScore, matchLabel, matchedKeywords, missingKeywords } | null
  feedback:    null,   // { overallFeedback, strengths, improvements, missingKeywords, rewrittenSummary, quickWins, source }

  // ── Meta ───────────────────────────────────────────────────────────────────
  analysedAt:  null,   // ISO timestamp

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Store the raw File immediately (before API responds) */
  setRawFile: (file) => set({ rawFile: file }),

  /** Populate store from API response */
  setResult: (data) => set({
    sections:    data.sections    ?? null,
    skills:      data.skills      ?? null,
    atsScore:    data.atsScore    ?? null,
    matchResult: data.matchResult ?? null,
    feedback:    data.feedback    ?? null,
    analysedAt:  new Date().toISOString(),
  }),

  /** Wipe everything for a fresh analysis */
  clearAnalysis: () => set({
    rawFile:     null,
    sections:    null,
    skills:      null,
    atsScore:    null,
    matchResult: null,
    feedback:    null,
    analysedAt:  null,
  }),
}))

export default useResumeStore