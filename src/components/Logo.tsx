export const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) => {
  const sizes = {
    sm: { txt: "text-3xl", svg: 38,  gap: "gap-2" },
    md: { txt: "text-4xl", svg: 50,  gap: "gap-2.5" },
    lg: { txt: "text-5xl md:text-6xl", svg: 70, gap: "gap-3" },
    xl: { txt: "text-6xl md:text-7xl lg:text-8xl", svg: 96, gap: "gap-4" },
  } as const;
  const s = sizes[size];
  return (
    <div className={`inline-flex items-center ${s.gap}`}>
      {/* Mascota nutria — fiel al logo oficial */}
      <svg width={s.svg} height={s.svg} viewBox="0 0 100 100" fill="none" aria-hidden>
        {/* Círculo de fondo */}
        <circle cx="48" cy="52" r="42" fill="hsl(var(--lima) / 0.13)" />

        {/* Cuerpo principal — forma curva de nutria */}
        <path
          d="M26 62 Q20 48 26 36 Q32 22 46 20 Q62 18 70 30 Q78 42 72 56 Q66 70 52 74 Q36 78 26 62 Z"
          fill="hsl(var(--lima) / 0.22)"
        />

        {/* Cola curvada parte inferior */}
        <path
          d="M52 74 Q62 78 68 72 Q74 66 68 60"
          stroke="hsl(var(--lima) / 0.38)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cabeza — forma redondeada girada hacia la derecha */}
        <ellipse cx="64" cy="30" rx="15" ry="13" fill="hsl(var(--lima) / 0.30)" />

        {/* Hocico */}
        <ellipse cx="76" cy="28" rx="8" ry="6" fill="hsl(var(--lima) / 0.42)" />

        {/* Nariz */}
        <ellipse cx="83" cy="26" rx="3.5" ry="2.5" fill="hsl(var(--lima) / 0.65)" />

        {/* Ojo */}
        <circle cx="70" cy="24" r="3" fill="hsl(var(--lima) / 0.72)" />
        <circle cx="70" cy="24" r="1.2" fill="white" opacity="0.55" />

        {/* Bigotes */}
        <line x1="83" y1="24" x2="94" y2="20" stroke="hsl(var(--lima) / 0.45)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="83" y1="26" x2="95" y2="26" stroke="hsl(var(--lima) / 0.45)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="83" y1="28" x2="94" y2="32" stroke="hsl(var(--lima) / 0.45)" strokeWidth="1.2" strokeLinecap="round"/>

        {/* Aleta/pata delantera */}
        <path
          d="M38 52 Q34 60 40 66 Q46 70 50 64"
          stroke="hsl(var(--lima) / 0.35)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Texto — idéntico al logo oficial */}
      <span className={`font-display ${s.txt} leading-none tracking-tight`}>
        <span className="text-celeste italic">Nutri</span>
        <span className="text-lima">Guate</span>
      </span>
    </div>
  );
};
