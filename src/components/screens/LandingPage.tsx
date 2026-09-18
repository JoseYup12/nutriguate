import { useState } from "react";
import heroImg    from "@/assets/hero-person.jpg";
import marketImg  from "@/assets/market-flatlay.jpg";
import marketScene from "@/assets/market-scene.jpg";
import mealPlate  from "@/assets/meal-plate.jpg";
import fitnessMan from "@/assets/fitness-man.jpg";
import t1 from "@/assets/testimonial-1.jpg";
import t2 from "@/assets/testimonial-2.jpg";
import t3 from "@/assets/testimonial-3.jpg";
import { Logo } from "@/components/Logo";

/* ── Datos estáticos ── */
const frustraciones = [
  "Como saludable pero no veo cambios",
  "He intentado dietas y no las mantengo",
  "Entreno pero no sé si lo hago bien",
  "No sé cuánto debo comer realmente",
  "Siento que hago cosas pero no avanzo",
];

const pasos = [
  { n: "01", t: "Analizamos tu caso",      d: "Datos reales: peso, talla, actividad, historial y objetivo. El sistema clasifica tu caso en segundos." },
  { n: "02", t: "Definimos tu estrategia", d: "El sistema determina el enfoque exacto: calorías, macros, tipo de alimentación y actividad física." },
  { n: "03", t: "Te damos un plan completo",d: "Nutrición día a día + actividad adaptada + lista de supermercado con precios guatemaltecos." },
  { n: "04", t: "Ajustamos según tu progreso", d: "Cada 14 días registras tu avance y el sistema actualiza calorías, estructura y actividad." },
];

const testimonios = [
  { img: t1, nombre: "María R.",   edad: 34, situacion: "Probé varias dietas. Comía poco, entrenaba y no cambiaba.",              texto: "El sistema me mostró que estaba comiendo mucho menos proteína de la que necesitaba para mi peso. Con el ajuste correcto empecé a ver cambios en mi energía desde la primera semana.",    resultado: "Entendió qué fallaba",    caso: "Pérdida de grasa" },
  { img: t2, nombre: "Andrés P.",  edad: 29, situacion: "Entrenaba 4 veces por semana pero no veía cambios en composición.",       texto: "Descubrí que estaba comiendo los carbohidratos en el momento equivocado. Cuando el plan alineó la alimentación con mi actividad, en 3 semanas noté diferencia real en el espejo.",      resultado: "Composición mejoró",      caso: "Con actividad física" },
  { img: t3, nombre: "Claudia M.", edad: 41, situacion: "Quería mejorar su alimentación pero con presupuesto limitado.",           texto: "Lo que más me ayudó fue descubrir que el problema no era el dinero sino las elecciones. Con la lista de compras del sistema, comencé a comer mejor gastando igual o menos.",           resultado: "Come mejor, gasta igual", caso: "Presupuesto ajustado" },
];

const compTabla = [
  ["Precio mensual",                "Q99-199",          "~Q85/mes",    "~Q155/mes", "~Q93/mes",   "~Q465/mes"],
  ["Diagnóstico clínico",           "✓ 7 perfiles",     "Template",    "Template",  "Template",   "Parcial"],
  ["Alimentos guatemaltecos",       "✓ 100%",           "Parcial LATAM","—",        "—",          "—"],
  ["Lista compras con precios GT",  "✓ La Torre, Walmart","—",         "—",         "—",          "—"],
  ["Análisis con foto corporal",    "✓ con IA",         "—",           "—",         "—",          "—"],
  ["Ajuste automático",             "✓ cada 14 días",   "Manual",      "Manual",    "Semanal",    "Semanal"],
  ["Condiciones de salud",          "✓ Adapta alimentos","Básico",     "Básico",    "—",          "Básico"],
  ["Registro diario obligatorio",   "No",               "Sí",          "Sí",        "Sí",         "Sí"],
  ["Sin app que descargar",         "✓ Web directa",    "App",         "App",       "App",        "App"],
];

const faqItems: [string, string][] = [
  ["¿Cuánto tiempo toma ver resultados?",          "Los primeros cambios en energía y digestión suelen ocurrir en la primera semana. Cambios visibles en composición corporal típicamente entre la semana 3 y la semana 6, dependiendo del caso y la adherencia al plan."],
  ["¿El plan cambia con el tiempo?",               "Sí. Cada 14 días puedes registrar tu progreso y el sistema ajusta calorías, distribución de macros y actividad física según cómo estás respondiendo. No es un plan estático."],
  ["¿Es para principiantes o personas con experiencia?", "Para ambos. El sistema detecta tu nivel real y adapta todo — el tipo de alimentación, la estructura de las comidas y la prescripción de actividad física — según tu punto de partida."],
  ["¿Qué pasa si no sigo el plan perfectamente?", "Nada irreversible. El check-in de 14 días toma en cuenta tu adherencia real y ajusta el plan para que sea más sostenible. Un plan que se adapta a ti siempre será mejor que uno perfecto que no puedes seguir."],
  ["¿Incluye ejercicio o solo alimentación?",      "Los dos. Recibes un plan nutricional y una prescripción de actividad física adaptada a tu disponibilidad, contexto (casa, caminata o gimnasio) y nivel actual."],
];

const stats = [
  { v: "< 2 min", l: "Para obtener tu plan" },
  { v: "7",       l: "Perfiles de diagnóstico" },
  { v: "14 días", l: "Ciclo de ajuste adaptativo" },
  { v: "100%",    l: "Alimentos guatemaltecos" },
];

const beneficios = [
  { icon: "🎯", t: "Diagnóstico personalizado",    d: "El sistema analiza tu caso específico — no un template genérico. 7 perfiles clínicos distintos." },
  { icon: "🥑", t: "Alimentos de tu mercado",      d: "Tortillas, frijoles, güisquil, incaparina. Precios reales de La Torre, Walmart y Despensa Familiar." },
  { icon: "📊", t: "Plan con macros exactos",      d: "Calorías, proteína, carbohidratos y grasas calculados según tu cuerpo, objetivo y nivel de actividad." },
  { icon: "🔄", t: "Se ajusta cada 14 días",       d: "Registrás tu avance y el sistema actualiza todo — sin reiniciar, sin nueva dieta, sin adivinar." },
  { icon: "💪", t: "Incluye actividad física",     d: "Prescripción de ejercicio adaptada a tu disponibilidad: casa, caminata o gimnasio." },
  { icon: "🛒", t: "Lista de supermercado",        d: "Lista de compras semanal con cantidades exactas y precios comparados de supermercados guatemaltecos." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-2">
      {faqItems.map(([q, a], i) => (
        <div key={i} className={`bg-surface/70 backdrop-blur-sm rounded-lg border transition-colors ${open === i ? "border-lima/40" : "border-lima/10"}`}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left">
            <span className={`font-bold text-sm ${open === i ? "text-lima" : "text-foreground"}`}>{q}</span>
            <span className={`text-muted-foreground transition-transform text-xl ${open === i ? "rotate-45" : ""}`}>+</span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed anim-fade-up">{a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LandingPage
   ════════════════════════════════════════════════════════════════════════════ */
export const LandingPage = ({ onStart }: { onStart: () => void }) => {

  const CTAButton = ({ className = "", size = "base" }: { className?: string; size?: "base" | "lg" }) => (
    <div className={className}>
      <button
        onClick={onStart}
        className={[
          "w-full rounded-xl font-extrabold transition-all duration-300 cta-primary",
          size === "lg" ? "py-5 text-lg" : "py-4 text-base",
        ].join(" ")}
      >
        Realizar mi Plan Nutricional →
      </button>
      <p className="text-center text-xs text-foreground/45 mt-3">
        Gratis · Sin tarjeta · Resultado en menos de 2 minutos
      </p>
    </div>
  );

  return (
    <div className="bg-background text-foreground">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-lima/10 px-6 py-3 flex items-center justify-between gap-4">
        <Logo size="md" />
        <button
          onClick={onStart}
          className="cta-primary text-sm font-bold py-2.5 px-5 rounded-xl whitespace-nowrap"
        >
          Iniciar sesión →
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20">
          {/* Badge */}
          <div className="flex justify-center mb-6 anim-fade-up">
            <div className="inline-flex items-center gap-2 bg-lima/10 border border-lima/30 rounded-full px-4 py-1.5 backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full bg-lima anim-pulse-soft" />
              <span className="text-lima text-xs font-bold tracking-widest uppercase">
                Sistema nutricional · Guatemala
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10 anim-fade-up">
            <h1 className="font-display text-balance text-[clamp(2.4rem,7vw,4.8rem)] font-normal leading-[1.0] mb-5">
              Deja de adivinar qué hacer<br />
              <span className="text-lima">para cambiar tu cuerpo</span>
            </h1>
            <p className="text-foreground/70 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              NutriGuate analiza tu caso y te dice exactamente qué comer, cómo entrenar y cómo ajustar —
              según tu cuerpo y tu realidad guatemalteca.
            </p>
          </div>

          {/* CTA principal */}
          <div className="max-w-md mx-auto mb-14 anim-fade-up">
            <CTAButton size="lg" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 anim-fade-up">
            {stats.map(({ v, l }) => (
              <div key={l} className="glass-card p-5 text-center">
                <div className="font-display text-2xl text-lima mb-1">{v}</div>
                <div className="text-xs text-foreground/55 leading-tight">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BENEFICIOS ══════════ */}
      <section className="bg-surface py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Qué incluye</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)]">Todo lo que necesitás en un solo lugar</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {beneficios.map(({ icon, t, d }) => (
              <div key={t} className="bg-card-ng border border-lima/10 rounded-2xl p-7 hover:border-lima/40 hover:-translate-y-1 transition-all">
                <div className="text-4xl mb-4">{icon}</div>
                <div className="font-bold text-lima mb-2 text-base">{t}</div>
                <div className="text-sm text-foreground/65 leading-relaxed">{d}</div>
              </div>
            ))}
          </div>
          <div className="mt-12 max-w-md mx-auto">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* ══════════ FRUSTRACIONES ══════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={mealPlate} alt="" className="w-full h-full object-cover opacity-25" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">¿Te suena familiar?</p>
          <h2 className="font-display text-[clamp(2rem,5vw,3rem)] mb-12 leading-tight">
            La mayoría de personas en Guatemala<br />tiene este problema
          </h2>
          <div className="flex flex-col gap-3 text-left">
            {frustraciones.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-surface/80 backdrop-blur border border-crimson/15 rounded-lg px-5 py-4 anim-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="text-crimson font-black flex-shrink-0">✗</span>
                <span className="text-base text-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ QUOTE ══════════ */}
      <section className="bg-background py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-12 md:p-16 text-center border-lima/30">
            <div className="font-display text-lima text-7xl leading-none mb-6">"</div>
            <p className="font-display text-[clamp(1.5rem,3.2vw,2.2rem)] leading-snug -mt-4">
              El problema no es la dieta.<br />
              Es que nadie te ha dicho exactamente qué hacer según <em className="text-lima not-italic">tu cuerpo</em>.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ CÓMO FUNCIONA ══════════ */}
      <section className="bg-surface py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">Cómo funciona</p>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)]">Un sistema, no una dieta</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pasos.map(({ n, t, d }) => (
              <div key={n} className="bg-card-ng border border-lima/10 rounded-2xl p-7 hover:border-lima/40 hover:-translate-y-1 transition-all">
                <div className="font-display text-5xl text-lima/40 mb-5">{n}</div>
                <div className="font-bold text-lima mb-2 text-lg">{t}</div>
                <div className="text-sm text-foreground/65 leading-relaxed">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ POR QUÉ GUATEMALA ══════════ */}
      <section className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={marketScene} alt="Mercado guatemalteco" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        </div>
        <div className="relative max-w-2xl">
          <p className="eyebrow mb-4">Por qué Guatemala</p>
          <h2 className="font-display text-[clamp(2.2rem,5.5vw,3.8rem)] mb-6 leading-[1.05]">
            Tortillas, frijoles, güisquil, <span className="text-lima">incaparina</span>.
          </h2>
          <p className="text-foreground/80 text-lg leading-relaxed mb-8">
            Alimentos reales de tu mercado, con precios reales de La Torre, Walmart y Despensa Familiar. No es un plan importado: es un sistema diseñado para tu realidad.
          </p>
          <button onClick={onStart} className="cta-primary font-bold py-3.5 px-8 rounded-xl text-base">
            Realizar mi Plan →
          </button>
        </div>
      </section>

      {/* ══════════ PREVIEW DEL PLAN ══════════ */}
      <section className="bg-background">
        <div className="grid md:grid-cols-2 items-stretch">
          <div className="relative min-h-[420px] md:min-h-[720px]">
            <img src={marketImg} alt="Ingredientes guatemaltecos" className="absolute inset-0 w-full h-full object-cover object-center" loading="lazy" />
          </div>
          <div className="bg-surface flex items-center px-6 md:px-12 py-16">
            <div className="w-full max-w-xl mx-auto">
              <p className="eyebrow mb-3 text-center">Vista previa</p>
              <h3 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight mb-4 text-center">
                Así se verá tu plan
              </h3>
              <p className="text-foreground/65 leading-relaxed mb-8 text-center">
                Alimentos del mercado guatemalteco. Porciones exactas. Macros calculados.
              </p>

              <div className="rounded-2xl bg-lima/15 border border-lima/25 p-5 mb-8 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/55 mb-1">Ejemplo</div>
                  <div className="font-display text-xl leading-tight">Día 1 — Plan<br/>Balanceado</div>
                </div>
                <div className="flex items-end gap-4">
                  {[["🔥","1,650","kcal"],["🍗","124g","Proteína"],["🌽","165g","Carbos"],["🫒","55g","Grasas"]].map(([e,v,l]) => (
                    <div key={l} className="text-center">
                      <div className="text-lg leading-none mb-1">{e}</div>
                      <div className="font-display text-base text-lima leading-none">{v}</div>
                      <div className="text-[8px] uppercase tracking-wider text-foreground/50 mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-7">
                {[
                  {
                    icon: "🌅", n: "Desayuno", h: "7:00 am", total: "445 kcal",
                    items: [
                      ["🥚","2 huevos revueltos","200 kcal"],
                      ["🌽","2 tortillas de maíz (60g)","130 kcal"],
                      ["🫘","½ taza frijoles negros (120g)","110 kcal"],
                      ["☕","Café negro sin azúcar","5 kcal"],
                    ],
                  },
                  {
                    icon: "☀️", n: "Almuerzo", h: "12:30 pm", total: "441 kcal",
                    items: [
                      ["🍗","Pechuga de pollo (150g)","248 kcal"],
                      ["🌽","Arroz blanco (½ taza, 100g)","130 kcal"],
                      ["🥦","Güisquil cocido (150g)","38 kcal"],
                      ["🍅","Ensalada: tomate + cebolla","25 kcal"],
                    ],
                  },
                  {
                    icon: "🌙", n: "Cena", h: "7:00 pm", total: "301 kcal",
                    items: [
                      ["🥚","3 claras de huevo revueltas","51 kcal"],
                      ["🫘","¾ taza frijoles (180g)","165 kcal"],
                      ["🌽","1 tortilla (30g)","65 kcal"],
                      ["🌿","Chipilín salteado (50g)","20 kcal"],
                    ],
                  },
                ].map((c) => (
                  <div key={c.n}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5">{c.icon}</span>
                        <div>
                          <div className="font-bold text-base">{c.n}</div>
                          <div className="text-[11px] text-foreground/45 mt-0.5">{c.h}</div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-lima">{c.total}</div>
                    </div>
                    <div className="flex flex-col gap-2 pl-1">
                      {c.items.map(([e, name, kcal]) => (
                        <div key={name} className="flex justify-between items-center gap-3 text-sm">
                          <span className="flex items-start gap-2.5 text-foreground/80">
                            <span className="text-base leading-none mt-0.5 flex-shrink-0">{e}</span>
                            <span>{name}</span>
                          </span>
                          <span className="text-foreground/45 text-xs flex-shrink-0">{kcal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-card-ng border border-lima/10 p-4 text-xs leading-relaxed">
                <div className="text-foreground/70 flex items-start gap-2 mb-2">
                  <span>📍</span>
                  <span>Alimentos disponibles en cualquier mercado guatemalteco</span>
                </div>
                <div className="text-lima font-bold">+ Refacción incluida en tu plan real</div>
              </div>

              <div className="mt-8">
                <CTAButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIOS ══════════ */}
      <section className="bg-surface py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">Prueba social</p>
            <h2 className="font-display text-[clamp(2.2rem,5vw,3.2rem)]">Personas como vos ya dejaron de adivinar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((t) => (
              <div key={t.nombre} className="bg-card-ng border border-lima/10 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:border-lima/30 transition-all">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={t.img} alt={t.nombre} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                    <div>
                      <div className="font-bold text-base text-foreground">{t.nombre}, {t.edad}</div>
                      <div className="text-[10px] uppercase tracking-wider text-foreground/65 mt-0.5">{t.caso}</div>
                    </div>
                    <span className="bg-lima text-background text-[10px] font-black rounded-full px-2.5 py-1 flex-shrink-0">{t.resultado}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <p className="text-sm text-foreground/75 italic leading-relaxed flex-1">"{t.texto}"</p>
                  <div className="border-t border-lima/10 pt-3 text-xs text-foreground/45">{t.situacion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ COMPARATIVA ══════════ */}
      <section className="bg-background py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Comparativa</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,2.8rem)]">¿Por qué NutriGuate y no otra app?</h2>
            <p className="text-foreground/55 mt-3 text-sm">Comparado con las apps más populares del mundo</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-lima/15">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-lima">
                  {["Característica","NutriGuate","Fitia","MyFitnessPal","MacroFactor","Noom"].map((h) => (
                    <th key={h} className="text-left px-4 py-4 text-xs font-black uppercase tracking-wider text-background whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compTabla.map(([feat, ...vals]) => (
                  <tr key={feat} className="border-b border-lima/8 hover:bg-lima/5 transition-colors">
                    <td className="px-4 py-3 text-foreground/80 font-semibold whitespace-nowrap">{feat}</td>
                    {vals.map((v, vi) => (
                      <td key={vi} className={`px-4 py-3 whitespace-nowrap ${vi === 0 ? "text-lima font-bold" : v.startsWith("✓") ? "text-lima/85" : v === "—" ? "text-crimson/60" : "text-foreground/55"}`}>
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

      {/* ══════════ ESTO NO ES UNA DIETA ══════════ */}
      <section className="bg-surface">
        <div className="grid md:grid-cols-2 items-stretch">
          <div className="bg-background flex items-center px-8 md:px-14 py-16 order-2 md:order-1">
            <div>
              <p className="eyebrow mb-3">Sistema adaptativo</p>
              <h3 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight mb-5">Esto no es una dieta más</h3>
              <div className="flex flex-col gap-3 text-sm text-foreground/75 leading-relaxed">
                <p><strong className="text-lima">No estás comprando un menú:</strong> Un menú te dice qué comer hoy. Esto te dice por qué y qué cambia cuando vos cambiás.</p>
                <p><strong className="text-lima">Tu plan evoluciona con vos:</strong> Cada 14 días el sistema revisa tu progreso y ajusta todo — calorías, distribución, actividad.</p>
                <p><strong className="text-lima">No necesitás volver a empezar nunca:</strong> No hay una nueva dieta cada lunes. Hay un sistema que se adapta sin que tengás que resetear.</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[520px] order-1 md:order-2">
            <img src={fitnessMan} alt="Hombre entrenando en casa" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="bg-background py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">FAQ</p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,2.8rem)]">Preguntas frecuentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ══════════ CTA FINAL ══════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="font-display text-[clamp(1.2rem,3.2vw,1.6rem)] text-foreground/55 leading-snug mb-2">
            Podés seguir probando cosas al azar…
          </p>
          <p className="font-display text-[clamp(1.2rem,3.2vw,1.6rem)] text-foreground/55 leading-snug mb-8">
            y seguir exactamente donde estás en 3 meses.
          </p>
          <h2 className="font-display text-[clamp(1.6rem,4.5vw,2.4rem)] leading-tight mb-10">
            O podés entender tu cuerpo de una vez<br />
            <span className="text-lima">y empezar a ver cambios reales desde las próximas semanas.</span>
          </h2>
          <CTAButton size="lg" className="max-w-md mx-auto" />
          <p className="text-sm text-foreground/45 mt-6 italic">
            No necesitás más información.<br />Necesitás una decisión correcta.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background border-t border-lima/10 px-6 py-10 text-center">
        <div className="flex justify-center mb-4">
          <Logo size="sm" />
        </div>
        <p className="text-xs text-foreground/40 mt-2">NutriGuate © 2026 · Sistema inteligente de orientación nutricional · Guatemala 🇬🇹</p>
        <p className="text-[11px] text-foreground/30 mt-3 max-w-2xl mx-auto leading-relaxed">
          NutriGuate es una herramienta de orientación nutricional basada en inteligencia artificial. No reemplaza la consulta, diagnóstico ni tratamiento de un profesional de salud o nutricionista certificado. Si tenés condiciones médicas, consultá a tu médico antes de realizar cambios en tu alimentación o actividad física.
        </p>
      </footer>

    </div>
  );
};
