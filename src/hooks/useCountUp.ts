import { useState, useEffect, useRef } from 'react';

export function useCountUp(target: number, duration = 800): number {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);
  const prefersReducedMotion = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (typeof target !== 'number' || isNaN(target) || target <= 0) {
      setDisplayValue(Math.max(0, target || 0));
      hasAnimatedRef.current = true;
      return;
    }

    if (hasAnimatedRef.current || prefersReducedMotion.current) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        hasAnimatedRef.current = true;
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, ready]);

  return displayValue;
}
