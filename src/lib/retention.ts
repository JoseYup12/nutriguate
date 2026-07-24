/**
 * retention.ts
 * Tipos, constantes y datos mock para el sistema de retención NutriGuate.
 * Cuando Supabase esté conectado, los hooks reemplazarán MOCK_* por queries reales.
 */

/* ════════════════════════════════ TIPOS ════════════════════════════════════ */

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;              // "YYYY-MM-DD"
  raw_message: string | null;
  foods_reported: string[];
  adherence_score: number;   // 1-10
  exercise_done: boolean;
  mood_score: number;        // 1-5
  agent_response: string | null;
  photo_url: string | null;
  via_whatsapp: boolean;
  created_at: string;
}

export interface UserStreak {
  current_streak: number;
  max_streak: number;
  last_checkin_date: string | null;
  streak_shields_available: number;
  streak_shields_used: number;
}

export interface WeeklyChallenge {
  id: string;
  week_start: string;
  challenge_text: string;
  challenge_type: string;
  target_value: number | null;
  accepted: boolean;
  completed: boolean;
  completion_date: string | null;
}

export interface UserBadge {
  badge_type: string;
  earned_at: string;
}

/* ════════════════════════════ DEFINICIÓN DE BADGES ═════════════════════════ */

export interface BadgeDefinition {
  type: string;
  label: string;
  emoji: string;
  description: string;
  milestone: number; // días requeridos
  reward: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "week_1",
    label: "Primera semana",
    emoji: "🔥",
    description: "7 días consecutivos de check-in",
    milestone: 7,
    reward: "¡Hábito iniciado!",
  },
  {
    type: "week_2",
    label: "2 semanas seguidas",
    emoji: "💪",
    description: "14 días consecutivos de check-in",
    milestone: 14,
    reward: "Ya es rutina",
  },
  {
    type: "day_30",
    label: "Un mes completo",
    emoji: "🏅",
    description: "30 días consecutivos de check-in",
    milestone: 30,
    reward: "10% de descuento en renovación",
  },
  {
    type: "day_60",
    label: "Hábito formado",
    emoji: "🏆",
    description: "60 días consecutivos de check-in",
    milestone: 60,
    reward: "El hábito ya es tuyo",
  },
  {
    type: "day_90",
    label: "3 meses imparable",
    emoji: "⭐",
    description: "90 días consecutivos de check-in",
    milestone: 90,
    reward: "1 mes gratis",
  },
];

/* ═══════════════════════════ MOCK DATA (dev) ═══════════════════════════════
   Datos que se usan cuando Supabase no está conectado.
   Reflejan un usuario que lleva ~30 días usando NutriGuate.
   ─────────────────────────────────────────────────────────────────────────── */

/** Genera check-ins para los últimos N días con gaps naturales */
function buildMockCheckins(): DailyCheckin[] {
  // Fecha base: 2026-05-11 (hoy en sesión)
  const base = new Date("2026-05-11");

  // Días que NO hicieron check-in (índices desde hoy hacia atrás)
  // Hueco en días 12 y 13 → racha anterior de 18 (días 13-30), actual de 12 (días 0-11)
  const gaps = new Set([12, 13]);
  const shieldDays = new Set<number>(); // sin escudos en este período

  const result: DailyCheckin[] = [];
  for (let i = 0; i < 30; i++) {
    if (gaps.has(i)) continue;

    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Variedad de alimentos guatemaltecos para los reportes
    const foodOptions = [
      ["Huevos revueltos", "Tortillas de maíz", "Frijoles negros"],
      ["Pechuga de pollo", "Arroz", "Güisquil"],
      ["Frijoles colorados", "Tortillas", "Aguacate"],
      ["Huevos", "Pan francés", "Plátano"],
      ["Pollo asado", "Arroz", "Ensalada de berro"],
    ];

    result.push({
      id: `mock-${i}`,
      user_id: "mock-user",
      date: dateStr,
      raw_message: i === 0 ? null : "Mock check-in",
      foods_reported: foodOptions[i % foodOptions.length],
      adherence_score: shieldDays.has(i) ? 5 : [7, 8, 9, 8, 7, 9, 8][i % 7],
      exercise_done: i % 3 !== 1,   // 2 de cada 3 días entrenó
      mood_score: [4, 5, 4, 3, 5, 4, 5][i % 7],
      agent_response: null,
      photo_url: null,
      via_whatsapp: i > 0,          // el de hoy viene del web
      created_at: d.toISOString(),
    });
  }
  return result;
}

export const MOCK_CHECKINS: DailyCheckin[] = buildMockCheckins();

export const MOCK_STREAK: UserStreak = {
  current_streak: 12,
  max_streak: 18,
  last_checkin_date: "2026-05-11",
  streak_shields_available: 0,  // ya usó el escudo del mes
  streak_shields_used: 1,
};

export const MOCK_WEEKLY_CHALLENGE: WeeklyChallenge = {
  id: "mock-challenge-may-2",
  week_start: "2026-05-11",
  challenge_text: "Llegá a 100 g de proteína cada día esta semana 💪",
  challenge_type: "protein",
  target_value: 100,
  accepted: true,
  completed: false,
  completion_date: null,
};

export const MOCK_BADGES: UserBadge[] = [
  { badge_type: "week_1", earned_at: "2026-04-18T20:00:00Z" },
  { badge_type: "week_2", earned_at: "2026-04-25T20:00:00Z" },
];

/* ══════════════════════ HELPERS ══════════════════════════════════════════ */

/** Devuelve "YYYY-MM-DD" para hoy */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/** Dado un array de check-ins, devuelve un Set de fechas "YYYY-MM-DD" */
export function checkinDateSet(checkins: DailyCheckin[]): Set<string> {
  return new Set(checkins.map((c) => c.date));
}
