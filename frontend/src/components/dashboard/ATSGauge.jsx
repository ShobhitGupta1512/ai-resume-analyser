import { useEffect, useRef, useState } from "react";
import { useAnimatedCount } from "../../hooks/useAnimatedCount";

// ─── Arc math helpers ────────────────────────────────────────────────────────
const CX = 110;        // SVG centre x
const CY = 110;        // SVG centre y
const R  = 88;         // arc radius
const GAP_DEG = 60;    // degrees of gap at the bottom (30° each side)
const START_DEG = 90 + GAP_DEG / 2;   // 120° (bottom-left)
const END_DEG   = 90 - GAP_DEG / 2 + 360; // 420° = 60° (bottom-right) going clockwise

const SWEEP = 360 - GAP_DEG; // 300°

function degToRad(d) { return (d * Math.PI) / 180; }

function polarToXY(deg, r = R) {
  const rad = degToRad(deg);
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function arcPath(startDeg, endDeg, r = R) {
  const s = polarToXY(startDeg, r);
  const e = polarToXY(endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

// Full track path (300° arc)
const TRACK_PATH = arcPath(START_DEG, START_DEG + SWEEP);

// ─── Colour palette ──────────────────────────────────────────────────────────
function resolveColor(colorFromApi) {
  // API returns colour names like "red", "orange", "yellow", "green", "emerald"
  const map = {
    red:     { stroke: "#ef4444", glow: "rgba(239,68,68,0.35)",    text: "#ef4444" },
    orange:  { stroke: "#f97316", glow: "rgba(249,115,22,0.35)",   text: "#f97316" },
    yellow:  { stroke: "#eab308", glow: "rgba(234,179,8,0.35)",    text: "#eab308" },
    green:   { stroke: "#22c55e", glow: "rgba(34,197,94,0.35)",    text: "#22c55e" },
    emerald: { stroke: "#10b981", glow: "rgba(16,185,129,0.35)",   text: "#10b981" },
    blue:    { stroke: "#3b82f6", glow: "rgba(59,130,246,0.35)",   text: "#3b82f6" },
  };
  return map[colorFromApi?.toLowerCase()] ?? map.blue;
}

// ─── Tick marks (every 10 units = 30°) ───────────────────────────────────────
function Ticks() {
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const deg = START_DEG + (i / 10) * SWEEP;
    const inner = polarToXY(deg, R - 10);
    const outer = polarToXY(deg, R + 2);
    ticks.push(
      <line
        key={i}
        x1={inner.x} y1={inner.y}
        x2={outer.x} y2={outer.y}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={i % 5 === 0 ? 2 : 1}
        strokeLinecap="round"
      />
    );
  }
  return <>{ticks}</>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * ATSGauge
 * Props:
 *   atsScore: { totalScore, grade, label, color, categories, suggestions }
 */
export default function ATSGauge({ atsScore }) {
  const score    = atsScore?.totalScore ?? 0;
  const grade    = atsScore?.grade      ?? "—";
  const label    = atsScore?.label      ?? "Analysing…";
  const apiColor = atsScore?.color      ?? "blue";

  const palette    = resolveColor(apiColor);
  const animated   = useAnimatedCount(score, 1400, 300);
  const arcPercent = animated / 100;

  // Animate the arc stroke via a ref on the path element
  const arcRef    = useRef(null);
  const [arcLen, setArcLen] = useState(0);

  useEffect(() => {
    if (arcRef.current) setArcLen(arcRef.current.getTotalLength());
  }, []);

  // Progress arc covers 0→score over SWEEP degrees
  const fillEnd   = START_DEG + arcPercent * SWEEP;
  const fillPath  = arcPercent > 0.001 ? arcPath(START_DEG, fillEnd) : "";

  // Glowing dot at the leading edge of the arc
  const dotPos    = arcPercent > 0.001 ? polarToXY(fillEnd) : null;

  return (
    <div className="ats-gauge-wrapper">
      {/* ── Card shell ── */}
      <div className="ats-card">

        {/* Subtle grid texture overlay */}
        <div className="ats-card__grid" />

        {/* Header */}
        <p className="ats-card__eyebrow">ATS Compatibility Score</p>

        {/* SVG Gauge */}
        <div className="ats-gauge__svg-container">
          <svg
            viewBox="0 0 220 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`ATS score: ${score} out of 100`}
          >
            <defs>
              {/* Glow filter for the progress arc */}
              <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradient along the arc */}
              <linearGradient id="arc-grad" gradientUnits="userSpaceOnUse"
                x1={polarToXY(START_DEG).x} y1={polarToXY(START_DEG).y}
                x2={polarToXY(START_DEG + SWEEP).x} y2={polarToXY(START_DEG + SWEEP).y}
              >
                <stop offset="0%"   stopColor={palette.stroke} stopOpacity="0.6" />
                <stop offset="100%" stopColor={palette.stroke} stopOpacity="1"   />
              </linearGradient>
            </defs>

            {/* Tick marks */}
            <Ticks />

            {/* Background track */}
            <path
              d={TRACK_PATH}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Filled progress arc */}
            {fillPath && (
              <path
                d={fillPath}
                stroke="url(#arc-grad)"
                strokeWidth="10"
                strokeLinecap="round"
                filter="url(#arc-glow)"
                style={{ transition: "d 0.016s linear" }}
              />
            )}

            {/* Leading dot */}
            {dotPos && (
              <circle
                cx={dotPos.x}
                cy={dotPos.y}
                r="6"
                fill={palette.stroke}
                filter="url(#arc-glow)"
              />
            )}

            {/* Centre: animated number */}
            <text
              x={CX} y={CY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="ats-gauge__score-text"
              fill={palette.text}
            >
              {animated}
            </text>

            {/* "/100" sub-label */}
            <text
              x={CX} y={CY + 22}
              textAnchor="middle"
              dominantBaseline="middle"
              className="ats-gauge__out-of"
              fill="rgba(255,255,255,0.35)"
            >
              / 100
            </text>

            {/* Grade badge */}
            <text
              x={CX} y={CY + 46}
              textAnchor="middle"
              dominantBaseline="middle"
              className="ats-gauge__grade"
              fill={palette.text}
            >
              {grade}
            </text>
          </svg>
        </div>

        {/* Label pill */}
        <div
          className="ats-gauge__label-pill"
          style={{
            background: palette.glow,
            border: `1px solid ${palette.stroke}44`,
            color: palette.text,
          }}
        >
          {label}
        </div>

        {/* Quick suggestions (first 2) */}
        {atsScore?.suggestions?.length > 0 && (
          <ul className="ats-gauge__suggestions">
            {atsScore.suggestions.slice(0, 2).map((s, i) => (
              <li key={i} className="ats-gauge__suggestion-item">
                <span className="ats-gauge__suggestion-dot" style={{ background: palette.stroke }} />
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Embedded styles ── */}
      <style>{`
        .ats-gauge-wrapper {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 1rem;
        }

        .ats-card {
          position: relative;
          overflow: hidden;
          background: rgba(10, 12, 20, 0.82);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 1.75rem 2rem 1.5rem;
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 24px 64px rgba(0,0,0,0.55);
        }

        /* Subtle dot-grid texture */
        .ats-card__grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 18px 18px;
          pointer-events: none;
          border-radius: inherit;
        }

        .ats-card__eyebrow {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }

        .ats-gauge__svg-container {
          width: 200px;
          height: 200px;
          position: relative;
          margin: 0.25rem 0;
        }

        .ats-gauge__svg-container svg {
          width: 100%;
          height: 100%;
        }

        .ats-gauge__score-text {
          font-size: 2.6rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          font-family: 'DM Mono', 'JetBrains Mono', 'Courier New', monospace;
          letter-spacing: -0.02em;
        }

        .ats-gauge__out-of {
          font-size: 0.75rem;
          font-weight: 500;
          font-family: 'DM Mono', monospace;
        }

        .ats-gauge__grade {
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.05em;
        }

        .ats-gauge__label-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.3rem 1rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          margin-top: 0.25rem;
        }

        .ats-gauge__suggestions {
          list-style: none;
          margin: 0.5rem 0 0;
          padding: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .ats-gauge__suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.45;
        }

        .ats-gauge__suggestion-dot {
          flex-shrink: 0;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 0.38rem;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}