import { useEffect, useRef, useState } from "react";
import type { FormData } from "./FormularioDiagnostico";
import bgImg from "@/assets/hero-person.jpg";
import overlayBg from "@/assets/market-flatlay.jpg";
import { Logo } from "@/components/Logo";
import { generateNutritionPlan, type NutritionPlan } from "@/lib/claude";

/* ── Mensajes que rotan durante la carga ── */
const MSGS = [
  "Analizando tu perfil corporal...",
  "Clasificando tu caso clínico...",
  "Calculando BMR con Mifflin-St Jeor...",
  "Aplicando factor de actividad...",
  "Determinando calorías y macros exactos...",
  "Construyendo tu plan con alimentos guatemaltecos...",
  "Verificando restricciones alimentarias...",
  "Prescribiendo protocolo de actividad...",
  "Preparando lista de supermercado con precios GT...",
  "Finalizando tu sistema personalizado...",
];
const MSG_INTERVAL = 1_500;

/* ── Datos de fallback (si la API falla) ── */
const FALLBACK_CASE = {
  nombre: "Plan personalizado",
  perfil: "general",
  insight: "Tu caso ha sido analizado. Completa el plan para ver tu estrategia nutricional detallada.",
  fallo: "Sin un sistema personalizado, los resultados son inconsistentes independientemente del esfuerzo.",
};

/* ════════════════════════════════════════════════════════════════════════════
   InsightScreen
   ════════════════════════════════════════════════════════════════════════════ */
export const InsightScreen = ({
  formData,
  onContinue,
  onPlanReady,
}: {
  formData: FormData;
  onContinue: () => void;
  onPlanReady: (plan: NutritionPlan) => void;
}) => {
  /* ── Estados ── */
  const [loading, setLoading]             = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [msgIdx, setMsgIdx]               = useState(0);
  const [plan, setPlan]                   = useState<NutritionPlan | null>(null);
  const [apiError, setApiError]           = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Macros: usa datos reales o fallback ── */
  const kcal   = plan?.macros.kcal       ?? 0;
  const prot   = plan?.macros.proteina_g ?? 0;
  const carbs  = plan?.macros.carbs_g    ?? 0;
  const fat    = plan?.macros.grasas_g   ?? 0;
  const protKg = plan?.macros.protKg     ?? (prot / (+formData.weight || 70)).toFixed(2);
  const caso   = plan?.caso              ?? FALLBACK_CASE;

  const items: [string, string, boolean][] = plan
    ? [
        ["Calorías exactas",  `${kcal.toLocaleString("es-GT")} kcal/día`, false],
        ["Proteínas diarias", `${prot}g (${protKg}g/kg)`,                 false],
        ["Plan nutricional",  "3 días completos",                          true],
        ["Actividad física",  plan.actividad.tipo,                         true],
        ["Metas por fase",    "Semana 2, 4 y 8",                           true],
        ["Lista de compras",  "Con precios GT",                            true],
      ]
    : [
        ["Calorías exactas",  "Calculando...",    false],
        ["Proteínas diarias", "Calculando...",    false],
        ["Plan nutricional",  "7 días completos", true],
        ["Actividad física",  "Prescripto",       true],
        ["Metas por fase",    "Semana 2, 4 y 8",  true],
        ["Lista de compras",  "Con precios GT",   true],
      ];

  /* ── Efecto principal: rotar mensajes + llamar Claude ── */
  useEffect(() => {
    intervalRef.current = setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, MSGS.length - 1)),
      MSG_INTERVAL,
    );

    generateNutritionPlan(formData)
      .then((generatedPlan) => {
        setPlan(generatedPlan);
        onPlanReady(generatedPlan);
      })
      .catch((err: Error) => {
        console.error("[NutriGuate] Error generando plan:", err);
        setApiError(err.message);
      })
      .finally(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Breve pausa para que la transición se vea suave
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setOverlayVisible(false), 550);
        }, 400);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.min(92, ((msgIdx + 1) / MSGS.length) * 100);

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ─── Fondo del resultado ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={bgImg} alt="" className="w-full h-full object-cover opacity-25" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      {/* ─── Contenido del resultado ─── */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-opacity duration-500"
        style={{ opacity: loading ? 0 : 1 }}
        aria-hidden={loading}
      >
        <div className="mb-8"><Logo size="md" /></div>

        <div className="w-full max-w-xl">

          {/* Banner de error de API (si ocurrió) */}
          {apiError && (
            <div className="rounded-xl border border-gold/30 bg-gold/8 p-4 mb-6 anim-fade-up">
              <p className="text-gold font-bold text-xs uppercase tracking-widest mb-1">
                ⚠️ No se pudo conectar con Claude
              </p>
              <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap">
                {apiError}
              </p>
              <p className="text-foreground/45 text-xs mt-2">
                Revisa tu .env.local y recarga la página para intentar de nuevo.
              </p>
            </div>
          )}

          {/* Caso detectado */}
          <div className="text-center mb-10 anim-fade-up">
            <div className="text-xs font-bold uppercase tracking-widest text-celeste mb-3">
              Tu caso detectado
            </div>
            <h1 className="font-display text-[clamp(2rem,5.5vw,2.8rem)] leading-tight">
              {caso.nombre}
            </h1>
            <div className="w-16 h-px bg-celeste/40 mx-auto mt-5" />
          </div>

          {/* Insight */}
          <div
            className="rounded-2xl border-[1.5px] border-celeste/30 bg-celeste/8 backdrop-blur-sm p-6 mb-4 anim-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-celeste mb-3">
              Lo que el sistema detectó
            </div>
            <p className="text-foreground/80 leading-relaxed">{caso.insight}</p>
          </div>

          {/* Fallo raíz */}
          <div
            className="rounded-2xl border-[1.5px] border-crimson/25 bg-crimson/5 backdrop-blur-sm p-6 mb-4 anim-fade-up"
            style={{ animationDelay: "140ms" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-crimson mb-3">
              El problema raíz
            </div>
            <p className="text-foreground/80 leading-relaxed">{caso.fallo}</p>
          </div>

          {/* Preview de estrategia */}
          <div
            className="glass-card p-6 mb-8 anim-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-4">
              Tu estrategia personalizada
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map(([lbl, val, locked]) => (
                <div
                  key={lbl}
                  className={`relative rounded-lg p-4 border overflow-hidden ${
                    locked
                      ? "bg-background/40 border-lima/8"
                      : "bg-lima/10 border-lima/25"
                  }`}
                >
                  {locked && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-foreground/55">
                      Bloqueado
                    </div>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/55 mb-1">
                    {lbl}
                  </div>
                  <div className={`text-sm font-bold ${locked ? "text-foreground/30" : "text-lima"}`}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onContinue}
            className="cta-primary w-full anim-fade-up"
            style={{ animationDelay: "260ms" }}
          >
            Ver mi plan completo →
          </button>
          <p className="text-center text-xs text-foreground/45 mt-4">
            El plan completo incluye nutrición, actividad física y ajustes cada 14 días
          </p>
        </div>
      </div>

      {/* ─── Overlay de carga ─── */}
      {overlayVisible && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 transition-opacity duration-550"
          style={{ opacity: loading ? 1 : 0, pointerEvents: loading ? "auto" : "none" }}
        >
          {/* Fondo del overlay */}
          <div className="absolute inset-0">
            <img
              src={overlayBg}
              alt=""
              className="w-full h-full object-cover opacity-20 pointer-events-none"
            />
            <div className="absolute inset-0 bg-background/95" />
          </div>

          {/* Contenido del spinner */}
          <div className="relative text-center max-w-md w-full">
            <div className="mb-10"><Logo size="lg" /></div>

            {/* Spinner */}
            <div className="w-24 h-24 mx-auto mb-10 rounded-full border-4 border-lima/15 border-t-lima anim-spin-slow" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-lima/12 border border-lima/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-lima anim-pulse-soft" />
              <span className="text-lima text-xs font-bold tracking-widest uppercase">
                Procesando con Claude AI
              </span>
            </div>

            <h2 className="font-display text-4xl mb-5">Analizando tu caso…</h2>

            {/* Mensaje actual */}
            <p className="text-lima font-semibold mb-10 anim-pulse-soft min-h-[1.5em] text-base">
              {MSGS[msgIdx]}
            </p>

            {/* Barra de progreso */}
            <div className="bg-surface rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-lima to-celeste rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-foreground/40">
              Calculando macros y plan con alimentos guatemaltecos…
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
