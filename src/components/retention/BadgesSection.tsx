import { BADGE_DEFINITIONS, type UserBadge } from "@/lib/retention";

interface Props {
  earned: UserBadge[];
  currentStreak: number;
}

export const BadgesSection = ({ earned, currentStreak }: Props) => {
  const earnedSet = new Set(earned.map((b) => b.badge_type));

  const getEarnedAt = (type: string): string | undefined =>
    earned.find((b) => b.badge_type === type)?.earned_at;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-GT", { day: "numeric", month: "long" });
  };

  return (
    <div className="glass-card p-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-4">
        Logros obtenidos
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned  = earnedSet.has(badge.type);
          const earnedAt  = getEarnedAt(badge.type);
          const progress  = Math.min(100, (currentStreak / badge.milestone) * 100);
          const isClose   = !isEarned && progress >= 60;

          return (
            <div
              key={badge.type}
              className={[
                "relative rounded-2xl border p-4 text-center transition-all",
                isEarned
                  ? "bg-lima/10 border-lima/35 shadow-[0_0_20px_hsl(84_83%_63%/0.1)]"
                  : "bg-surface/50 border-lima/8",
              ].join(" ")}
            >
              {/* Badge "cerca" */}
              {isClose && !isEarned && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gold text-background text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  ¡Casi!
                </div>
              )}

              {/* Emoji */}
              <div
                className={[
                  "text-4xl mb-2 transition-all",
                  isEarned ? "" : "opacity-25 grayscale",
                ].join(" ")}
              >
                {badge.emoji}
              </div>

              {/* Nombre */}
              <div
                className={[
                  "font-bold text-xs mb-0.5 leading-snug",
                  isEarned ? "text-lima" : "text-foreground/40",
                ].join(" ")}
              >
                {badge.label}
              </div>

              {/* Descripción */}
              <div className="text-[10px] text-foreground/30 leading-snug mb-2">
                {badge.description}
              </div>

              {/* Estado */}
              {isEarned ? (
                <div className="text-[10px] font-bold text-lima/70">
                  {earnedAt ? formatDate(earnedAt) : "Obtenido"}
                </div>
              ) : (
                <>
                  {/* Barra de progreso */}
                  <div className="h-1 bg-background/50 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-lima/40 to-lima/70 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-foreground/25">
                    {currentStreak}/{badge.milestone} días
                  </div>
                </>
              )}

              {/* Premio */}
              {isEarned && badge.reward && (
                <div className="mt-1.5 text-[9px] font-bold text-celeste/70 uppercase tracking-wide">
                  {badge.reward}
                </div>
              )}

              {/* Lock overlay para los no ganados */}
              {!isEarned && (
                <div className="absolute inset-0 rounded-2xl flex items-end justify-center pb-2 pointer-events-none">
                  <span className="text-[16px] opacity-15">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {earned.length === 0 && (
        <p className="text-xs text-foreground/35 text-center mt-2">
          Completá 7 días seguidos para obtener tu primer badge 🔥
        </p>
      )}
    </div>
  );
};
