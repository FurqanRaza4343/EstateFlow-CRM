/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState, useEffect } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
}

export default function TiltCard({ children, maxTilt = 6, className = '' }: TiltCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const calcTilt = (clientX: number, clientY: number, scale = 1) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = Math.min(Math.max(((clientX - centerX) / (rect.width / 2)) * maxTilt * scale, -maxTilt * scale), maxTilt * scale);
    const rotateX = Math.min(Math.max(-((clientY - centerY) / (rect.height / 2)) * maxTilt * scale, -maxTilt * scale), maxTilt * scale);
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseMove = (e: React.MouseEvent) => calcTilt(e.clientX, e.clientY);
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) calcTilt(e.touches[0].clientX, e.touches[0].clientY, 0.5);
  };
  const handleTouchEnd = () => setTilt({ x: 0, y: 0 });

  return (
    <div style={{ perspective: '1000px', display: 'block', width: '100%' }}>
      <div
        ref={cardRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 300ms ease-out',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}
