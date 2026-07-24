import type { UserStreak } from "@/lib/retention";

interface Props {
  streak: UserStreak;
  /** Si el usuario ya hizo check-in hoy */
  checkedInToday: boolean;
}

export const StreakDisplay = ({ streak, checkedInToday }: Props) => {
  const { current_streak, max_streak, streak_shields_available, streak_shields_used } = streak;
  const isOnFire = current_streak >= 7;

  return (
    <div className="glass-card p-6">
      {/* Fila principal */}
      <div className="flex items-center justify-between gap-4 mb-5">
        {/* Racha actual */}
        <div className="flex items-center gap-4">
          <div
            className={[
              "relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl select-none flex-shrink-0",
              isOnFire
                ? "bg-gradient-to-br from-gold/20 to-crimson/15 border border-gold/40"
                : "bg-surface border border-lima/15",
            ].join(" ")}
          >
            <span className={isOnFire ? "anim-pulse-soft" : ""}>
              {checkedInToday ? "🔥" : current_streak > 0 ? "⏳" : "💤"}
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-0.5">
              Racha actual
            </div>
            <div
              className={[
                "font-display leading-none",
                current_streak >= 30
                  ? "text-5xl text-gold"
                  : current_streak >= 14
                  ? "text-5xl text-lima"
                  : "text-5xl text-lima",
              ].join(" ")}
            >
              {current_streak}
              <span className="text-base font-sans font-semibold text-foreground/45 ml-1">días</span>
            </div>
            {!checkedInToday && current_streak > 0 && (
              <div className="text-[11px] text-gold font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold anim-pulse-soft inline-block" />
                ¡Hacé tu check-in para mantenerla!
              </div>
            )}
            {checkedInToday && (
              <div className="text-[11px] text-lima font-semibold mt-1">
                ✓ Check-in de hoy completado
              </div>
            )}
          </div>
        </div>

        {/* Racha máxima */}
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-0.5">
            Récord personal
          </div>
          <div className="font-display text-3xl text-foreground/60">
            {max_streak}
            <span className="text-sm font-sans text-foreground/35 ml-1">días</span>
          </div>
        </div>
      </div>

      {/* Escudos de racha */}
      <div className="border-t border-lima/8 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-3">
          Escudos de racha
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {[...Array(streak_shields_available)].map((_, i) => (
              <div
                key={`avail-${i}`}
                className="w-8 h-8 rounded-lg bg-celeste/15 border border-celeste/35 flex items-center justify-center text-base"
                title="Escudo disponible — responde 'usá mi escudo' a Nutri para activarlo"
              >
                🛡️
              </div>
            ))}
            {[...Array(streak_shields_used)].map((_, i) => (
              <div
                key={`used-${i}`}
                className="w-8 h-8 rounded-lg bg-surface border border-foreground/8 flex items-center justify-center text-base opacity-30"
                title="Escudo ya utilizado este mes"
              >
                🛡️
              </div>
            ))}
            {streak_shields_available === 0 && streak_shields_used === 0 && (
              <div className="text-xs text-foreground/35 py-1">Sin escudos este mes</div>
            )}
          </div>
          <p className="text-[11px] text-foreground/40 leading-snug">
            {streak_shields_available > 0
              ? `Tenés ${streak_shields_available} escudo${streak_shields_available > 1 ? "s" : ""} — permiten saltarse 1 día sin perder la racha`
              : "Los escudos se recargan el 1 de cada mes"}
          </p>
        </div>
      </div>

      {/* Progreso al próximo hito */}
      {(() => {
        const milestones = [7, 14, 30, 60, 90];
        const next = milestones.find((m) => m > current_streak);
        if (!next) return null;
        const pct = (current_streak / next) * 100;
        const daysLeft = next - current_streak;
        return (
          <div className="border-t border-lima/8 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                Próximo hito
              </span>
              <span className="text-xs font-bold text-lima">{next} días — faltan {daysLeft}</span>
            </div>
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lima to-celeste rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
};
