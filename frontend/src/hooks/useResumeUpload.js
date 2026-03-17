import { useState, useCallback, useRef } from 'react'
import { uploadResume } from '../services/api'
import useResumeStore from '../store/resumeStore'

export default function useResumeUpload() {
  const setResult  = useResumeStore((s) => s.setResult)
  const setRawFile = useResumeStore((s) => s.setRawFile)

  const [status,   setStatus]   = useState('idle')
  const [progress, setProgress] = useState(0)
  const [error,    setError]    = useState(null)

  // Ref to let the progress animation know the API has responded
  const apiDone = useRef(false)

  // ── Smooth progress simulation ────────────────────────────────────────────
  // Runs from 0 → 90 while waiting for API, then snaps to 100 on response
  const runProgress = useCallback(() => {
    apiDone.current = false
    let current = 0
    let lastTime = null

    // Stages: [targetValue, ms to reach it]
    const stages = [
      [35, 900],    // parsing PDF
      [65, 1400],   // scoring
      [90, 6000],   // waiting for Groq AI — slow on purpose
    ]

    let stageIdx = 0

    const tick = (timestamp) => {
      if (!lastTime) lastTime = timestamp

      // If API already responded, snap straight to 100
      if (apiDone.current) {
        setProgress(100)
        return
      }

      if (stageIdx >= stages.length) return

      const [target, duration] = stages[stageIdx]
      const elapsed   = timestamp - lastTime
      const stageProg = Math.min(elapsed / duration, 1)
      const eased     = 1 - Math.pow(1 - stageProg, 2)
      const start     = stageIdx === 0 ? 0 : stages[stageIdx - 1][0]

      current = start + (target - start) * eased
      setProgress(Math.floor(current))

      if (stageProg < 1) {
        requestAnimationFrame(tick)
      } else {
        stageIdx++
        lastTime = null
        if (stageIdx < stages.length) requestAnimationFrame(tick)
        // At stage end (90%) — keep pulsing near 90 until API responds
        else {
          const pulse = (ts) => {
            if (apiDone.current) { setProgress(100); return }
            // Oscillate between 88–92 so bar looks alive
            const osc = 90 + Math.sin(ts / 400) * 2
            setProgress(Math.floor(osc))
            requestAnimationFrame(pulse)
          }
          requestAnimationFrame(pulse)
        }
      }
    }

    requestAnimationFrame(tick)
  }, [])

  // ── Main analyse function ─────────────────────────────────────────────────
  const analyse = useCallback(async (file, jobDescription = '') => {
    if (!file) return

    setError(null)
    setProgress(0)
    setRawFile(file)

    // Set uploading FIRST so LoadingScreen renders immediately
    setStatus('uploading')

    // Start progress animation
    runProgress()

    // Small delay so LoadingScreen has time to mount before heavy work
    await new Promise((r) => setTimeout(r, 80))

    setStatus('analysing')

    try {
      const result = await uploadResume(file, jobDescription)

      // Signal progress bar to snap to 100
      apiDone.current = true
      setProgress(100)

      // Wait for the 100% flash to be visible before navigating
      await new Promise((r) => setTimeout(r, 600))

      setResult(result)
      setStatus('done')   // ← triggers useEffect navigate in AnalysisPage

    } catch (err) {
      apiDone.current = true
      setError(err.message || 'Analysis failed. Please try again.')
      setStatus('error')
      setProgress(0)
    }
  }, [runProgress, setResult, setRawFile])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    apiDone.current = false
    setStatus('idle')
    setProgress(0)
    setError(null)
  }, [])

  return { analyse, status, progress, error, reset }
}