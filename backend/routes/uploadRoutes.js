/**
 * routes/uploadRoutes.js  (UPDATED — auth added, your original logic 100% preserved)
 * AI Resume Analyser
 *
 * Only 3 things changed from your original:
 *   1. Added:  import { protect } from "../middleware/authMiddleware.js"
 *   2. Added:  import User from "../models/User.js"
 *   3. Each route now has `protect` as middleware
 *   4. POST /upload saves result to user.resumeHistory after analysis
 *   5. NEW: GET  /history         → user's last 20 uploads
 *   6. NEW: DELETE /history/:id  → delete one history entry
 *
 * multer disk storage, parsePDF(filePath), deleteFile, skillsInput string-join,
 * generateFeedback({ sections, atsScore, matchResult, jobDescription }) shape
 * — ALL identical to your original. Nothing else was touched.
 */

import express       from "express";
import multer        from "multer";
import PDFParser     from "pdf2json";
import fs            from "fs";
import path          from "path";
import { cleanResumeText }     from "../utils/cleanResumeText.js";
import { extractSkills }       from "../utils/skillExtractor.js";
import { extractSections }     from "../utils/extractSections.js";
import { scoreResume }         from "../utils/scoreResume.js";
import { matchJobDescription } from "../utils/matchJobDescription.js";
import { generateFeedback }    from "../utils/generateFeedback.js";
import { protect }             from "../middleware/authMiddleware.js";  // ← NEW
import User                    from "../models/user.js";                // ← NEW

const router = express.Router();

// ─── Multer Config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") cb(null, true);
    else cb(new Error("Only PDF files are supported"), false);
  },
});

// ─── Helper: parse PDF → raw text ─────────────────────────────────────────────
const parsePDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    const originalWarn  = console.warn;
    const originalError = console.error;
    const suppressedPatterns = [
      /Unsupported.*field\.type/i,
      /NOT valid form element/i,
      /pdfParser_dataError/i,
    ];
    const shouldSuppress = (msg) =>
      suppressedPatterns.some((re) => re.test(String(msg)));

    console.warn  = (...args) => { if (!shouldSuppress(args[0])) originalWarn(...args); };
    console.error = (...args) => { if (!shouldSuppress(args[0])) originalError(...args); };
    const restore = () => {
      console.warn  = originalWarn;
      console.error = originalError;
    };

    pdfParser.on("pdfParser_dataError", (errData) => {
      restore();
      reject(new Error(errData.parserError));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      restore();
      let text = "";
      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((textItem) => {
          textItem.R.forEach((run) => {
            if (!run.T) return;
            let decoded;
            try   { decoded = decodeURIComponent(run.T); }
            catch { decoded = run.T; }
            text += decoded + " ";
          });
        });
        text += "\n";
      });
      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
};

// ─── Helper: delete temp file ──────────────────────────────────────────────────
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.warn(`Could not delete temp file: ${filePath}`);
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/upload  (protected)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No resume file uploaded." });
  }

  const filePath       = req.file.path;
  const jobDescription = req.body?.jobDescription?.trim() || null;

  try {
    const rawText = await parsePDF(filePath);

    if (!rawText || rawText.trim().length < 50) {
      deleteFile(filePath);
      return res.status(422).json({
        success: false,
        error: "Could not extract meaningful text. Ensure the PDF is not a scanned image.",
      });
    }

    const cleanedText = cleanResumeText(rawText);
    const sections    = extractSections(cleanedText);

    const skillsInput = [
      sections.skills,
      sections.summary,
      sections.experience,
      sections.awards,
      sections.additional,
    ].filter(Boolean).join(" ");

    const { grouped, all, totalCount } = extractSkills(skillsInput);

    const atsScore = scoreResume(
      sections,
      { grouped, all, totalCount },
      cleanedText
    );

    let matchResult = null;
    if (jobDescription) {
      try {
        matchResult = matchJobDescription(sections, all, jobDescription);
      } catch (err) {
        console.warn("matchJobDescription failed:", err.message);
      }
    }

    const feedback = await generateFeedback({
      sections,
      atsScore,
      matchResult,
      jobDescription,
    });

    deleteFile(filePath);

    // ── NEW: save to user's resume history (non-blocking) ─────────────────
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        user.addResumeEntry({
          fileName:    req.file.originalname,
          atsScore:    atsScore.totalScore,
          grade:       atsScore.grade,
          sections,
          skills:      { grouped, all, totalCount },
          matchResult,
          feedback,
        });
        await user.save();
      }
    } catch (historyErr) {
      console.warn("Could not save to resume history:", historyErr.message);
    }
    // ── END NEW ────────────────────────────────────────────────────────────

    return res.status(200).json({
      success:  true,
      message:  "Resume analysed successfully",
      filename: req.file.originalname,
      sections: {
        contact:        sections.contact,
        summary:        sections.summary,
        experience:     sections.experience,
        education:      sections.education,
        projects:       sections.projects,
        certifications: sections.certifications,
        skills:         sections.skills,
        awards:         sections.awards,
        additional:     sections.additional,
      },
      skills: { grouped, all, totalCount },
      atsScore,
      matchResult,
      feedback,
    });

  } catch (error) {
    console.error("Upload error:", error);
    deleteFile(filePath);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyse resume.",
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/match  (protected)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/match", protect, async (req, res) => {
  const { sections, skillsAll, jobDescription } = req.body;

  if (!sections || !jobDescription) {
    return res.status(400).json({
      success: false,
      error: "Both 'sections' and 'jobDescription' are required.",
    });
  }

  try {
    const matchResult = matchJobDescription(sections, skillsAll || [], jobDescription);
    return res.status(200).json({ success: true, matchResult });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/feedback  (protected)
// ══════════════════════════════════════════════════════════════════════════════
router.post("/feedback", protect, async (req, res) => {
  const { sections, atsScore, matchResult, jobDescription } = req.body;

  if (!sections) {
    return res.status(400).json({ success: false, error: "'sections' is required." });
  }

  try {
    const feedback = await generateFeedback({
      sections,
      atsScore:       atsScore       || null,
      matchResult:    matchResult    || null,
      jobDescription: jobDescription || null,
    });
    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/history  (protected)  ← NEW
// ══════════════════════════════════════════════════════════════════════════════
router.get("/history", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("resumeHistory");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    return res.status(200).json({ success: true, history: user.resumeHistory });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch history" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/history/:id  (protected)  ← NEW
// ══════════════════════════════════════════════════════════════════════════════
router.delete("/history/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const before = user.resumeHistory.length;
    user.resumeHistory = user.resumeHistory.filter(
      (entry) => entry._id.toString() !== req.params.id
    );
    if (user.resumeHistory.length === before) {
      return res.status(404).json({ success: false, error: "History entry not found" });
    }
    await user.save();
    return res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Delete failed" });
  }
});

export default router;