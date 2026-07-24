import { useState } from "react";
import type { DailyCheckin } from "@/lib/retention";
import type { NutritionPlan } from "@/lib/claude";

/* ── Prompt para Nutri (análisis de check-in) ─────────────────────────────── */
function buildCheckinPrompt(
  message: string,
  exercised: boolean,
  planData: NutritionPlan | null,
  currentStreak: number,
): string {
  return `Sos Nutri, el asistente personal de NutriGuate para Guatemala.
Hablás en segunda persona guatemalteca ("vos", "comés", "tenés").
Sos motivacional, conciso y amigable. Máximo 3 párrafos cortos. Máximo 2-3 emojis. Nunca regañás.

━━━ CHECK-IN DEL USUARIO ━━━
Mensaje: "${message}"
Entrenó hoy: ${exercised ? "Sí" : "No"}
Racha actual: ${currentStreak} día${currentStreak !== 1 ? "s" : ""}

${
  planData
    ? `Plan del usuario:
Perfil: ${planData.caso.nombre}
Calorías objetivo: ${planData.macros.kcal} kcal/día
Proteína objetivo: ${planData.macros.proteina_g}g/día
Carbos: ${planData.macros.carbs_g}g | Grasas: ${planData.macros.grasas_g}g`
    : ""
}

━━━ INSTRUCCIONES ━━━
Primero, devolvé SOLO este JSON entre tags <data>...</data>:
<data>
{
  "foods_reported": ["alimentos mencionados explícitamente"],
  "adherence_score": <número 1-10 basado en qué tan alineado estuvo con su plan>,
  "mood_score": <número 1-5 basado en el tono del mensaje>,
  "summary": "<resumen de 1 línea del día>"
}
</data>

Luego escribí tu respuesta como Nutri. La respuesta debe:
1. Reconocer específicamente algo que hizo bien
2. Si algo estuvo fuera del plan, mencionar brevemente sin regañar (máx 1 frase)
3. Dar 1 tip concreto para mañana basado en la pirámide nutricional 2026 (proteína primero)
${currentStreak === 7 || currentStreak === 14 || currentStreak === 30 ? `4. ¡Celebrá la racha de ${currentStreak} días con genuino entusiasmo!` : ""}`;
}

/* ── Parsear respuesta de Claude ─────────────────────────────────────────── */
function parseCheckinResponse(raw: string): {
  data: { foods_reported: string[]; adherence_score: number; mood_score: number; summary: string } | null;
  message: string;
} {
  const jsonMatch = raw.match(/<data>([\s\S]*?)<\/data>/);
  let data = null;
  let message = raw;

  if (jsonMatch) {
    try {
      data = JSON.parse(jsonMatch[1].trim());
      message = raw.replace(/<data>[\s\S]*?<\/data>/, "").trim();
    } catch {
      message = raw;
    }
  }
  return { data, message };
}

/* ────────────────────────────────────────────────────────────────────────── */

interface Props {
  planData: NutritionPlan | null;
  currentStreak: number;
  todayCheckin: DailyCheckin | null;
  onCheckinComplete: (checkin: DailyCheckin) => void;
}

type QuickRating = "green" | "yellow" | "red" | null;

export const DailyCheckin = ({
  planData,
  currentStreak,
  todayCheckin,
  onCheckinComplete,
}: Props) => {
  const [message, setMessage]       = useState("");
  const [exercised, setExercised]   = useState(false);
  const [rating, setRating]         = useState<QuickRating>(null);
  const [loading, setLoading]       = useState(false);
  const [nutrisResponse, setNutrisResponse] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  /* Si ya hizo check-in hoy → mostrar resumen */
  if (todayCheckin) {
    return (
      <div className="glass-card p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-3">
          ✓ Check-in de hoy completado
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ["Adherencia", `${todayCheckin.adherence_score}/10`, "text-lima"],
            ["Ánimo", `${todayCheckin.mood_score}/5`, "text-celeste"],
            ["Entrenamiento", todayCheckin.exercise_done ? "Sí 💪" : "No", "text-foreground/60"],
          ].map(([label, value, cls]) => (
            <div key={label as string} className="bg-surface border border-lima/8 rounded-xl p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-foreground/35 mb-1">{label}</div>
              <div className={`text-sm font-bold ${cls}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Respuesta de Nutri */}
        {todayCheckin.agent_response && (
          <div className="bg-lima/8 border border-lima/20 rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-2">
              Nutri dice:
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {todayCheckin.agent_response}
            </p>
          </div>
        )}
      </div>
    );
  }

  /* ── Enviar check-in ── */
  const handleSubmit = async () => {
    const finalMessage = message.trim() || (
      rating === "green" ? "Hoy estuve muy bien con el plan."
      : rating === "yellow" ? "Más o menos, pude mejorar en algunas cosas."
      : "Me salí del plan hoy."
    );

    if (!finalMessage && !rating) return;

    setLoading(true);
    setError(null);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
    let nutriResponse = "¡Gracias por tu check-in! Seguí así, cada día cuenta 💪";
    let parsedData: ReturnType<typeof parseCheckinResponse>["data"] = null;

    if (apiKey?.startsWith("sk-")) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "anthropic-dangerous-allow-browser": "true",
          },
          body: JSON.stringify({
            model: (import.meta.env.VITE_CLAUDE_MODEL as string | undefined) ?? "claude-opus-4-5",
            max_tokens: 512,
            messages: [
              {
                role: "user",
                content: buildCheckinPrompt(finalMessage, exercised, planData, currentStreak),
              },
            ],
          }),
        });

        if (res.ok) {
          const body = await res.json();
          const rawText: string = body?.content?.[0]?.text ?? "";
          const parsed = parseCheckinResponse(rawText);
          nutriResponse = parsed.message || nutriResponse;
          parsedData = parsed.data;
        }
      } catch {
        // Sin API → respuesta genérica
      }
    }

    const newCheckin: DailyCheckin = {
      id: `web-${Date.now()}`,
      user_id: "current-user",
      date: new Date().toISOString().split("T")[0],
      raw_message: finalMessage,
      foods_reported: parsedData?.foods_reported ?? [],
      adherence_score: parsedData?.adherence_score ?? (rating === "green" ? 8 : rating === "yellow" ? 6 : 4),
      exercise_done: exercised,
      mood_score: parsedData?.mood_score ?? 3,
      agent_response: nutriResponse,
      photo_url: null,
      via_whatsapp: false,
      created_at: new Date().toISOString(),
    };

    setNutrisResponse(nutriResponse);
    setLoading(false);
    onCheckinComplete(newCheckin);
  };

  /* ── Si ya se procesó y se está mostrando la respuesta ── */
  if (nutrisResponse) {
    return (
      <div className="glass-card p-5 anim-fade-up">
        <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-3">
          ✓ ¡Check-in registrado!
        </div>
        <div className="bg-lima/8 border border-lima/20 rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-2">
            Nutri dice:
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {nutrisResponse}
          </p>
        </div>
      </div>
    );
  }

  /* ── Formulario ── */
  return (
    <div className="glass-card p-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-4">
        Check-in de hoy
      </div>

      {/* Rating rápido */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground/75 mb-3">
          ¿Cómo estuvo tu día con el plan?
        </p>
        <div className="flex gap-2">
          {([
            ["green",  "🟢 Muy bien",          "border-lima/40 bg-lima/10 text-lima"],
            ["yellow", "🟡 Más o menos",        "border-gold/40 bg-gold/10 text-gold"],
            ["red",    "🔴 Me salí del plan",   "border-crimson/40 bg-crimson/10 text-crimson"],
          ] as const).map(([val, label, cls]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val === rating ? null : val)}
              className={[
                "flex-1 rounded-xl py-2.5 px-2 text-xs font-bold border-[1.5px] transition-all",
                rating === val ? cls : "bg-surface border-lima/8 text-foreground/45 hover:border-lima/20",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Texto libre */}
      <div className="mb-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block mb-1.5">
          ¿Qué comiste hoy? (opcional, pero Nutri da mejor feedback)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Ej: "Desayuné huevos con frijoles, almorcé pollo con arroz, cené una tortilla con queso"'
          rows={3}
          className="w-full bg-surface border-[1.5px] border-lima/8 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:border-lima focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* ¿Entrenaste? */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setExercised((v) => !v)}
          className={[
            "flex items-center gap-3 rounded-xl px-4 py-3 border-[1.5px] w-full text-left transition-all",
            exercised
              ? "bg-celeste/10 border-celeste/35 text-celeste"
              : "bg-surface border-lima/8 text-foreground/50 hover:border-lima/20",
          ].join(" ")}
        >
          <div
            className={[
              "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
              exercised ? "border-celeste bg-celeste" : "border-foreground/30",
            ].join(" ")}
          >
            {exercised && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--background))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span className="text-sm font-semibold">
            {exercised ? "💪 Sí entré / hice ejercicio hoy" : "Hoy no entrené"}
          </span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-crimson mb-3">{error}</p>
      )}

      {/* Botón submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (!rating && !message.trim())}
        className={[
          "w-full rounded-xl py-3.5 font-bold text-sm transition-all",
          loading || (!rating && !message.trim())
            ? "bg-surface border border-lima/10 text-foreground/25 cursor-not-allowed"
            : "cta-primary",
        ].join(" ")}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-lima/20 border-t-lima anim-spin-slow" />
            Nutri está analizando tu día…
          </span>
        ) : (
          "Registrar mi check-in ✓"
        )}
      </button>

      <p className="text-center text-[11px] text-foreground/30 mt-2">
        ¿Dudas? Contactá a nuestro asesor{" "}
        <span className="text-celeste">Irwing Samuel Sagastume Rossil</span>{" "}
        al +502 5910 2808
      </p>
    </div>
  );
};
