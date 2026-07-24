import { useState, useEffect } from "react";
import { LandingPage }   from "@/components/screens/LandingPage";
import { LoginScreen }   from "@/components/screens/LoginScreen";
import { FormularioDiagnostico, type FormData } from "@/components/screens/FormularioDiagnostico";
import { InsightScreen } from "@/components/screens/InsightScreen";
import { PaywallPlans }  from "@/components/screens/PaywallPlans";
import { Dashboard }     from "@/components/screens/Dashboard";
import GroupProfileSetup, { type MemberProfile } from "@/components/screens/GroupProfileSetup";
import type { NutritionPlan } from "@/lib/claude";
import { saveGroupMembers, type SheetUser } from "@/lib/googleSheets";
import { getSupabaseSession, logoutSupabaseUser } from "@/lib/supabase-auth";
import { savePlan } from "@/lib/nutrition-plans";

/* ── Flujo individual:
   landing (VSL) → auth → form → insight → paywall → dashboard
   ── Flujo grupal (nuevo):
   landing (VSL) → auth → form → insight → paywall (elige plan grupal)
   → group_setup → dashboard
   ─────────────────────────────────────────────────────────────────────────────
   El CTA de la landing queda bloqueado hasta que el video termina.
   El login aparece una sola vez por sesión (persiste en localStorage).      ── */
type Screen = "landing" | "auth" | "form" | "insight" | "paywall" | "group_setup" | "dashboard";

/* ── Helpers para planes grupales ── */
const GROUP_PLAN_IDS = ["pareja_basic", "pareja_plus", "cuates_basic", "cuates_plus", "familiar_basic", "familiar_plus"];

const isGroupPlan = (planType: string): boolean => GROUP_PLAN_IDS.includes(planType);

const getGroupType = (planType: string): "pareja" | "cuates" | "familiar" => {
  if (planType.startsWith("pareja")) return "pareja";
  if (planType.startsWith("cuates")) return "cuates";
  return "familiar";
};

const Index = () => {
  const [currentUser, setCurrentUser] = useState<SheetUser | null>(null);
  const [screen, setScreen]   = useState<Screen>("landing");

  /* Restaurar sesión de Supabase al montar */
  useEffect(() => {
    getSupabaseSession().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [planData, setPlanData] = useState<NutritionPlan | null>(null);
  const [activePlan, setActivePlan] = useState<string>("mensual");

  const go = (s: Screen) => { setScreen(s); window.scrollTo(0, 0); };

  /* Cuando el usuario da click en el CTA de la landing (video terminado) */
  const handleLandingCTA = () => {
    if (currentUser) {
      go("form"); // ya tiene sesión → ir directo al formulario
    } else {
      go("auth"); // sin sesión → mostrar login
    }
  };

  const handleAuthSuccess = (user: SheetUser) => {
    setCurrentUser(user);
    go("form");
  };

  const handleRestart = () => {
    setPlanData(null);
    setFormData(null);
    go("landing");
  };

  const handleLogout = () => {
    logoutSupabaseUser();
    setCurrentUser(null);
    setPlanData(null);
    setFormData(null);
    go("landing");
  };

  /* Pago confirmado — si es plan grupal ir a group_setup, si no ir al dashboard */
  const handleActivate = (planType: string) => {
    setActivePlan(planType);
    if (isGroupPlan(planType)) {
      go("group_setup");
    } else {
      go("dashboard");
    }
  };

  /* Perfiles del grupo completados → guardar y navegar al dashboard */
  const handleGroupSetupComplete = async (members: MemberProfile[]) => {
    if (currentUser) {
      try {
        await saveGroupMembers(currentUser.id, activePlan, members);
      } catch {/* error silencioso — ya guarda en localStorage */}
    }
    go("dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
      {screen === "landing" && (
        <LandingPage onStart={handleLandingCTA} />
      )}

      {screen === "auth" && (
        <LoginScreen onAuthSuccess={handleAuthSuccess} />
      )}

      {screen === "form" && (
        <FormularioDiagnostico
          onBack={() => go(currentUser ? "landing" : "auth")}
          onSubmit={(d) => { setFormData(d); go("insight"); }}
        />
      )}

      {screen === "insight" && formData && (
        <InsightScreen
          formData={formData}
          onPlanReady={(plan) => {
            setPlanData(plan);
            if (currentUser) {
              savePlan(currentUser.id, formData, plan).catch(() => {});
            }
          }}
          onContinue={() => go("paywall")}
        />
      )}

      {screen === "paywall" && (
        <PaywallPlans onActivate={handleActivate} />
      )}

      {screen === "group_setup" && currentUser && (
        <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-background">
          <GroupProfileSetup
            group_type={getGroupType(activePlan)}
            plan_type={activePlan}
            titular_nombre={currentUser.nombre}
            onComplete={handleGroupSetupComplete}
          />
        </div>
      )}

      {screen === "dashboard" && formData && (
        <Dashboard
          formData={formData}
          planData={planData}
          currentUser={currentUser}
          onRestart={handleRestart}
          onLogout={handleLogout}
        />
      )}
      </div>

      <footer className="bg-surface border-t border-white/10 py-3 px-6 text-center">
        <p className="text-xs text-foreground/40">
          Contáctanos con nuestro asesor:{" "}
          <span className="font-semibold text-celeste">Irwing Samuel Sagastume Rossil</span>
          {" · "}
          <a href="tel:+50259102808" className="text-celeste font-semibold">+502 5910 2808</a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
