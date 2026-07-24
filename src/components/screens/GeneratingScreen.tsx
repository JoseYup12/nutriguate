import { useEffect, useState } from "react";
import bgImg from "@/assets/market-flatlay.jpg";
import { Logo } from "@/components/Logo";

const msgs = [
  "Analizando tu perfil corporal...",
  "Clasificando tu caso específico...",
  "Determinando tu estrategia nutricional...",
  "Calculando macros y calorías exactas...",
  "Construyendo tu plan día a día...",
  "Prescribiendo protocolo de actividad...",
  "Preparando lista de supermercado...",
  "Estableciendo metas por fases...",
  "Finalizando tu sistema personalizado...",
];

export const GeneratingScreen = ({ onDone }: { onDone: () => void }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => i + 1), 1400);
    const t = setTimeout(onDone, msgs.length * 1400 + 500);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [onDone]);
  const pct = Math.min(95, ((idx + 1) / msgs.length) * 100);
  const current = msgs[Math.min(idx, msgs.length - 1)];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={bgImg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="mb-12"><Logo size="lg" /></div>
        <div className="text-center max-w-md w-full">
          <div className="w-24 h-24 mx-auto mb-10 rounded-full border-4 border-lima/15 border-t-lima anim-spin-slow" />
          <div className="inline-flex items-center gap-2 bg-lima/12 border border-lima/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-lima anim-pulse-soft" />
            <span className="text-lima text-xs font-bold tracking-widest uppercase">Procesando</span>
          </div>
          <h2 className="font-display text-4xl mb-5">Analizando tu caso...</h2>
          <p className="text-lima font-semibold mb-10 anim-pulse-soft min-h-[1.5em] text-base">{current}</p>
          <div className="bg-surface rounded-full h-1.5 overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-lima to-celeste rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-foreground/40">Puede tomar hasta 45 segundos</p>
        </div>
      </div>
    </div>
  );
};
