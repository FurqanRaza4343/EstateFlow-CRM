import { useEffect, useRef, useState } from 'react';

export default function ShaderBackground({ className = '' }: { className?: string }) {
  const [ShaderComp, setShaderComp] = useState<any>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    import('shaders/react').then(mod => {
      if (mounted.current) setShaderComp(mod);
    }).catch(() => {});
    return () => { mounted.current = false; };
  }, []);

  return (
    <div className={`absolute inset-0 z-10 pointer-events-none overflow-hidden ${className}`}>
      {ShaderComp ? (
        <ShaderComp.Shader style={{ width: '100%', height: '100%' }}>
          <ShaderComp.Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
          <ShaderComp.ChromaFlow baseColor="#ffffff" downColor="#ff5f03" leftColor="#ff5f03" rightColor="#ff5f03" upColor="#ff5f03" momentum={13} radius={3.5} />
          <ShaderComp.FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
          <ShaderComp.FilmGrain strength={0.05} />
        </ShaderComp.Shader>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-white via-gray-50 to-gray-100" />
      )}
    </div>
  );
}
