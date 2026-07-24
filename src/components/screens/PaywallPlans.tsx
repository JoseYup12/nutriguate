import { useState } from "react";
import { Logo } from "@/components/Logo";
import bgImg from "@/assets/meal-plate.jpg";
import { supabase } from "@/lib/supabase";

const PLANES = [
  { id: "gratis", precio: 0, label: "GRATIS", nombre: "Diagnóstico Inicial", sub: "Ya completado — descárgalo ahora",
    features: ["Clasificación de tu caso", "Diagnóstico personalizado", "Qué estabas haciendo mal", "Alimentación del Día 1"],
    locked: ["Plan 7 días completo", "Actividad física prescrita", "Lista de supermercado", "Metas por fase", "Ajuste cada 14 días"], badge: null as string | null },
  { id: "arranque", precio: 99, label: "Q99", nombre: "Plan de Arranque", sub: "Pago único, sin suscripción",
    features: ["Plan completo 7 días", "Prescripción de actividad física", "Metas semana 2 y 4", "Lista de compras con precios GT"],
    locked: ["Ajuste cada 14 días", "Historial de evolución"], badge: null },
  { id: "mensual", precio: 149, label: "Q149/mes", nombre: "Suscripción Mensual", sub: "El sistema que se ajusta contigo",
    features: ["Todo el Plan de Arranque", "Ajuste completo cada 14 días", "Plan actualizado con tu progreso", "Historial de evolución", "Acceso ilimitado"],
    locked: [], badge: "MÁS ELEGIDO" },
  { id: "premium", precio: 199, label: "Q199/mes", nombre: "Suscripción Plus", sub: "Con revisión profesional",
    features: ["Todo lo Mensual", "1 revisión WhatsApp con nutricionista/mes", "Soporte prioritario", "Análisis fotográfico incluido"],
    locked: [], badge: "PREMIUM" },
];

const PLANES_GRUPALES = [
  { id: "pareja_basic", precio: 179, label: "Q179/mes", nombre: "Plan Pareja Basic", sub: "2 perfiles · menús armonizados",
    features: ["2 planes individuales completos", "Menús almuerzo y cena armonizados", "Lista de compras consolidada", "WhatsApp compartido (3 consultas/sem por persona)", "Actualización automática día 14"],
    badge: null as string | null, grupo: "💑 Pareja" },
  { id: "pareja_plus", precio: 279, label: "Q279/mes", nombre: "Plan Pareja Plus", sub: "Todo el Basic + ajustes conjuntos",
    features: ["Todo lo del Pareja Basic", "Ajustes cada 14 días según progreso conjunto", "WhatsApp ilimitado para ambos"],
    badge: "PLUS", grupo: "💑 Pareja" },
  { id: "cuates_basic", precio: 159, label: "Q159/mes", nombre: "Plan Cuates Basic", sub: "2 planes independientes · mini challenge",
    features: ["2 perfiles completamente independientes", "Mini challenge semanal (competitivo + colaborativo)", "WhatsApp independiente (3 consultas/sem)", "Actualización automática día 14"],
    badge: null, grupo: "🤜🤛 Cuates" },
  { id: "cuates_plus", precio: 249, label: "Q249/mes", nombre: "Plan Cuates Plus", sub: "Todo el Basic + análisis comparativo",
    features: ["Todo lo del Cuates Basic", "WhatsApp ilimitado por persona", "Análisis comparativo de progreso cada 14 días"],
    badge: "PLUS", grupo: "🤜🤛 Cuates" },
  { id: "familiar_basic", precio: 299, label: "Q299/mes", nombre: "Plan Familiar Basic", sub: "3-5 personas · adultos, adolescentes y niños",
    features: ["Perfiles para adultos, adolescentes y niños", "Menús armonizados para toda la familia", "Lista de compras consolidada", "WhatsApp familiar (3 consultas/semana)", "Actualización automática día 14"],
    badge: "FAMILIAR", grupo: "👨‍👩‍👧‍👦 Familiar" },
  { id: "familiar_plus", precio: 449, label: "Q449/mes", nombre: "Plan Familiar Plus", sub: "Todo el Basic + ajustes individuales",
    features: ["Todo lo del Familiar Basic", "Ajustes individuales cada 14 días por miembro", "WhatsApp ilimitado para adultos"],
    badge: "PLUS", grupo: "👨‍👩‍👧‍👦 Familiar" },
];

export const PaywallPlans = ({ onActivate }: { onActivate: (planType: string) => void }) => {
  const [selected, setSelected] = useState("mensual");
  const [seccionActiva, setSeccionActiva] = useState<"individual" | "grupal">("individual");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const planIndividual = PLANES.find(p => p.id === selected);
  const planGrupal = PLANES_GRUPALES.find(p => p.id === selected);
  const plan = planIndividual ?? planGrupal!;

  const handlePago = async () => {
    if (selected === "gratis") { onActivate(selected); return; }
    setPaying(true); setPayError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesión expirada. Volvé a iniciar sesión.");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan_id: selected,
            success_url: `${window.location.origin}/?payment=success&plan=${selected}`,
            cancel_url:  `${window.location.origin}/?payment=cancelled`,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");
      window.location.href = data.checkout_url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Error al conectar con el sistema de pagos");
    } finally {
      setPaying(false);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImg} alt="" className="w-full h-full object-cover opacity-20" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center px-4 py-10">
        <div className="mb-8"><Logo size="md" /></div>

        <div className="w-full max-w-xl">
          <div className="text-center mb-8 anim-fade-up">
            <div className="inline-flex items-center gap-2 bg-celeste/12 border border-celeste/30 rounded-full px-4 py-1.5 mb-5">
              <span className="text-celeste text-xs font-bold tracking-widest uppercase">Recomposición corporal</span>
            </div>
            <h1 className="font-display text-[clamp(1.9rem,5.5vw,2.7rem)] leading-tight">
              Ya sabemos qué está pasando.<br /><span className="text-lima">Ahora te mostramos exactamente qué hacer.</span>
            </h1>
            <p className="text-foreground/65 mt-5 leading-relaxed">
              Tu sistema personalizado está listo. Actívalo para acceder al plan completo, el protocolo de actividad y los ajustes continuos.
            </p>
          </div>

          {/* Tu plan incluye */}
          <div className="glass-card p-5 mb-5 anim-fade-up">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-3">Tu plan incluye</div>
            <div className="flex flex-col gap-2 text-sm text-foreground/75">
              {[
                "Plan nutricional completo — 7 días con alimentos guatemaltecos",
                "Macros y calorías exactas por comida",
                "Prescripción de actividad física adaptada a tu contexto",
                "Explicación personalizada de por qué este plan es para ti",
                "Lista de supermercado con precios en Q comparados",
                "Metas por fase: semana 2, semana 4",
                "Ajuste completo del plan cada 14 días según tu progreso",
              ].map((it) => (
                <div key={it} className="flex gap-2.5"><span className="text-lima flex-shrink-0">✓</span><span>{it}</span></div>
              ))}
            </div>
          </div>

          {/* Selector individual / grupal */}
          <div className="flex gap-2 mb-4 p-1 bg-surface rounded-xl border border-lima/10">
            <button onClick={() => { setSeccionActiva("individual"); setSelected("mensual"); }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${seccionActiva === "individual" ? "bg-lima/15 text-lima border border-lima/30" : "text-foreground/50 hover:text-foreground/75"}`}>
              👤 Individual
            </button>
            <button onClick={() => { setSeccionActiva("grupal"); setSelected("pareja_basic"); }}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${seccionActiva === "grupal" ? "bg-celeste/15 text-celeste border border-celeste/30" : "text-foreground/50 hover:text-foreground/75"}`}>
              👥 Grupal
            </button>
          </div>

          {/* Planes individuales */}
          {seccionActiva === "individual" && (
            <div className="flex flex-col gap-2.5 mb-3">
              {PLANES.map(p => (
                <button key={p.id} type="button" onClick={() => setSelected(p.id)}
                  className={`relative text-left rounded-2xl border-[1.5px] p-5 transition-all backdrop-blur-sm ${selected === p.id ? "bg-lima/10 border-lima/50" : "bg-surface/80 border-lima/10 hover:border-lima/30"}`}>
                  {p.badge && <div className="absolute -top-2.5 right-3 bg-lima text-background text-[10px] font-black px-3 py-0.5 rounded-full tracking-wider">{p.badge}</div>}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === p.id ? "border-lima bg-lima" : "border-foreground/30"}`}>
                        {selected === p.id && <div className="w-2 h-2 rounded-full bg-background" />}
                      </div>
                      <div>
                        <div className="font-bold text-base">{p.nombre}</div>
                        <div className="text-xs text-foreground/55 mt-0.5">{p.sub}</div>
                      </div>
                    </div>
                    <div className={`font-display text-xl flex-shrink-0 ${p.precio === 0 ? "text-lima" : "text-gold"}`}>{p.label}</div>
                  </div>
                  {selected === p.id && (
                    <div className="pl-8 mt-4 flex flex-col gap-1.5 anim-fade-up">
                      {p.features.map(f => <div key={f} className="text-xs text-foreground/75 flex gap-2"><span className="text-lima">✓</span>{f}</div>)}
                      {p.locked.map(f => <div key={f} className="text-xs text-foreground/30 flex gap-2"><span>·</span>{f}</div>)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Planes grupales */}
          {seccionActiva === "grupal" && (
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-celeste mb-1">Planes grupales — un solo plan, varios perfiles</div>
              {PLANES_GRUPALES.map(p => (
                <button key={p.id} type="button" onClick={() => setSelected(p.id)}
                  className={`relative text-left rounded-2xl border-[1.5px] p-5 transition-all backdrop-blur-sm ${selected === p.id ? "bg-celeste/10 border-celeste/50" : "bg-surface/80 border-celeste/10 hover:border-celeste/30"}`}>
                  {p.badge && <div className="absolute -top-2.5 right-3 bg-celeste text-background text-[10px] font-black px-3 py-0.5 rounded-full tracking-wider">{p.badge}</div>}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected === p.id ? "border-celeste bg-celeste" : "border-foreground/30"}`}>
                        {selected === p.id && <div className="w-2 h-2 rounded-full bg-background" />}
                      </div>
                      <div>
                        <div className="text-[10px] text-celeste font-bold mb-0.5">{p.grupo}</div>
                        <div className="font-bold text-base">{p.nombre}</div>
                        <div className="text-xs text-foreground/55 mt-0.5">{p.sub}</div>
                      </div>
                    </div>
                    <div className="font-display text-xl flex-shrink-0 text-gold">{p.label}</div>
                  </div>
                  {selected === p.id && (
                    <div className="pl-8 mt-4 flex flex-col gap-1.5 anim-fade-up">
                      {p.features.map(f => <div key={f} className="text-xs text-foreground/75 flex gap-2"><span className="text-celeste">✓</span>{f}</div>)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {payError && (
            <div className="bg-crimson/10 border border-crimson/30 rounded-xl px-4 py-3 mt-3 text-sm text-crimson/90">
              {payError}
            </div>
          )}
          <button
            onClick={handlePago}
            disabled={paying}
            className={`w-full rounded-xl py-4 font-bold mt-3 transition-all ${
              paying ? "opacity-60 cursor-not-allowed bg-surface border border-lima/20 text-foreground/40"
              : selected === "gratis" ? "bg-lima text-background hover:brightness-110"
              : "bg-gradient-to-r from-lima to-[#5cb800] text-background shadow-lg shadow-lima/30 hover:-translate-y-0.5"
            }`}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background anim-spin-slow" />
                Preparando pago…
              </span>
            ) : selected === "gratis"
              ? "Descargar mi diagnóstico gratuito"
              : `Pagar ${plan?.label ?? ""} — ${plan?.nombre ?? "Plan"}`
            }
          </button>
          <button className="w-full bg-surface/70 backdrop-blur border border-lima/10 text-foreground/65 rounded-xl py-3 mt-2.5 text-sm font-semibold hover:border-lima/30 transition-colors">
            Ya pagué — Ingresar código de acceso →
          </button>
          <p className="text-center text-xs text-foreground/45 mt-5">
            Pago por transferencia bancaria · Confirmamos por WhatsApp en menos de 1 hora
          </p>
        </div>
      </div>
    </div>
  );
};
