import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";
import type { DailyCheckin } from "@/lib/retention";

interface Props {
  checkins: DailyCheckin[];
}

/* Tooltip personalizado con el tema NutriGuate */
const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const adherencia = payload.find((p) => p.name === "adherencia")?.value;
  return (
    <div className="bg-background/95 border border-lima/25 rounded-xl px-3.5 py-2.5 text-xs shadow-xl backdrop-blur">
      <div className="font-bold text-lima mb-1">{label}</div>
      {adherencia != null && (
        <div className="text-foreground/70">
          Adherencia: <span className="font-bold text-foreground">{adherencia}/10</span>
        </div>
      )}
    </div>
  );
};

export const AdherenceChart = ({ checkins }: Props) => {
  /* Últimos 30 días, ordenados cronológicamente */
  const data = [...checkins]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
    .map((c) => ({
      date: c.date.slice(5),   // "MM-DD"
      adherencia: c.adherence_score,
      ejercicio: c.exercise_done ? 10 : 0,
    }));

  const avg =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.adherencia, 0) / data.length * 10) / 10
      : 0;

  /* Colores del tema */
  const limaColor  = "hsl(84 83% 63%)";
  const celesteColor = "hsl(183 73% 63%)";

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/45 mb-0.5">
            Adherencia al plan — últimos 30 días
          </div>
          <div className="text-sm text-foreground/55">
            Promedio: <span className="font-bold text-lima">{avg}/10</span>
          </div>
        </div>
        <div className="flex gap-3 text-[10px] text-foreground/40">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-lima rounded inline-block" />
            Nutrición
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-celeste rounded inline-block" />
            Ejercicio
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-foreground/30 text-sm">
          Aún no hay check-ins registrados
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="gradLima" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={limaColor}    stopOpacity={0.18} />
                <stop offset="95%" stopColor={limaColor}    stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCeleste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={celesteColor} stopOpacity={0.12} />
                <stop offset="95%" stopColor={celesteColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(84 83% 63% / 0.07)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(128 100% 97% / 0.3)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={Math.floor(data.length / 5)}
            />

            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fill: "hsl(128 100% 97% / 0.3)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Línea de referencia en 7 = "buena adherencia" */}
            <ReferenceLine
              y={7}
              stroke="hsl(84 83% 63% / 0.25)"
              strokeDasharray="4 3"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Área de ejercicio */}
            <Area
              type="monotone"
              dataKey="ejercicio"
              name="ejercicio"
              stroke={celesteColor}
              strokeWidth={1.5}
              strokeOpacity={0.5}
              fill="url(#gradCeleste)"
              dot={false}
            />

            {/* Línea de adherencia */}
            <Area
              type="monotone"
              dataKey="adherencia"
              name="adherencia"
              stroke={limaColor}
              strokeWidth={2}
              fill="url(#gradLima)"
              dot={(props) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: { adherencia: number } };
                if (payload.adherencia < 7) {
                  return (
                    <circle
                      key={`dot-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="hsl(0 73% 60%)"
                      stroke="none"
                    />
                  );
                }
                return <g key={`dot-${cx}`} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <p className="text-[10px] text-foreground/30 mt-3">
        Los puntos rojos indican días con adherencia menor a 7/10
      </p>
    </div>
  );
};
