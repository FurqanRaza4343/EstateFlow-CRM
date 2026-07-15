import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete,
        });
      },
    });

    const chars = titleRef.current?.querySelectorAll('.splash-char');

    tl.fromTo(
      logoRef.current,
      { scale: 0, opacity: 0, rotation: -15 },
      { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo(
      welcomeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    )
    .fromTo(
      chars,
      { opacity: 0, y: 60, rotateX: -90 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.5, ease: 'back.out(1.4)', stagger: 0.04 },
      '-=0.1'
    )
    .fromTo(
      taglineRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    )
    .to({}, { duration: 0.8 });

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0a0e1a' }}
    >
      <div ref={logoRef} className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white mb-6" style={{ fontSize: '18px', background: 'linear-gradient(135deg, #ff5f03, #ff8c42)' }}>
        EF
      </div>
      <p className="text-sm font-medium mb-2 tracking-widest uppercase" style={{ color: '#6b7280' }}>
        <span ref={welcomeRef}>Welcome to</span>
      </p>
      <h1
        ref={titleRef}
        className="text-4xl font-bold tracking-tight"
        style={{ color: '#f5f5f5' }}
      >
        {'EstateFlow'.split('').map((ch, i) => (
          <span key={i} className="splash-char inline-block" style={{ display: 'inline-block' }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>
      <p
        ref={taglineRef}
        className="text-sm font-medium mt-3 tracking-wide"
        style={{ color: '#ff5f03' }}
      >
        Your Intelligent CRM Partner
      </p>
    </div>
  );
}
