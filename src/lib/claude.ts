/**
 * claude.ts
 * Integración con la API de Claude para calcular planes nutricionales.
 * Llama directamente al endpoint REST (sin SDK) para compatibilidad con Vite/browser.
 *
 * Requiere en .env.local:
 *   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
 *
 * Modelo por defecto: claude-opus-4-5
 * Para cambiar: agrega VITE_CLAUDE_MODEL=claude-sonnet-4-5 en .env.local
 */

import type { FormData } from "@/components/screens/FormularioDiagnostico";

/* ════════════════════════════════ TIPOS ════════════════════════════════════ */

export interface MacroData {
  kcal: number;
  proteina_g: number;
  carbs_g: number;
  grasas_g: number;
  protKg: string; // g de proteína / kg de peso corporal
}

export interface MealItem {
  alimento: string;
  cantidad: string;
  kcal: number;
}

export interface Meal {
  nombre: string; // "Desayuno", "Almuerzo", etc.
  hora: string;
  items: MealItem[];
  total_kcal: number;
}

export interface DayPlan {
  dia: string; // "Lunes", "Miércoles", "Viernes"
  comidas: Meal[];
}

export interface ActivityPlan {
  tipo: string;
  descripcion: string;
  semana1: string;
  semana2: string;
}

export interface Goal {
  fase: string;
  meta: string;
}

export interface ShoppingItem {
  item: string;
  cantidad: string;
  precio_gt: string;
  tienda: string;
}

export interface CaseInfo {
  nombre: string;
  perfil: string;
  insight: string;
  fallo: string;
}

export interface GroupMemberContext {
  nombre: string;
  edad: string;
  sexo: string;
  objetivo: string;
  diet_type: string;
  restricciones?: string;
}

export interface GroupContext {
  is_group_plan: boolean;
  group_type?: "pareja" | "cuates" | "familiar";
  group_members?: GroupMemberContext[];
}

export interface NutritionPlan {
  caso: CaseInfo;
  macros: MacroData;
  diagnostico: string;
  plan_nutricional: DayPlan[];
  actividad: ActivityPlan;
  metas: Goal[];
  lista_compras: ShoppingItem[];
}

/* ══════════════════════════ HELPERS DE ETIQUETAS ═══════════════════════════ */

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: "sedentario — trabaja sentado, casi no camina",
  ligero: "actividad ligera — camina regularmente, 1-2 días ejercicio/semana",
  moderado: "moderadamente activo — 3-4 sesiones de ejercicio/semana",
  activo: "muy activo — entrena 5-6 veces/semana con intensidad",
  "muy activo": "extremadamente activo — trabajo físico intenso + entreno diario",
};

const GOAL_LABELS: Record<string, string> = {
  bajar: "pérdida de grasa corporal preservando músculo",
  recomposicion: "recomposición corporal (reducir grasa y ganar músculo al mismo tiempo)",
  subir: "ganancia muscular controlada con mínima grasa",
  salud: "mejorar salud y energía general sin foco estético",
};

const CONTEXT_LABELS: Record<string, string> = {
  casa: "en casa sin equipamiento especial",
  caminata: "únicamente caminata al aire libre",
  gimnasio: "gimnasio con equipamiento completo",
  mixto: "mixto (casa + caminata o gimnasio según el día)",
};

const BUDGET_LABELS: Record<string, string> = {
  ajustado: "Q500 o menos mensuales — presupuesto muy limitado",
  normal: "Q500–Q1,000 mensuales — presupuesto estándar",
  flexible: "Q1,000 o más mensuales — sin restricción económica",
};

const HISTORY_LABELS: Record<string, string> = {
  ninguna: "nunca ha seguido una dieta estructurada",
  algunas: "intentó algunas dietas con resultados parciales",
  muchas: "ha probado muchas dietas sin éxito duradero",
  recuperacion: "actualmente en proceso de mejorar hábitos alimentarios",
};

/* ═══════════════════════════ CONSTRUCTOR DE PROMPT ════════════════════════ */

const DIET_TYPE_LABELS: Record<string, string> = {
  balanceada:     "Balanceada — distribución equilibrada de proteínas, carbos y grasas",
  low_carb:       "Low Carb — reducción moderada de carbohidratos, porciones controladas",
  keto:           "Keto — muy baja en carbos (<50g/día), alta en grasa, cetosis",
  mediterranea:   "Mediterránea — grasas saludables, legumbres y vegetales como base",
  alta_proteina:  "Alta Proteína — 2.4-3.0g/kg de peso, carbos moderados",
  vegetariana:    "Vegetariana — sin carne ni pescado, proteína por combinación de alimentos",
};

function buildPrompt(fd: FormData, groupContext?: GroupContext): string {
  const mealCount = Math.max(2, parseInt(fd.meals) || 3);
  const avoid = fd.avoid?.trim() || "";
  const conditions = fd.conditions.length > 0 ? fd.conditions.join(", ") : "ninguna";
  const dietType = fd.diet_type || "balanceada";

  const avoidSection = avoid
    ? `\n⚠️  ALIMENTOS COMPLETAMENTE PROHIBIDOS (NO PUEDEN APARECER en ninguna comida ni en la lista de compras): "${avoid}"\n`
    : "";

  const groupSection = groupContext?.is_group_plan
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━
CONTEXTO GRUPAL
━━━━━━━━━━━━━━━━━━━━━━━
Tipo de plan:           ${groupContext.group_type}
Miembros del grupo:     ${groupContext.group_members?.length ?? 0} personas
${groupContext.group_members ? groupContext.group_members.map((m, i) => `Miembro ${i + 1}:          ${m.nombre}, ${m.edad} años, ${m.sexo}, ${m.objetivo}, dieta: ${m.diet_type}${m.restricciones ? `, restricciones: ${m.restricciones}` : ""}`).join("\n") : ""}
NOTA: Armoniza los menús de almuerzo y cena para que el grupo cocine lo mismo con porciones ajustadas.\n`
    : "";

  return `Eres un nutricionista clínico certificado especializado en nutrición guatemalteca y fisiología del ejercicio.
Tu respuesta debe ser ÚNICAMENTE JSON válido — sin texto, sin explicaciones, sin markdown, sin bloques de código.

━━━━━━━━━━━━━━━━━━━━━━━
DATOS DEL USUARIO
━━━━━━━━━━━━━━━━━━━━━━━
Nombre:                 ${fd.name}
Sexo:                   ${fd.sex}
Edad:                   ${fd.age} años
Peso:                   ${fd.weight} kg
Altura:                 ${fd.height} cm
Nivel de actividad:     ${ACTIVITY_LABELS[fd.activity] || fd.activity}
Objetivo:               ${GOAL_LABELS[fd.goal] || fd.goal}
Tipo de alimentación:   ${DIET_TYPE_LABELS[dietType] || dietType}
Condiciones de salud:   ${conditions}
Días para entrenar:     ${fd.diasEntrenar} días/semana
Contexto ejercicio:     ${CONTEXT_LABELS[fd.contextoActividad] || fd.contextoActividad}
Tiempo por sesión:      ${fd.minutosDisponibles} minutos
Historial de dietas:    ${HISTORY_LABELS[fd.historialDietas] || fd.historialDietas}
Presupuesto mensual:    ${BUDGET_LABELS[fd.presupuesto] || fd.presupuesto}
Comidas al día:         ${mealCount}
${avoidSection}${groupSection}
━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCCIONES DE CÁLCULO
━━━━━━━━━━━━━━━━━━━━━━━
1. BMR con Mifflin-St Jeor:
   Hombre: BMR = 10×peso + 6.25×altura - 5×edad + 5
   Mujer:  BMR = 10×peso + 6.25×altura - 5×edad - 161

2. TDEE = BMR × factor de actividad:
   sedentario=1.2 | ligero=1.375 | moderado=1.55 | activo=1.725 | muy activo=1.9

3. Ajuste calórico según objetivo:
   bajar → TDEE - 500 kcal (déficit moderado)
   recomposicion → TDEE - 200 kcal (déficit mínimo)
   subir → TDEE + 350 kcal (superávit limpio)
   salud → TDEE (mantenimiento)

4. Distribución de macros:
   bajar →       proteína 2.0g/kg | restante 40% carbos, 30% grasa
   recomposicion → proteína 2.2g/kg | restante 35% carbos, 25% grasa
   subir →       proteína 2.0g/kg | restante 50% carbos, 20% grasa
   salud →       proteína 1.6g/kg | restante 50% carbos, 25% grasa

5. TODOS los alimentos deben ser guatemaltecos y comprables en La Torre,
   Walmart Guatemala, Despensa Familiar o mercados locales.
   Ejemplos válidos: tortillas de maíz, frijoles negros/colorados, huevos,
   pollo, carne de res, pan francés, arroz blanco, güisquil, ejotes, ayote,
   chipilín, hierba mora, loroco, incaparina, leche, queso fresco, plátano,
   banano, papaya, mango, elote, papa, güicoy, berro, acelga, etc.${avoid ? `\n6. Los alimentos "${avoid}" están COMPLETAMENTE PROHIBIDOS. No pueden aparecer en ninguna comida ni en la lista de compras.` : ""}

━━━━━━━━━━━━━━━━━━━━━━━
FORMATO DE RESPUESTA (JSON exacto — sin texto fuera del JSON)
━━━━━━━━━━━━━━━━━━━━━━━
{
  "caso": {
    "nombre": "Nombre clínico del perfil, ej: Pérdida de grasa — Base moderada",
    "perfil": "codigo_corto",
    "insight": "2-3 oraciones explicando qué está pasando en el cuerpo del usuario y por qué el enfoque seleccionado es el correcto para su caso específico.",
    "fallo": "1-2 oraciones describiendo el error específico que ha impedido sus resultados hasta ahora."
  },
  "macros": {
    "kcal": 0,
    "proteina_g": 0,
    "carbs_g": 0,
    "grasas_g": 0,
    "protKg": "0.00"
  },
  "diagnostico": "2-3 oraciones explicando la estrategia elegida, la lógica del déficit/superávit y por qué la distribución de macros es la correcta.",
  "plan_nutricional": [
    {
      "dia": "Lunes",
      "comidas": [
        {
          "nombre": "Desayuno",
          "hora": "7:00 am",
          "items": [
            { "alimento": "nombre del alimento guatemalteco", "cantidad": "150 g", "kcal": 200 }
          ],
          "total_kcal": 450
        }
      ]
    }
  ],
  "actividad": {
    "tipo": "Nombre del tipo de entrenamiento recomendado",
    "descripcion": "Explicación del enfoque y la lógica fisiológica detrás.",
    "semana1": "Instrucciones específicas y detalladas para la semana 1.",
    "semana2": "Instrucciones específicas para la semana 2 con progresión de carga o volumen."
  },
  "metas": [
    { "fase": "Semana 1-2", "meta": "Meta específica, medible y alcanzable." },
    { "fase": "Semana 3-4", "meta": "Meta específica con indicador numérico si aplica." },
    { "fase": "Señal verde", "meta": "Indicadores fisiológicos de que el plan está funcionando." },
    { "fase": "Señal de ajuste", "meta": "Indicadores de que el plan necesita revisión." }
  ],
  "lista_compras": [
    { "item": "Nombre exacto del producto", "cantidad": "cantidad para 3 días", "precio_gt": "Q00", "tienda": "La Torre" }
  ]
}

REGLAS FINALES:
- plan_nutricional: exactamente 3 días (Lunes, Miércoles, Viernes)
- Cada día debe tener exactamente ${mealCount} comidas distribuidas en el horario del día
- Los totales de macros del día deben sumar aproximadamente las kcal calculadas
- lista_compras: cubre los ingredientes de esos 3 días con precios realistas en Q (2024)
- Adapta TODOS los alimentos según condiciones de salud: ${conditions}
- protKg = proteína_g ÷ peso_kg, con 2 decimales, como string`;
}

/* ══════════════════════════ VALIDACIÓN DEL PLAN ═══════════════════════════ */

function validate(raw: unknown): raw is NutritionPlan {
  if (typeof raw !== "object" || raw === null) return false;
  const p = raw as Record<string, unknown>;
  return (
    typeof p.caso === "object" &&
    typeof p.macros === "object" &&
    typeof p.diagnostico === "string" &&
    Array.isArray(p.plan_nutricional) &&
    p.plan_nutricional.length > 0 &&
    typeof p.actividad === "object" &&
    Array.isArray(p.metas) &&
    Array.isArray(p.lista_compras)
  );
}

/* ════════════════════════════ LLAMADA A LA API ═════════════════════════════ */

export async function generateNutritionPlan(formData: FormData, groupContext?: GroupContext): Promise<NutritionPlan> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-nutrition-plan`;

  const response = await fetch(edgeFunctionUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: buildPrompt(formData, groupContext),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 429)
      throw new Error("Límite de uso alcanzado. Espera unos minutos e inténtalo de nuevo.");
    if (response.status === 502)
      throw new Error("Los servidores de Anthropic están saturados. Intenta en 1-2 minutos.");
    throw new Error(`Error generando plan (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const rawText: string = data?.text ?? "";

  // Claude a veces envuelve en ```json ... ``` — extraemos solo el objeto JSON
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      "Claude no devolvió JSON válido. Respuesta recibida:\n" + rawText.slice(0, 400)
    );
  }

  let plan: unknown;
  try {
    plan = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Error parseando JSON de Claude. Revisa la consola para ver la respuesta.");
  }

  if (!validate(plan)) {
    throw new Error(
      "El JSON de Claude no tiene la estructura esperada. " +
      "Intenta de nuevo o cambia el modelo en .env.local."
    );
  }

  return plan;
}
