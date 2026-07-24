import { useState } from "react";
import { Logo } from "@/components/Logo";
import bgImg from "@/assets/market-flatlay.jpg";
import DietTypeSelector from "../forms/DietTypeSelector";

export type FormData = {
  name: string; age: string; sex: string; weight: string; height: string;
  activity: string; goal: string; conditions: string[]; avoid: string;
  diasEntrenar: string; contextoActividad: string; minutosDisponibles: string;
  historialDietas: string; presupuesto: string; meals: string;
  diet_type: string;
};

const CONDITIONS = ["Diabetes tipo 2", "Hipertensión", "Colesterol alto", "Celíaco", "Int. Lactosa", "Hipotiroidismo", "Gastritis", "Embarazo", "Enf. Renal", "Síndrome Metabólico"];

const bmi = (w: string, h: string) => w && h ? (+w / ((+h / 100) ** 2)).toFixed(1) : "—";
const bmiLabel = (b: string) => { const v = parseFloat(b); if (isNaN(v)) return ""; if (v < 18.5) return "Bajo Peso"; if (v < 25) return "Normal"; if (v < 30) return "Sobrepeso"; if (v < 35) return "Obesidad I"; return "Obesidad II+"; };

export const FormularioDiagnostico = ({ onBack, onSubmit }: { onBack: () => void; onSubmit: (d: FormData) => void }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: "", age: "", sex: "", weight: "", height: "",
    activity: "sedentario", goal: "bajar", conditions: [], avoid: "",
    diasEntrenar: "3", contextoActividad: "casa", minutosDisponibles: "30",
    historialDietas: "ninguna", presupuesto: "normal", meals: "3",
    diet_type: "balanceada",
  });
  const fv = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));
  const toggleCond = (c: string) => fv("conditions", form.conditions.includes(c) ? form.conditions.filter(x => x !== c) : [...form.conditions, c]);

  const stepTitles = ["Sobre ti", "Tu objetivo", "Tu contexto", "Confirmación"];
  const stepValid = [
    !!(form.name && form.age && form.sex && form.weight && form.height),
    !!(form.activity && form.goal),
    true,
    !!form.meals,
  ];

  const Chip = ({ val, cur, label, fn }: { val: string; cur: string; label: string; fn: (v: string) => void }) => (
    <button type="button" onClick={() => fn(val)}
      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all border-[1.5px] ${cur === val ? "bg-lima/15 border-lima text-lima" : "bg-surface border-lima/8 text-foreground/65 hover:border-lima/30"}`}>
      {label}
    </button>
  );

  const Radio = ({ list, value, set }: { list: [string, string, string][]; value: string; set: (v: string) => void }) => (
    <div className="flex flex-col gap-1.5">
      {list.map(([v, ic, desc]) => (
        <button type="button" key={v} onClick={() => set(v)}
          className={`flex items-start gap-3 rounded-lg px-3.5 py-3 text-left transition-all border-[1.5px] ${value === v ? "bg-lima/12 border-lima/40" : "bg-surface border-lima/8 hover:border-lima/25"}`}>
          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${value === v ? "border-lima bg-lima" : "border-foreground/30"}`}>
            {value === v && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
          </div>
          <div>
            <div className="font-bold text-sm">{ic}</div>
            <div className="text-xs text-foreground/55 leading-snug mt-0.5">{desc}</div>
          </div>
        </button>
      ))}
    </div>
  );

  const inputCls = "w-full bg-surface border-[1.5px] border-lima/8 rounded-lg px-3.5 py-2.5 text-foreground text-sm focus:border-lima focus:outline-none transition-colors";
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-foreground/40 block mb-1.5";

  const next = () => step < 4 ? setStep(step + 1) : onSubmit(form);
  const prev = () => step > 1 ? setStep(step - 1) : onBack();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>
      <div className="relative max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={prev} className="w-10 h-10 rounded-full bg-surface border border-lima/15 flex items-center justify-center hover:border-lima/40 text-lg">←</button>
          <Logo size="md" />
          <div className="ml-auto text-xs text-foreground/55">Paso {step} de 4</div>
        </div>

        {/* progress */}
        <div className="flex gap-1.5 mb-7">
          {stepTitles.map((t, i) => (
            <div key={t} className="flex-1 flex flex-col gap-1.5">
              <div className={`h-[3px] rounded-full transition-colors ${i < step ? "bg-lima" : "bg-lima/8"}`} />
              <div className={`text-[10px] font-bold uppercase tracking-wider ${i < step ? "text-lima" : "text-foreground/30"}`}>{t}</div>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 md:p-7 anim-fade-up">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl">¿Quién eres?</h2>
              <p className="text-sm text-foreground/55 -mt-2">Necesitamos datos reales para que el análisis sea preciso.</p>
              <div><label className={labelCls}>Nombre</label><input className={inputCls} placeholder="Tu nombre" value={form.name} onChange={e => fv("name", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Edad</label><input className={inputCls} type="number" placeholder="28" value={form.age} onChange={e => fv("age", e.target.value)} /></div>
                <div><label className={labelCls}>Sexo</label>
                  <select className={inputCls} value={form.sex} onChange={e => fv("sex", e.target.value)}>
                    <option value="">—</option><option value="femenino">Femenino</option><option value="masculino">Masculino</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Peso (kg)</label><input className={inputCls} type="number" placeholder="70" value={form.weight} onChange={e => fv("weight", e.target.value)} /></div>
                <div><label className={labelCls}>Altura (cm)</label><input className={inputCls} type="number" placeholder="162" value={form.height} onChange={e => fv("height", e.target.value)} /></div>
              </div>
              {form.weight && form.height && (
                <div className="bg-lima/8 border border-lima/20 rounded-lg px-4 py-2.5 flex gap-4 text-sm">
                  <span>IMC: <strong className="text-lima">{bmi(form.weight, form.height)}</strong></span>
                  <span className="text-foreground/55">{bmiLabel(bmi(form.weight, form.height))}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-display text-2xl">Tu objetivo</h2>
              <div>
                <label className={labelCls}>¿Qué quieres lograr?</label>
                <Radio value={form.goal} set={v => fv("goal", v)} list={[
                  ["bajar", "⬇️ Perder grasa", "Reducir grasa corporal preservando músculo. Para personas con exceso de peso o que quieren verse más definidos."],
                  ["recomposicion", "⚖️ Recomposición", "Reducir grasa Y ganar músculo al mismo tiempo. Requiere más disciplina pero da resultados duales."],
                  ["subir", "⬆️ Ganar músculo", "Aumentar masa muscular con mínima grasa. Para personas delgadas o atletas que quieren volumen y fuerza."],
                  ["salud", "🌿 Salud y energía", "Mejorar bienestar general: más energía, mejor digestión, control de condiciones crónicas. Sin foco en estética."],
                ]} />
              </div>
              <div>
                <label className={labelCls}>Nivel de actividad actual</label>
                <Radio value={form.activity} set={v => fv("activity", v)} list={[
                  ["sedentario", "🪑 Sedentario", "Trabajo de oficina, casi no camino, poco movimiento diario"],
                  ["ligero", "🚶 Ligero", "Camino regularmente, actividades básicas, 1-2 días ejercicio/sem"],
                  ["moderado", "🏃 Moderado", "Ejercicio 3-4 veces por semana, actividad constante"],
                  ["activo", "💪 Activo", "Entreno 5-6 veces/sem con intensidad, trabajo físico moderado"],
                  ["muy activo", "⚡ Muy activo", "Trabajo físico + entreno intenso diario, atleta"],
                ]} />
              </div>
              <div>
                <label className={labelCls}>Condiciones de salud (opcional) — el plan adapta tu selección de alimentos</label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleCond(c)} className={`chip ${form.conditions.includes(c) ? "chip-active" : ""}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h2 className="font-display text-2xl">Tu contexto real</h2>
              <p className="text-sm text-foreground/55 -mt-3">Esto define tu prescripción de actividad física.</p>
              <div>
                <label className={labelCls}>¿Cuántos días para ejercicio?</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {["0", "1", "2", "3", "4", "5"].map(v => <Chip key={v} val={v} cur={form.diasEntrenar} label={v === "0" ? "0" : v + "d"} fn={x => fv("diasEntrenar", x)} />)}
                </div>
              </div>
              <div>
                <label className={labelCls}>¿Dónde puedes hacer ejercicio?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["casa", "🏠 En casa"], ["caminata", "🚶 Solo caminar"], ["gimnasio", "💪 Gimnasio"], ["mixto", "🔀 Mixto"]].map(([v, l]) => <Chip key={v} val={v} cur={form.contextoActividad} label={l} fn={x => fv("contextoActividad", x)} />)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Tiempo por sesión</label>
                <div className="grid grid-cols-4 gap-2">
                  {[["20", "20 min"], ["30", "30 min"], ["45", "45 min"], ["60", "60+ min"]].map(([v, l]) => <Chip key={v} val={v} cur={form.minutosDisponibles} label={l} fn={x => fv("minutosDisponibles", x)} />)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Historial de dietas</label>
                <div className="grid grid-cols-2 gap-2">
                  {[["ninguna", "Primera vez"], ["algunas", "Algunas, con resultados"], ["muchas", "Muchas, sin éxito"], ["recuperacion", "En proceso de mejora"]].map(([v, l]) => <Chip key={v} val={v} cur={form.historialDietas} label={l} fn={x => fv("historialDietas", x)} />)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Presupuesto mensual para alimentos</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["ajustado", "Q500 o menos"], ["normal", "Q500-1,000"], ["flexible", "Q1,000+"]].map(([v, l]) => <Chip key={v} val={v} cur={form.presupuesto} label={l} fn={x => fv("presupuesto", x)} />)}
                </div>
              </div>
              <div>
                <label className={labelCls}>Alimentos que no puedes comer (opcional)</label>
                <input className={inputCls} placeholder="Ej: mariscos, lácteos..." value={form.avoid} onChange={e => fv("avoid", e.target.value)} />
              </div>
              <DietTypeSelector
                value={form.diet_type}
                onChange={(val) => fv("diet_type", val)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl">Confirmación</h2>
              <div>
                <label className={labelCls}>¿Cuántas comidas al día?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["2", "Ayuno/IF"], ["3", "3 comidas"], ["4", "4 comidas"], ["5", "5 comidas"], ["6", "6 comidas"], ["7", "Musculación"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => fv("meals", v)}
                      className={`rounded-lg px-2 py-2 text-center transition-all border-[1.5px] ${form.meals === v ? "bg-lima/15 border-lima" : "bg-surface border-lima/8 hover:border-lima/30"}`}>
                      <div className={`font-bold text-sm ${form.meals === v ? "text-lima" : ""}`}>{v}</div>
                      <div className="text-[10px] text-foreground/50 leading-tight mt-0.5">{l}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-surface border border-celeste/20 rounded-xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-lima mb-3">Resumen de tu diagnóstico</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-foreground/55">Caso detectado</span><strong className="text-right">Análisis al generar</strong></div>
                  <div className="flex justify-between gap-3"><span className="text-foreground/55">Sesiones</span><strong className="text-right">{form.diasEntrenar} días/sem · {form.minutosDisponibles} min · {form.contextoActividad}</strong></div>
                  <div className="flex justify-between gap-3"><span className="text-foreground/55">Comidas</span><strong>{form.meals}/día</strong></div>
                </div>
              </div>
            </div>
          )}

          <button onClick={next} disabled={!stepValid[step - 1]}
            className={`mt-7 w-full rounded-xl py-3.5 font-bold text-base transition-all ${stepValid[step - 1] ? "cta-primary" : "bg-surface text-foreground/30 cursor-not-allowed"}`}>
            {step < 4 ? "Siguiente →" : "🔍 Analizar mi caso"}
          </button>
        </div>
      </div>
    </div>
  );
};
