import { useState, useRef, useEffect } from "react";
import { Logo } from "@/components/Logo";
import heroImg from "@/assets/hero-person.jpg";
import marketImg from "@/assets/market-flatlay.jpg";
import mealPlate from "@/assets/meal-plate.jpg";

/* ─────────────────────── static data (sin cambios) ─────────────────────── */
const puntos = [
  { t: "Análisis clínico real", d: "No es un contador de calorías. Es un sistema que clasifica tu caso entre 7 perfiles clínicos y genera un plan específico para tu situación." },
  { t: "100% guatemalteco", d: "Tortillas, frijoles, güisquil, chipilín, incaparina. Alimentos reales de tu mercado, con precios reales de La Torre, Walmart y Despensa Familiar." },
  { t: "Análisis con foto", d: "Sube una foto corporal opcional y la IA analiza tu composición para afinar aún más el diagnóstico." },
  { t: "Se ajusta cada 14 días", d: "No es un plan estático. Cada dos semanas el sistema revisa tu progreso y actualiza calorías, estructura y actividad." },
];

const stats = [
  { n: "7", l: "Perfiles clínicos" },
  { n: "100%", l: "Alimentos GT" },
  { n: "14", l: "Días por ajuste" },
  { n: "<1 min", l: "Diagnóstico" },
];

const compTabla = [
  ["Precio mensual", "Q99-199", "~Q85/mes", "~Q155/mes", "~Q93/mes", "~Q465/mes"],
  ["Diagnóstico clínico", "✓ 7 perfiles", "Template", "Template", "Template", "Parcial"],
  ["Alimentos guatemaltecos", "✓ 100%", "Parcial LATAM", "—", "—", "—"],
  ["Lista compras con precios GT", "✓ La Torre, Walmart", "—", "—", "—", "—"],
  ["Análisis con foto corporal", "✓ con IA", "—", "—", "—", "—"],
  ["Ajuste automático", "✓ cada 14 días", "Manual", "Manual", "Semanal", "Semanal"],
  ["Condiciones de salud", "✓ Adapta alimentos", "Básico", "Básico", "—", "Básico"],
  ["Registro diario obligatorio", "No", "Sí", "Sí", "Sí", "Sí"],
  ["Sin app que descargar", "✓ Web directa", "App", "App", "App", "App"],
];

const cierreItems = [
  "Seguirás comiendo sin saber si lo que comes funciona para tu caso específico.",
  "Seguirás haciendo ejercicio sin dirección, o dejando de hacerlo.",
  "En tres meses estarás en el mismo lugar, buscando otra solución.",
  "El tiempo perdido no se recupera. Cada semana sin sistema es una semana sin progreso.",
];

const reposicion: [string, string][] = [
  ["No es una dieta", "Las dietas tienen inicio y fin. Esto no."],
  ["No es otra app de calorías", "No registras cada comida. El sistema trabaja por ti."],
  ["Es un sistema de ejecución", "Te dice exactamente qué hacer, para tu caso, con tus alimentos, en tu realidad."],
];

const visualizacion = [
  "Sabes exactamente qué comer mañana: sin pensar, sin buscar, sin dudar.",
  "Tu plan usa tortillas, frijoles, lo que ya tienes en tu casa o mercado.",
  "En 14 días el sistema revisa tu progreso y ajusta. No tienes que hacer nada extra.",
  "Por primera vez, entiendes por qué tu cuerpo responde como responde.",
];

/* ─────────────────────── duración del demo (sin video real) ──────────────── */
const DEMO_DURATION_MS = 12_000; // 12 s simulados; cambia al agregar video real

/* ════════════════════════════════════════════════════════════════════════════
   VSLPage
   ════════════════════════════════════════════════════════════════════════════ */
export const VSLPage = ({ onStart }: { onStart: () => void }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [isSticky, setIsSticky] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCardRef = useRef<HTMLDivElement>(null); // observado para el sticky
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── IntersectionObserver: sticky cuando la tarjeta sale del viewport ── */
  useEffect(() => {
    const card = videoCardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  /* ── Limpiar timer al desmontar ── */
  useEffect(() => () => { if (demoTimer.current) clearInterval(demoTimer.current); }, []);

  /* ── Iniciar reproducción: real o demo ── */
  const handlePlayClick = () => {
    const vid = videoRef.current;
    if (vid && vid.currentSrc) {
      vid.play();
    } else {
      // Modo demo (sin URL de video real)
      setIsPlaying(true);
      setProgress(0);
      const start = Date.now();
      demoTimer.current = setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / DEMO_DURATION_MS) * 100);
        setProgress(pct);
        if (pct >= 100) {
          clearInterval(demoTimer.current!);
          demoTimer.current = null;
          setIsPlaying(false);
          setVideoEnded(true);
          setProgress(100);
        }
      }, 80);
    }
  };

  const scrollToVideo = () =>
    videoCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  /* ── CTA compartido (bloqueado/habilitado según videoEnded) ── */
  const CTAButton = ({ className = "" }: { className?: string }) => (
    <div className={className}>
      <button
        onClick={videoEnded ? onStart : undefined}
        disabled={!videoEnded}
        aria-disabled={!videoEnded}
        className={[
          "w-full rounded-xl py-4 font-extrabold text-base transition-all duration-300",
          videoEnded
            ? "cta-primary"
            : "bg-surface border-2 border-lima/10 text-foreground/30 cursor-not-allowed select-none",
        ].join(" ")}
      >
        {videoEnded
          ? "Descubrir qué necesita mi cuerpo — Gratis"
          : "🔒 Mira el video para continuar"}
      </button>
      {!videoEnded && (
        <p className="text-center text-[11px] text-foreground/35 mt-2">
          El botón se habilitará cuando termines de ver el video
        </p>
      )}
      {videoEnded && (
        <p className="text-center text-xs text-foreground/40 mt-3">
          Sin tarjeta · Sin registro · Resultado en menos de 2 minutos
        </p>
      )}
    </div>
  );

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="border-b border-lima/10 px-6 py-5 flex justify-center sticky top-0 z-20 bg-background/90 backdrop-blur-md">
        <Logo size="md" />
      </header>

      {/* ── Hero ── */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-25" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center anim-fade-up">
          <div className="inline-block bg-lima/12 border border-lima/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur">
            <span className="text-lima text-[10px] font-bold tracking-widest uppercase">
              Sistema Inteligente de Transformación Corporal
            </span>
          </div>
          <h1 className="font-display text-[clamp(2.6rem,7vw,4.4rem)] leading-[1.02] mb-6 text-balance">
            Deja de adivinar.<br />
            <span className="text-lima">Tu cuerpo tiene una solución exacta.</span>
          </h1>
          <p className="text-foreground/70 text-lg leading-relaxed max-w-xl mx-auto">
            NutriGuate analiza tu caso clínico específico y te dice exactamente qué comer,
            cómo moverte y cómo progresar — con alimentos de tu mercado local y a un costo
            que cualquier guatemalteco puede pagar.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 pb-16">

        {/* ══════════════ SECCIÓN DE VIDEO ══════════════ */}
        <div ref={videoCardRef} className="glass-card overflow-hidden mb-12 anim-fade-up">

          {/* Reproductor */}
          <div className="relative aspect-video bg-background overflow-hidden">
            {/* Poster de fondo */}
            <img
              src={mealPlate}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background/70 pointer-events-none" />

            {/* Elemento <video> real ─ descomenta src cuando tengas el video */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              poster={mealPlate}
              // src="/video/nutriguate-vsl.mp4"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => { setVideoEnded(true); setIsPlaying(false); setProgress(100); }}
              onTimeUpdate={() => {
                const v = videoRef.current;
                if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
              }}
            />

            {/* Overlay: play / ended */}
            {!isPlaying && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                {!videoEnded ? (
                  <>
                    <button
                      onClick={handlePlayClick}
                      className="w-24 h-24 rounded-full bg-lima/20 border-2 border-lima/60 flex items-center justify-center hover:scale-110 hover:bg-lima/30 transition-all backdrop-blur-sm"
                    >
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="hsl(var(--lima))">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <div className="text-center">
                      <p className="font-bold text-lg mb-1">Mira cómo funciona NutriGuate</p>
                      <p className="text-sm text-foreground/60">2 minutos · Cambiará cómo ves tu nutrición</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-lima/20 border-2 border-lima flex items-center justify-center mx-auto mb-4">
                      <svg
                        width="28" height="28" viewBox="0 0 24 24"
                        fill="none" stroke="hsl(var(--lima))"
                        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="font-display text-3xl text-lima mb-2">¡Video completado!</div>
                    <p className="text-foreground/70">El botón de abajo ya está habilitado.</p>
                  </div>
                )}
              </div>
            )}

            {/* Indicador "REPRODUCIENDO" */}
            {isPlaying && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/75 backdrop-blur rounded-full px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-crimson anim-pulse-soft" />
                <span className="text-[10px] font-bold tracking-widest text-foreground/80 uppercase">
                  Reproduciendo
                </span>
              </div>
            )}

            {/* Barra de progreso */}
            <div className="absolute bottom-0 left-0 right-0 z-10 h-1.5 bg-surface/40">
              <div
                className="h-full bg-gradient-to-r from-lima to-celeste transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTA incrustado debajo del video */}
          <div className="p-5 border-t border-lima/8">
            <CTAButton />
          </div>
        </div>

        {/* ── 4 puntos ── */}
        <div className="grid sm:grid-cols-2 gap-3 mb-12 anim-fade-up">
          {puntos.map((p, i) => (
            <div key={p.t} className="bg-surface border border-lima/10 rounded-xl p-5 hover:border-lima/30 hover:bg-lima/5 transition-all">
              <div className="font-display text-3xl text-lima/40 mb-3">0{i + 1}</div>
              <div className="font-bold text-base text-lima mb-2">{p.t}</div>
              <div className="text-sm text-foreground/65 leading-relaxed">{p.d}</div>
            </div>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-3 mb-14">
          {stats.map((s) => (
            <div key={s.l} className="text-center bg-surface border border-lima/10 rounded-xl p-4">
              <div className="font-display text-3xl text-lima">{s.n}</div>
              <div className="text-[10px] uppercase tracking-wider text-foreground/45 mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Sección con foto de mercado + tabla comparativa ── */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={marketImg} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-2">¿Por qué NutriGuate y no otra app?</h2>
          <p className="text-sm text-foreground/55 text-center mb-8">Comparado con las apps más populares del mundo</p>
          <div className="overflow-x-auto rounded-xl border border-lima/15 bg-surface/80 backdrop-blur">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="bg-lima">
                  {["Característica", "NutriGuate", "Fitia", "MyFitnessPal", "MacroFactor", "Noom"].map((h) => (
                    <th key={h} className="px-3 py-3.5 text-left font-black uppercase tracking-wider text-background whitespace-nowrap text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compTabla.map(([feat, ...vals]) => (
                  <tr key={feat} className="border-b border-lima/8">
                    <td className="px-3 py-2.5 text-foreground/80 font-semibold whitespace-nowrap">{feat}</td>
                    {vals.map((v, vi) => (
                      <td key={vi} className={`px-3 py-2.5 whitespace-nowrap ${vi === 0 ? "text-lima font-bold" : v.startsWith("✓") ? "text-lima/80" : v === "—" ? "text-crimson/60" : "text-foreground/55"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Bloque de cierre + CTA final ── */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="glass-card p-7 md:p-10 mb-10 flex flex-col gap-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-foreground/45 font-bold mb-3">Si llegaste hasta aquí</p>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2rem)] mb-4 leading-tight">
              No es la primera vez que intentas cambiar tu cuerpo.
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              Probaste dietas. Seguiste rutinas. Te motivaste en enero. Y en algún punto, algo no funcionó
              y volviste al punto de partida. No porque te faltó esfuerzo. Porque te faltó un sistema.
            </p>
          </div>

          <div className="bg-surface border border-celeste/20 rounded-xl p-6">
            <p className="text-celeste font-bold text-[10px] uppercase tracking-widest mb-3">El problema real</p>
            <p className="text-sm text-foreground/75 leading-relaxed">
              La disciplina no es el problema. El problema es improvisar: comer "algo saludable" sin saber
              si aplica para tu caso, hacer ejercicio sin saber si es el correcto para tu objetivo, esperar
              resultados sin saber qué señales buscar. Sin un sistema, cada semana empiezas desde cero.
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/45 font-bold mb-4">
              Qué pasa si no haces nada hoy
            </p>
            <div className="flex flex-col gap-2">
              {cierreItems.map((item, i) => (
                <div key={i} className="flex gap-3 bg-crimson/8 border border-crimson/20 rounded-lg px-4 py-3">
                  <span className="text-crimson font-black flex-shrink-0">→</span>
                  <p className="text-sm text-foreground/75 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-crimson/8 border border-crimson/25 rounded-xl p-5 text-center">
              <p className="text-crimson font-black text-sm mb-2">Si no haces nada</p>
              <p className="text-foreground/55 text-xs leading-relaxed">Misma rutina. Misma frustración. El ciclo se repite.</p>
            </div>
            <div className="bg-lima/10 border border-lima/30 rounded-xl p-5 text-center">
              <p className="text-lima font-black text-sm mb-2">Si actúas hoy</p>
              <p className="text-foreground/70 text-xs leading-relaxed">Un sistema exacto para tu caso. Sin improvisar. Con progreso real.</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-foreground/45 font-bold mb-4 text-center">
              Qué es NutriGuate realmente
            </p>
            {reposicion.map(([t, d], i) => (
              <div key={t} className={`flex gap-3 py-3 ${i < 2 ? "border-b border-lima/8" : ""}`}>
                <span className="text-lima font-bold flex-shrink-0">✓</span>
                <div>
                  <span className="font-bold text-sm">{t}: </span>
                  <span className="text-sm text-foreground/65">{d}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-lima/8 border border-lima/25 rounded-xl p-6">
            <p className="text-lima font-bold text-[10px] uppercase tracking-widest mb-4">Imagina esto</p>
            {visualizacion.map((item, i) => (
              <div key={i} className="flex gap-3 mb-2.5 last:mb-0">
                <span className="text-lima flex-shrink-0">→</span>
                <p className="text-sm text-foreground/75 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <p className="text-foreground/50 text-sm leading-relaxed text-center italic">
            No hay contador. No hay oferta por tiempo limitado. La urgencia es simple: cada semana que
            pasa sin un sistema es una semana más de resultados que no llegan.
          </p>

          <div className="bg-surface border border-celeste/15 rounded-xl p-6 text-center">
            <p className="font-bold mb-3 text-base">"Ya lo intenté antes y no funcionó."</p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              No es tu culpa. Probaste métodos: dietas, rutinas, apps de conteo. Lo que no tuviste fue un
              sistema construido para tu caso específico. Esa es la diferencia.
            </p>
          </div>
        </div>

        {/* CTA final */}
        <CTAButton />
      </main>

      {/* ══════════════ STICKY PiP PLAYER ══════════════
          Aparece cuando la tarjeta de video sale del viewport                 */}
      {isSticky && (
        <div
          className="fixed bottom-6 right-6 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl border border-lima/25"
          style={{ background: "hsl(var(--surface))", backdropFilter: "blur(16px)" }}
        >
          {/* Vista previa mini */}
          <div className="relative h-40 overflow-hidden">
            <img src={mealPlate} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/85 flex flex-col items-center justify-center gap-2 p-4">
              {videoEnded ? (
                <>
                  <div className="w-11 h-11 rounded-full bg-lima/20 border border-lima flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="hsl(var(--lima))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-lima font-bold text-sm">Video completado</p>
                  <p className="text-foreground/50 text-xs text-center">El botón ya está habilitado ↓</p>
                </>
              ) : isPlaying ? (
                <>
                  <div className="w-11 h-11 rounded-full border-[3px] border-lima/20 border-t-lima anim-spin-slow" />
                  <p className="text-foreground/70 text-sm font-semibold">Reproduciéndose…</p>
                  <p className="text-foreground/40 text-xs">Sigue leyendo mientras tanto</p>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePlayClick}
                    className="w-11 h-11 rounded-full bg-lima/20 border border-lima/60 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="hsl(var(--lima))">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <p className="text-foreground/60 text-sm">Video en pausa</p>
                </>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="h-1 bg-background/40">
            <div
              className="h-full bg-gradient-to-r from-lima to-celeste transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Pie del player */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-lima/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
              {videoEnded ? "✓ Listo para continuar" : "📹 NutriGuate VSL"}
            </span>
            <button
              onClick={scrollToVideo}
              className="text-xs font-bold text-lima hover:text-lima/70 transition-colors flex items-center gap-1"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Ver completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
