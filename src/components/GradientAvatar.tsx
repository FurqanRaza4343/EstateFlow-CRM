interface GradientAvatarProps {
  name: string;
  seed?: string;
  size?: number;
  active?: boolean;
  className?: string;
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export default function GradientAvatar({
  name,
  seed,
  size = 40,
  active = false,
  className = ''
}: GradientAvatarProps) {
  if (!name) {
    return (
      <div
        className={`rounded-full flex items-center justify-center shrink-0 font-bold text-white ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'linear-gradient(135deg, hsl(0, 0%, 50%), hsl(0, 0%, 35%))',
          fontSize: `${size * 0.4}px`,
          boxShadow: active ? `0 0 0 2px var(--color-accent)` : 'none'
        }}
      >
        ?
      </div>
    );
  }

  const hashSeed = seed || name;
  const hue1 = hash(hashSeed) % 360;
  const hue2 = (hue1 + 120) % 360;
  const gradient = `linear-gradient(135deg, hsl(${hue1}, 70%, 55%), hsl(${hue2}, 70%, 45%))`;

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-bold text-white ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: gradient,
        fontSize: `${size * 0.4}px`,
        boxShadow: active ? `0 0 0 2px var(--color-accent)` : 'none'
      }}
    >
      {initials}
    </div>
  );
}
