import { supabase } from "./supabase";
import type { NutritionPlan } from "./claude";
import type { FormData } from "@/components/screens/FormularioDiagnostico";

export interface SavedPlan {
  id: string;
  user_id: string;
  created_at: string;
  plan_name: string;
  form_data: FormData;
  plan_data: NutritionPlan;
}

export async function savePlan(
  userId: string,
  formData: FormData,
  planData: NutritionPlan,
): Promise<string | null> {
  const date = new Date().toLocaleDateString("es-GT", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const { data, error } = await supabase
    .from("nutrition_plans")
    .insert({
      user_id: userId,
      plan_name: `Plan de ${formData.name} — ${date}`,
      form_data: formData,
      plan_data: planData,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[NutriGuate] Error guardando plan:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function getUserPlans(userId: string): Promise<SavedPlan[]> {
  const { data, error } = await supabase
    .from("nutrition_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[NutriGuate] Error cargando planes:", error.message);
    return [];
  }
  return (data ?? []) as SavedPlan[];
}
