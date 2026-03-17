import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 (or a start value) up to `target`.
 * @param {number} target   - The final number to count to
 * @param {number} duration - Animation duration in ms (default 1400)
 * @param {number} delay    - Delay before starting in ms (default 200)
 * @returns {number} current animated value
 */
export function useAnimatedCount(target, duration = 1400, delay = 200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (target == null) return;

    // easeOutCubic for a natural deceleration feel
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const startAnimation = () => {
      startTimeRef.current = null;

      const step = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = ease(progress);

        setCount(Math.round(easedProgress * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return count;
}