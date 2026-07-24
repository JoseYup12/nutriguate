import { useState } from "react";
import type { DailyCheckin } from "@/lib/retention";

interface Props {
  checkins: DailyCheckin[];
  /** Fechas donde el usuario usó un escudo (YYYY-MM-DD) */
  shieldDates?: string[];
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const CheckinCalendar = ({ checkins, shieldDates = [] }: Props) => {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const checkinSet = new Set(checkins.map((c) => c.date));
  const shieldSet  = new Set(shieldDates);

  const todayStr = today.toISOString().split("T")[0];

  /* Primer día del mes y total de días */
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // lunes = 0, domingo = 6
  const startOffset = (firstDay.getDay() + 6) % 7; // 0=lun

  /* Navegar mes */
  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };
  const canGoNext =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  /* Clases por estado del día */
  const dayClass = (dateStr: string, dayNum: number): string => {
    const isPast   = dateStr < todayStr;
    const isToday  = dateStr === todayStr;
    const isDone   = checkinSet.has(dateStr);
    const isShield = shieldSet.has(dateStr);

    if (isToday) {
      return isDone
        ? "bg-lima text-background font-black ring-2 ring-lima/60"
        : "border-2 border-lima text-lima font-bold";
    }
    if (isDone)   return "bg-lima/80 text-background font-bold";
    if (isShield) return "bg-gold/40 text-gold font-bold";
    if (isPast)   return "bg-surface/50 text-foreground/20";
    /* futuro */  return "text-foreground/15";
    void dayNum;
  };

  /* Estadísticas del mes */
  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const monthCheckins = checkins.filter((c) => c.date.startsWith(monthPrefix));
  const doneThisMonth = monthCheckins.length;
  const pastDaysThisMonth = viewYear < today.getFullYear() || viewMonth < today.getMonth()
    ? daysInMonth
    : today.getDate();
  const rate = pastDaysThisMonth > 0 ? Math.round((doneThisMonth / pastDaysThisMonth) * 100) : 0;

  return (
    <div className="glass-card p-5">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-surface border border-lima/15 flex items-center justify-center text-foreground/60 hover:border-lima/40 transition-colors text-sm"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="font-display text-lg leading-tight">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          <div className="text-[10px] text-foreground/40 mt-0.5">
            {doneThisMonth}/{pastDaysThisMonth} días · {rate}% adherencia
          </div>
        </div>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="w-8 h-8 rounded-full bg-surface border border-lima/15 flex items-center justify-center text-foreground/60 hover:border-lima/40 transition-colors text-sm disabled:opacity-25 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-foreground/30 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {/* Celdas vacías iniciales */}
        {[...Array(startOffset)].map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Días del mes */}
        {[...Array(daysInMonth)].map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          return (
            <div
              key={dayNum}
              className={[
                "aspect-square rounded-lg flex items-center justify-center text-xs transition-all",
                dayClass(dateStr, dayNum),
              ].join(" ")}
              title={dateStr}
            >
              {dayNum}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-lima/8 flex-wrap">
        {[
          { color: "bg-lima/80", label: "Check-in" },
          { color: "bg-gold/40",  label: "Escudo" },
          { color: "bg-surface/50 border border-foreground/10", label: "Sin check-in" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[10px] text-foreground/40">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
