-- ============================================================
--  NutriGuate — Retention System Tables
--  Migration: 001_retention_tables
-- ============================================================

-- ── 1. WhatsApp Profiles ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL UNIQUE,
  phone           TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  plan_data       JSONB,          -- snapshot del NutritionPlan
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_profiles_phone   ON whatsapp_profiles (phone);
CREATE INDEX idx_whatsapp_profiles_user_id ON whatsapp_profiles (user_id);

-- ── 2. Daily Check-ins ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_checkins (
  id               TEXT PRIMARY KEY,              -- "web-{ts}" o "wa-{ts}"
  user_id          TEXT NOT NULL,
  date             DATE NOT NULL,
  raw_message      TEXT NOT NULL,
  foods_reported   TEXT[]   NOT NULL DEFAULT '{}',
  adherence_score  SMALLINT NOT NULL DEFAULT 5 CHECK (adherence_score BETWEEN 1 AND 10),
  exercise_done    BOOLEAN  NOT NULL DEFAULT FALSE,
  mood_score       SMALLINT NOT NULL DEFAULT 3 CHECK (mood_score BETWEEN 1 AND 5),
  agent_response   TEXT,
  photo_url        TEXT,
  via_whatsapp     BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, date)   -- solo un check-in por usuario por día
);

CREATE INDEX idx_daily_checkins_user_date ON daily_checkins (user_id, date DESC);

-- ── 3. User Streaks ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id                 TEXT PRIMARY KEY,
  current_streak          INT  NOT NULL DEFAULT 0,
  max_streak              INT  NOT NULL DEFAULT 0,
  last_checkin_date       DATE,
  streak_shields_available SMALLINT NOT NULL DEFAULT 2,
  streak_shields_used      SMALLINT NOT NULL DEFAULT 0,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Weekly Challenges ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT NOT NULL,
  week_start       DATE NOT NULL,
  challenge_text   TEXT NOT NULL,
  challenge_type   TEXT NOT NULL,   -- protein | exercise | water | vegetables | budget | sleep
  target_value     INT,
  accepted         BOOLEAN NOT NULL DEFAULT FALSE,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  completion_date  DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_weekly_challenges_user_week ON weekly_challenges (user_id, week_start DESC);

-- ── 5. User Badges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  badge_type  TEXT NOT NULL,   -- week_1 | week_2 | month_1 | month_2 | month_3
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, badge_type)
);

CREATE INDEX idx_user_badges_user ON user_badges (user_id);

-- ── Row Level Security (RLS) ──────────────────────────────────
-- Habilitar RLS en todas las tablas de retención
ALTER TABLE whatsapp_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges        ENABLE ROW LEVEL SECURITY;

-- Política: el usuario solo ve y modifica sus propios datos
-- (ajustar según el esquema de auth de Supabase que uses)

CREATE POLICY "users_own_data" ON daily_checkins
  FOR ALL USING (user_id = auth.uid()::TEXT);

CREATE POLICY "users_own_data" ON user_streaks
  FOR ALL USING (user_id = auth.uid()::TEXT);

CREATE POLICY "users_own_data" ON weekly_challenges
  FOR ALL USING (user_id = auth.uid()::TEXT);

CREATE POLICY "users_own_data" ON user_badges
  FOR ALL USING (user_id = auth.uid()::TEXT);

CREATE POLICY "users_own_data" ON whatsapp_profiles
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- ── Función: actualizar updated_at automáticamente ────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_whatsapp_profiles_updated_at
  BEFORE UPDATE ON whatsapp_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
