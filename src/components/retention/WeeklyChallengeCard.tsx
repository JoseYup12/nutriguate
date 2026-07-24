import type { WeeklyChallenge } from "@/lib/retention";

interface Props {
  challenge: WeeklyChallenge | null;
  /** Check-ins de esta semana (para calcular progreso) */
  weekAdherence: number; // 0-100 porcentaje de días con adherencia > 7
  onAccept?: () => void;
  onDecline?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  protein:     "🥩",
  exercise:    "🏋️",
  water:       "💧",
  vegetables:  "🥦",
  budget:      "💰",
  sleep:       "😴",
  default:     "⚡",
};

export const WeeklyChallengeCard = ({ challenge, weekAdherence, onAccept, onDecline }: Props) => {
  if (!challenge) {
    return (
      <div className="glass-card p-5 text-center">
        <div className="text-3xl mb-3">⚡</div>
        <div className="text-foreground/50 text-sm">
          El desafío de esta semana llegará el próximo lunes a las 9:00 AM por WhatsApp.
        </div>
      </div>
    );
  }

  const icon = TYPE_ICONS[challenge.challenge_type] ?? TYPE_ICONS.default;
  const daysLeft = (() => {
    const weekEnd = new Date(challenge.week_start);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const diff = Math.ceil((weekEnd.getTime() - Date.now()) / 86_400_000);
    return Math.max(0, diff);
  })();

  return (
    <div className="glass-card overflow-hidden">
      {/* Banner superior */}
      <div className={[
        "px-5 py-3 border-b border-lima/8 flex items-center justify-between",
        challenge.completed
          ? "bg-lima/15"
          : challenge.accepted
          ? "bg-celeste/10"
          : "bg-surface/80",
      ].join(" ")}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45">
          Desafío de la semana
        </div>
        {challenge.completed ? (
          <span className="text-[10px] font-black uppercase tracking-wider text-lima bg-lima/15 border border-lima/30 rounded-full px-2.5 py-0.5">
            ✓ Completado
          </span>
        ) : challenge.accepted ? (
          <span className="text-[10px] font-black uppercase tracking-wider text-celeste">
            En curso · {daysLeft}d restantes
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/35">
            Sin aceptar
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-3xl flex-shrink-0 mt-0.5">{icon}</div>
          <p className="text-base font-semibold text-foreground/90 leading-snug">
            {challenge.challenge_text}
          </p>
        </div>

        {/* Progreso (si aceptado y no completado) */}
        {challenge.accepted && !challenge.completed && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                Progreso de la semana
              </span>
              <span className="text-xs font-bold text-lima">{weekAdherence}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all duration-700",
                  weekAdherence >= 70
                    ? "bg-gradient-to-r from-lima to-celeste"
                    : weekAdherence >= 40
                    ? "bg-gradient-to-r from-gold to-lima"
                    : "bg-crimson/70",
                ].join(" ")}
                style={{ width: `${weekAdherence}%` }}
              />
            </div>
            <p className="text-[11px] text-foreground/35 mt-1.5">
              {weekAdherence >= 70
                ? "¡Vas muy bien! Seguí así 🔥"
                : weekAdherence >= 40
                ? "Vas a la mitad — podés mejorar"
                : "Todavía hay tiempo para retomar 💪"}
            </p>
          </div>
        )}

        {/* Completado */}
        {challenge.completed && (
          <div className="bg-lima/10 border border-lima/25 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-sm font-bold text-lima">¡Desafío completado!</p>
            {challenge.completion_date && (
              <p className="text-xs text-foreground/45 mt-0.5">
                Completado el {challenge.completion_date}
              </p>
            )}
          </div>
        )}

        {/* Botones si no ha aceptado */}
        {!challenge.accepted && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={onAccept}
              className="flex-1 cta-primary rounded-xl py-2.5 text-sm font-bold"
            >
              ¡Acepto el desafío! 💪
            </button>
            <button
              onClick={onDecline}
              className="px-4 py-2.5 rounded-xl bg-surface border border-lima/10 text-foreground/45 text-sm hover:border-lima/25 transition-colors"
            >
              Ahora no
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
