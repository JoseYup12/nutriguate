import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import type { FormData } from "./FormularioDiagnostico";
import type { NutritionPlan } from "@/lib/claude";
import type { SheetUser } from "@/lib/googleSheets";
import {
  MOCK_CHECKINS,
  MOCK_STREAK,
  MOCK_WEEKLY_CHALLENGE,
  MOCK_BADGES,
  type DailyCheckin,
  type UserStreak,
  type WeeklyChallenge,
  type UserBadge,
} from "@/lib/retention";
import { StreakDisplay }       from "@/components/retention/StreakDisplay";
import { CheckinCalendar }     from "@/components/retention/CheckinCalendar";
import { AdherenceChart }      from "@/components/retention/AdherenceChart";
import { WeeklyChallengeCard } from "@/components/retention/WeeklyChallengeCard";
import { BadgesSection }       from "@/components/retention/BadgesSection";
import { DailyCheckin as DailyCheckinForm } from "@/components/retention/DailyCheckin";
import { getUserPlans, type SavedPlan } from "@/lib/nutrition-plans";
import { downloadPlanPDF } from "@/lib/pdf-generator";
import heroImg from "@/assets/hero-person.jpg";
import mealPlate from "@/assets/meal-plate.jpg";
import fitnessMan from "@/assets/fitness-man.jpg";
import marketImg from "@/assets/market-flatlay.jpg";

/* ── Tabs ── */
const tabs = [
  { id: "resumen",    label: "Resumen"    },
  { id: "nutricion",  label: "Nutrición"  },
  { id: "actividad",  label: "Actividad"  },
  { id: "metas",      label: "Metas"      },
  { id: "compras",    label: "Compras"    },
  { id: "progreso",   label: "Mi Progreso" },
  { id: "planes",     label: "Mis Planes"  },
];

const tabBg: Record<string, string> = {
  resumen:   heroImg,
  nutricion: mealPlate,
  actividad: fitnessMan,
  metas:     heroImg,
  compras:   marketImg,
  progreso:  fitnessMan,
  planes:    heroImg,
};

/* ════════════════════════════════════════════════════════════════════════════
   Dashboard
   ════════════════════════════════════════════════════════════════════════════ */
export const Dashboard = ({
  formData,
  planData,
  currentUser,
  onRestart,
  onLogout,
}: {
  formData: FormData;
  planData: NutritionPlan | null;
  currentUser?: SheetUser | null;
  onRestart: () => void;
  onLogout?: () => void;
}) => {
  const [tab, setTab]         = useState("resumen");
  const [dayIdx, setDayIdx]   = useState(0); // selector de día para nutrición

  /* ── Planes guardados ── */
  const [savedPlans, setSavedPlans]   = useState<SavedPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setPlansLoading(true);
    getUserPlans(currentUser.id)
      .then(setSavedPlans)
      .finally(() => setPlansLoading(false));
  }, [currentUser]);

  /* ── Estado de retención (mock hasta Supabase) ── */
  const [checkins, setCheckins]             = useState<DailyCheckin[]>(MOCK_CHECKINS);
  const [streak, setStreak]                 = useState<UserStreak>(MOCK_STREAK);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(MOCK_WEEKLY_CHALLENGE);
  const [badges]                            = useState<UserBadge[]>(MOCK_BADGES);

  const todayStr     = new Date().toISOString().split("T")[0];
  const todayCheckin = checkins.find((c) => c.date === todayStr) ?? null;

  /* Adherencia semanal (% días con adherencia > 7 en los últimos 7 días) */
  const weekAdherence = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    const weekCi = checkins.filter((c) => c.date >= cutoffStr);
    if (weekCi.length === 0) return 0;
    const good = weekCi.filter((c) => c.adherence_score > 7).length;
    return Math.round((good / 7) * 100);
  })();

  /* Callback al completar check-in */
  const handleCheckinComplete = (newCheckin: DailyCheckin) => {
    setCheckins((prev) => {
      const withoutToday = prev.filter((c) => c.date !== newCheckin.date);
      return [...withoutToday, newCheckin].sort((a, b) => a.date.localeCompare(b.date));
    });
    // Actualizar racha
    setStreak((prev) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      const isConsecutive = prev.last_checkin_date === yStr || prev.last_checkin_date === todayStr;
      const newStreak = isConsecutive ? prev.current_streak + 1 : 1;
      return {
        ...prev,
        current_streak:   newStreak,
        max_streak:       Math.max(prev.max_streak, newStreak),
        last_checkin_date: todayStr,
      };
    });
  };

  /* ── Valores desde el plan o fallback ── */
  const macros = planData
    ? [
        [planData.macros.kcal.toLocaleString("es-GT"), "kcal/día"],
        [`${planData.macros.proteina_g}g`, "Proteínas"],
        [`${planData.macros.carbs_g}g`, "Carbos"],
        [`${planData.macros.grasas_g}g`, "Grasas"],
      ]
    : [
        ["—", "kcal/día"],
        ["—", "Proteínas"],
        ["—", "Carbos"],
        ["—", "Grasas"],
      ];

  const casoNombre = planData?.caso.nombre ?? "Tu plan personalizado";
  const dias       = planData?.plan_nutricional ?? [];
  const diaActual  = dias[dayIdx];
  const metas      = planData?.metas ?? [];
  const compras    = planData?.lista_compras ?? [];
  const actividad  = planData?.actividad;

  /* ── Agrupar compras por tienda ── */
  const comprasPorTienda = compras.reduce<Record<string, typeof compras>>(
    (acc, item) => {
      const tienda = item.tienda || "Mercado";
      if (!acc[tienda]) acc[tienda] = [];
      acc[tienda].push(item);
      return acc;
    },
    {},
  );

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-background pb-16">

      {/* ── Header sticky ── */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-lima/10 px-5 py-3 flex items-center justify-between gap-3">
        <Logo size="sm" />

        {/* Usuario actual */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-center">
            <div className="w-7 h-7 rounded-full bg-lima/15 border border-lima/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lima text-xs font-bold">
                {currentUser.nombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-semibold text-foreground/60 truncate max-w-[160px]">
              {currentUser.nombre}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            className="text-xs text-foreground/55 hover:text-lima border border-lima/15 rounded-full px-3 py-1.5 transition-colors"
          >
            ← Inicio
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="text-xs text-foreground/35 hover:text-crimson/70 border border-lima/10 rounded-full px-3 py-1.5 transition-colors"
            >
              Salir
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">

        {/* ── Hero card ── */}
        <div className="relative rounded-2xl overflow-hidden border border-celeste/25 mb-4 min-h-[180px]">
          <img src={tabBg[tab]} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
          <div className="relative p-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-celeste mb-1.5">
                Tu sistema activo
              </div>
              <div className="font-display text-3xl mb-3">
                {currentUser?.nombre || formData.name || "Bienvenido"}
              </div>
              <div className="inline-flex items-center gap-1.5 bg-celeste/15 border border-celeste/30 rounded-full px-3 py-1 text-xs font-bold text-celeste">
                {casoNombre}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-1">
                Próxima revisión
              </div>
              <div className="font-display text-xl text-lima">En 14 días</div>
            </div>
          </div>
        </div>

        {/* ── Macros ── */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {macros.map(([v, l]) => (
            <div key={l} className="bg-surface border border-lima/10 rounded-xl p-4 text-center">
              <div className="font-display text-2xl text-lima leading-none">{v}</div>
              <div className="text-[9px] uppercase tracking-wider text-foreground/45 mt-2">{l}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap border transition-all ${
                tab === t.id
                  ? "bg-lima/15 text-lima border-lima/40"
                  : "bg-transparent text-foreground/50 border-lima/8 hover:text-foreground hover:border-lima/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════ CONTENIDO POR TAB ════════════ */}
        <div className="anim-fade-up">

          {/* ── RESUMEN ── */}
          {tab === "resumen" && (
            <div className="flex flex-col gap-3">
              <div className="glass-card p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-2">
                  Diagnóstico de tu caso
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {planData?.diagnostico ?? "Tu plan ha sido generado. Explora las secciones para ver todos los detalles."}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-2">
                  Por qué este plan es correcto para ti
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {planData?.caso.insight ?? "Tu plan está personalizado para tu caso específico."}
                </p>
              </div>

              {planData?.caso.fallo && (
                <div className="rounded-xl border border-crimson/20 bg-crimson/5 p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-crimson mb-2">
                    Lo que estaba fallando antes
                  </div>
                  <p className="text-sm text-foreground/75 leading-relaxed">
                    {planData.caso.fallo}
                  </p>
                </div>
              )}

              <div className="bg-lima/10 border border-lima/25 rounded-xl p-5 text-sm text-foreground/75 leading-relaxed">
                <strong className="text-lima">En 14 días ajustaremos tu plan</strong> según tu progreso.
                Registra tu peso y adherencia para recibir el plan actualizado.
              </div>

              {!planData && (
                <div className="bg-gold/8 border border-gold/25 rounded-xl p-4 text-sm text-foreground/70">
                  <strong className="text-gold">⚠️ Modo demostración:</strong> No se pudo conectar con Claude AI.
                  Configura <code className="text-lima text-xs">VITE_ANTHROPIC_API_KEY</code> en{" "}
                  <code className="text-lima text-xs">.env.local</code> y reinicia el servidor para ver tu plan real.
                </div>
              )}
            </div>
          )}

          {/* ── NUTRICIÓN ── */}
          {tab === "nutricion" && (
            <div className="glass-card overflow-hidden">
              {/* Selector de días */}
              {dias.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-celeste/15 to-lima/10 px-6 py-4 flex items-center justify-between border-b border-lima/10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/55 mb-1">
                        Selecciona el día
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {dias.map((d, i) => (
                          <button
                            key={d.dia}
                            onClick={() => setDayIdx(i)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              dayIdx === i
                                ? "bg-lima text-background border-lima"
                                : "bg-transparent text-foreground/55 border-lima/20 hover:border-lima/50"
                            }`}
                          >
                            {d.dia}
                          </button>
                        ))}
                      </div>
                    </div>
                    {diaActual && (
                      <div className="text-lima font-bold text-sm">
                        {diaActual.comidas.reduce((s, c) => s + (c.total_kcal || 0), 0).toLocaleString("es-GT")} kcal
                      </div>
                    )}
                  </div>

                  {diaActual ? (
                    <div className="p-5 flex flex-col gap-3">
                      {diaActual.comidas.map((comida) => (
                        <div key={comida.nombre} className="bg-surface border border-lima/8 rounded-xl overflow-hidden">
                          <div className="flex justify-between items-center px-5 py-3 border-b border-lima/8">
                            <div>
                              <div className="font-bold text-sm">{comida.nombre}</div>
                              <div className="text-[10px] text-foreground/45 mt-0.5">{comida.hora}</div>
                            </div>
                            <div className="text-xs font-bold text-lima">
                              {comida.total_kcal} kcal
                            </div>
                          </div>
                          <div className="px-5 py-3 flex flex-col gap-2">
                            {(comida.items ?? []).map((item, ii) => (
                              <div key={ii} className="flex justify-between items-center text-sm">
                                <span className="text-foreground/75">{item.alimento}</span>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-foreground/40 text-xs">{item.cantidad}</span>
                                  <span className="text-foreground/45 text-xs w-16 text-right">{item.kcal} kcal</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-foreground/40 text-sm">
                      No hay comidas para este día.
                    </div>
                  )}
                </>
              ) : (
                /* Fallback sin datos */
                <div className="p-8 text-center">
                  <div className="text-foreground/40 text-sm mb-2">Plan no disponible</div>
                  <p className="text-xs text-foreground/30">
                    Configura tu API key para generar un plan nutricional real.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVIDAD ── */}
          {tab === "actividad" && (
            <div className="flex flex-col gap-3">
              {actividad ? (
                <>
                  <div className="glass-card p-6">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-3">
                      Tu protocolo de actividad física
                    </div>
                    <div className="bg-celeste/8 border border-celeste/30 rounded-xl p-5 mb-5">
                      <div className="font-bold text-celeste mb-1.5">{actividad.tipo}</div>
                      <div className="text-sm text-foreground/70">{actividad.descripcion}</div>
                    </div>
                    <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
                      {actividad.semana1 && (
                        <p>
                          <strong className="text-lima">Semana 1: </strong>
                          {actividad.semana1}
                        </p>
                      )}
                      {actividad.semana2 && (
                        <p>
                          <strong className="text-lima">Semana 2: </strong>
                          {actividad.semana2}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-surface border border-lima/10 rounded-xl p-5 text-xs text-foreground/55 leading-relaxed">
                    <strong className="text-lima text-xs">Contexto configurado: </strong>
                    {formData.contextoActividad} · {formData.diasEntrenar} días/sem · {formData.minutosDisponibles} min/sesión
                  </div>
                </>
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="text-foreground/40 text-sm">Protocolo de actividad no disponible.</div>
                </div>
              )}
            </div>
          )}

          {/* ── METAS ── */}
          {tab === "metas" && (
            <div className="flex flex-col gap-3">
              {metas.length > 0 ? (
                metas.map((meta, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-5 ${
                      meta.fase.toLowerCase().includes("verde")
                        ? "bg-lima/8 border-lima/25"
                        : meta.fase.toLowerCase().includes("ajuste")
                        ? "bg-gold/8 border-gold/25"
                        : "glass-card"
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                      meta.fase.toLowerCase().includes("verde")
                        ? "text-lima"
                        : meta.fase.toLowerCase().includes("ajuste")
                        ? "text-gold"
                        : "text-foreground/45"
                    }`}>
                      {meta.fase}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{meta.meta}</p>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="text-foreground/40 text-sm">Metas no disponibles.</div>
                </div>
              )}
            </div>
          )}

          {/* ── COMPRAS ── */}
          {tab === "compras" && (
            <div className="flex flex-col gap-3">
              {compras.length > 0 ? (
                Object.entries(comprasPorTienda).map(([tienda, items]) => (
                  <div key={tienda} className="glass-card overflow-hidden">
                    <div className="bg-lima/10 border-b border-lima/10 px-5 py-3 flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-widest text-lima">
                        {tienda}
                      </div>
                      <div className="text-[10px] text-foreground/40">
                        {items.length} {items.length === 1 ? "producto" : "productos"}
                      </div>
                    </div>
                    <div className="px-5">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-lima/8 py-3 last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground/85 font-medium truncate">
                              {item.item}
                            </div>
                            <div className="text-[10px] text-foreground/40 mt-0.5">{item.cantidad}</div>
                          </div>
                          <div className="text-lima font-bold text-sm flex-shrink-0 ml-4">
                            {item.precio_gt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="text-foreground/40 text-sm">Lista de compras no disponible.</div>
                </div>
              )}

              {compras.length > 0 && (
                <div className="bg-lima/10 border border-lima/25 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-sm font-bold text-lima">Total estimado (3 días)</span>
                  <span className="font-display text-xl text-lima">
                    Q{compras
                      .map((c) => parseFloat(c.precio_gt.replace(/[^0-9.]/g, "") || "0"))
                      .reduce((a, b) => a + b, 0)
                      .toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── MI PROGRESO ── */}
          {tab === "progreso" && (
            <div className="flex flex-col gap-4">

              {/* Check-in del día */}
              <DailyCheckinForm
                planData={planData}
                currentStreak={streak.current_streak}
                todayCheckin={todayCheckin}
                onCheckinComplete={handleCheckinComplete}
              />

              {/* Racha */}
              <StreakDisplay
                streak={streak}
                checkedInToday={!!todayCheckin}
              />

              {/* Desafío semanal */}
              <WeeklyChallengeCard
                challenge={weeklyChallenge}
                weekAdherence={weekAdherence}
                onAccept={() =>
                  setWeeklyChallenge((prev) =>
                    prev ? { ...prev, accepted: true } : prev,
                  )
                }
                onDecline={() =>
                  setWeeklyChallenge((prev) =>
                    prev ? { ...prev, accepted: false } : prev,
                  )
                }
              />

              {/* Gráfico de adherencia */}
              <AdherenceChart checkins={checkins} />

              {/* Calendario de check-ins */}
              <CheckinCalendar checkins={checkins} />

              {/* Logros / badges */}
              <BadgesSection
                earned={badges}
                currentStreak={streak.current_streak}
              />

              {/* Contacto con asesor */}
              <div className="bg-surface border border-celeste/20 rounded-xl p-4 flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">📱</div>
                <div>
                  <div className="text-xs font-bold text-celeste mb-1">
                    ¿Necesitás ayuda personalizada?
                  </div>
                  <p className="text-[11px] text-foreground/50 leading-relaxed">
                    Contactá a nuestro asesor{" "}
                    <span className="text-celeste font-semibold">Irwing Samuel Sagastume Rossil</span>{" "}
                    al{" "}
                    <a href="tel:+50259102808" className="text-celeste font-semibold">+502 5910 2808</a>
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ── MIS PLANES ── */}
          {tab === "planes" && (
            <div className="flex flex-col gap-4">

              {/* Encabezado con contador */}
              <div className="bg-surface border border-lima/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lima/10 border border-lima/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-lima mb-0.5">PLANES NUTRICIONALES GENERADOS</div>
                  <div className="text-2xl font-black text-foreground">
                    {plansLoading ? "…" : savedPlans.length}
                    <span className="text-sm font-normal text-foreground/50 ml-2">
                      {savedPlans.length === 1 ? "plan generado" : "planes generados"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de planes */}
              {plansLoading && (
                <div className="text-center text-sm text-foreground/40 py-8">Cargando planes…</div>
              )}

              {!plansLoading && savedPlans.length === 0 && (
                <div className="bg-surface border border-white/10 rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3">🍽️</div>
                  <div className="text-sm font-semibold text-foreground/60 mb-1">Aún no tienes planes guardados</div>
                  <div className="text-xs text-foreground/35">Los planes que generes aparecerán aquí automáticamente.</div>
                </div>
              )}

              {!plansLoading && savedPlans.map((plan) => (
                <div key={plan.id} className="bg-surface border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">{plan.plan_name}</div>
                      <div className="text-[11px] text-foreground/40 mt-0.5">
                        {new Date(plan.created_at).toLocaleDateString("es-GT", {
                          day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[11px] text-foreground/50">
                          🔥 {plan.plan_data.macros.kcal.toLocaleString("es-GT")} kcal/día
                        </span>
                        <span className="text-[11px] text-foreground/50">
                          🍗 {plan.plan_data.macros.proteina_g}g proteína
                        </span>
                        <span className="text-[11px] text-lima font-semibold truncate">
                          {plan.plan_data.caso.nombre}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadPlanPDF(plan.plan_data, plan.form_data)}
                      className="flex-shrink-0 flex items-center gap-1.5 bg-lima/10 hover:bg-lima/20 border border-lima/30 text-lima text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                    >
                      <span>⬇️</span>
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Tip */}
              {!plansLoading && savedPlans.length > 0 && (
                <div className="text-[11px] text-foreground/30 text-center">
                  Solo vos podés ver tus planes. Son privados y exclusivos de tu cuenta.
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
