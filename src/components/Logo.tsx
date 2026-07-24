export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = {
    sm: { txt: "text-3xl", svg: 36, gap: "gap-2.5" },
    md: { txt: "text-4xl", svg: 46, gap: "gap-3" },
    lg: { txt: "text-5xl md:text-6xl", svg: 64, gap: "gap-4" },
    xl: { txt: "text-6xl md:text-7xl lg:text-8xl", svg: 88, gap: "gap-5" },
  } as const;
  const s = sizes[size];
  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      <svg width={s.svg} height={s.svg} viewBox="0 0 80 80" fill="none" aria-hidden>
        <circle cx="40" cy="40" r="38" fill="hsl(var(--lima) / 0.14)" stroke="hsl(var(--lima) / 0.55)" strokeWidth="1.5"/>
        <path d="M40 16 C28 28 20 38 20 50 C20 60 28 66 40 66 C52 66 60 60 60 50 C60 38 52 28 40 16 Z" fill="hsl(var(--lima))" opacity="0.92"/>
        <path d="M40 20 L40 62" stroke="hsl(var(--background))" strokeWidth="1.4" opacity="0.55"/>
        <path d="M32 38 Q40 44 48 38" stroke="hsl(var(--background))" strokeWidth="1.2" opacity="0.45" fill="none"/>
      </svg>
      <span className={`font-display ${s.txt} leading-none tracking-tight`}>
        <span className="text-celeste italic">Nutri</span>
        <span className="text-lima">Guate</span>
      </span>
    </div>
  );
};
