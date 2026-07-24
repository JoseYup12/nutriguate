import jsPDF from "jspdf";
import type { NutritionPlan } from "./claude";
import type { FormData } from "@/components/screens/FormularioDiagnostico";

type RGB = [number, number, number];

const GREEN:      RGB = [76, 130, 40];
const DARK:       RGB = [18, 30, 15];
const GRAY:       RGB = [100, 110, 100];
const LIGHT_GRAY: RGB = [242, 245, 240];
const WHITE:      RGB = [255, 255, 255];

export function downloadPlanPDF(planData: NutritionPlan, formData: FormData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PW     = 210;
  const M      = 14;
  const CW     = PW - M * 2;
  let   y      = 0;

  /* ─── helpers ─── */
  const font = (size: number, style: "normal" | "bold" = "normal", color: RGB = DARK) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
  };

  const fill = (color: RGB) => doc.setFillColor(...color);

  const box = (x: number, yy: number, w: number, h: number, color: RGB, radius = 2) => {
    fill(color);
    doc.roundedRect(x, yy, w, h, radius, radius, "F");
  };

  const line = (yy: number) => {
    doc.setDrawColor(...LIGHT_GRAY);
    doc.line(M, yy, PW - M, yy);
  };

  const wrap = (text: string, maxW: number) =>
    doc.splitTextToSize(text, maxW) as string[];

  const checkPage = (needed: number) => {
    if (y + needed > 278) {
      doc.addPage();
      addPageHeader();
      y = 28;
    }
  };

  const addPageHeader = () => {
    fill(GREEN);
    doc.rect(0, 0, PW, 10, "F");
    font(7, "bold", WHITE);
    doc.text("NutriGuate — Plan Nutricional Personalizado", M, 6.5);
    font(7, "normal", WHITE);
    doc.text(`${formData.name} · ${new Date().toLocaleDateString("es-GT")}`, PW - M, 6.5, { align: "right" });
  };

  /* ═══════════════════ PÁGINA 1 ═══════════════════ */

  /* Header principal */
  box(0, 0, PW, 32, GREEN, 0);
  font(22, "bold", WHITE);
  doc.text("NutriGuate", M, 14);
  font(10, "normal", WHITE);
  doc.text("Plan Nutricional Personalizado", M, 22);
  font(8, "normal", WHITE);
  doc.text(new Date().toLocaleDateString("es-GT", { day: "2-digit", month: "long", year: "numeric" }), PW - M, 22, { align: "right" });
  y = 40;

  /* Nombre del caso */
  font(14, "bold", GREEN);
  doc.text(planData.caso.nombre, M, y);
  y += 6;

  font(8, "normal", GRAY);
  const insightLines = wrap(planData.caso.insight, CW);
  doc.text(insightLines, M, y);
  y += insightLines.length * 4.5 + 2;

  font(8, "normal", GRAY);
  const failLines = wrap(`Fallo raíz: ${planData.caso.fallo}`, CW);
  doc.text(failLines, M, y);
  y += failLines.length * 4 + 6;

  /* Diagnóstico */
  const diagLines = wrap(planData.diagnostico, CW);
  font(7.5, "normal", GRAY);
  doc.text(diagLines, M, y);
  y += diagLines.length * 4 + 8;

  line(y); y += 6;

  /* ── Macros ── */
  font(10, "bold", DARK);
  doc.text("MACROS DIARIOS", M, y);
  y += 5;

  const macros: [string, string][] = [
    ["Calorías",      `${planData.macros.kcal.toLocaleString("es-GT")} kcal`],
    ["Proteína",      `${planData.macros.proteina_g}g`],
    ["Carbohidratos", `${planData.macros.carbs_g}g`],
    ["Grasas",        `${planData.macros.grasas_g}g`],
  ];

  const colW = CW / 4;
  macros.forEach(([label, value], i) => {
    const x = M + i * colW;
    box(x, y, colW - 2, 17, LIGHT_GRAY);
    font(6.5, "normal", GRAY);
    doc.text(label.toUpperCase(), x + 3, y + 5);
    font(10, "bold", GREEN);
    doc.text(value, x + 3, y + 13);
  });
  y += 23;

  font(7, "normal", GRAY);
  doc.text(`g proteína/kg peso: ${planData.macros.protKg}`, M, y);
  y += 8;

  line(y); y += 6;

  /* ═══════════════════ PLAN NUTRICIONAL ═══════════════════ */
  font(10, "bold", DARK);
  doc.text("PLAN NUTRICIONAL — 3 DÍAS", M, y);
  y += 6;

  for (const day of planData.plan_nutricional) {
    checkPage(35);
    box(M, y, CW, 8, GREEN);
    font(9, "bold", WHITE);
    doc.text(day.dia.toUpperCase(), M + 3, y + 5.5);
    y += 10;

    for (const meal of day.comidas) {
      checkPage(20);
      font(8.5, "bold", DARK);
      doc.text(`${meal.nombre}  ·  ${meal.hora}`, M + 2, y);
      font(7, "normal", GRAY);
      doc.text(`${meal.total_kcal} kcal`, PW - M, y, { align: "right" });
      y += 5;

      for (const item of meal.items) {
        checkPage(6);
        fill(LIGHT_GRAY);
        doc.rect(M + 2, y - 0.5, CW - 2, 5, "F");
        font(7.5, "normal", DARK);
        doc.text(`• ${item.alimento}`, M + 5, y + 3);
        doc.text(item.cantidad, M + 105, y + 3);
        font(7.5, "bold", GREEN);
        doc.text(`${item.kcal} kcal`, PW - M, y + 3, { align: "right" });
        y += 5;
      }
      y += 3;
    }
    y += 5;
  }

  /* ═══════════════════ ACTIVIDAD FÍSICA ═══════════════════ */
  checkPage(55);
  line(y); y += 6;
  font(10, "bold", DARK);
  doc.text("ACTIVIDAD FÍSICA", M, y);
  y += 5;

  box(M, y, CW, 9, GREEN);
  font(9, "bold", WHITE);
  doc.text(planData.actividad.tipo, M + 3, y + 6);
  y += 13;

  font(8, "normal", GRAY);
  const descL = wrap(planData.actividad.descripcion, CW);
  doc.text(descL, M, y);
  y += descL.length * 4.5 + 4;

  checkPage(20);
  font(8, "bold", DARK);
  doc.text("Semana 1:", M, y); y += 4;
  font(7.5, "normal", GRAY);
  const s1L = wrap(planData.actividad.semana1, CW - 4);
  doc.text(s1L, M + 3, y);
  y += s1L.length * 4 + 4;

  checkPage(20);
  font(8, "bold", DARK);
  doc.text("Semana 2:", M, y); y += 4;
  font(7.5, "normal", GRAY);
  const s2L = wrap(planData.actividad.semana2, CW - 4);
  doc.text(s2L, M + 3, y);
  y += s2L.length * 4 + 8;

  /* ═══════════════════ METAS ═══════════════════ */
  checkPage(40);
  line(y); y += 6;
  font(10, "bold", DARK);
  doc.text("METAS POR FASE", M, y);
  y += 5;

  for (const meta of planData.metas) {
    checkPage(14);
    box(M, y, 38, 8, GREEN);
    font(6.5, "bold", WHITE);
    doc.text(meta.fase, M + 2, y + 5.5);
    font(7.5, "normal", DARK);
    const metaL = wrap(meta.meta, CW - 43);
    doc.text(metaL, M + 41, y + (metaL.length > 1 ? 2 : 5));
    y += Math.max(10, metaL.length * 4 + 3);
  }

  /* ═══════════════════ LISTA DE COMPRAS ═══════════════════ */
  checkPage(50);
  line(y); y += 6;
  font(10, "bold", DARK);
  doc.text("LISTA DE COMPRAS", M, y);
  y += 5;

  /* Cabecera tabla */
  box(M, y, CW, 7, DARK);
  font(6.5, "bold", WHITE);
  doc.text("PRODUCTO",   M + 3,   y + 4.5);
  doc.text("CANTIDAD",   M + 85,  y + 4.5);
  doc.text("PRECIO",     M + 120, y + 4.5);
  doc.text("TIENDA",     M + 148, y + 4.5);
  y += 8;

  let alt = false;
  for (const item of planData.lista_compras) {
    checkPage(7);
    if (alt) { fill(LIGHT_GRAY); doc.rect(M, y - 1, CW, 6, "F"); }
    font(7.5, "normal", DARK);
    doc.text(item.item.slice(0, 38), M + 3, y + 3.5);
    doc.text(item.cantidad, M + 85, y + 3.5);
    font(7.5, "bold", GREEN);
    doc.text(item.precio_gt, M + 120, y + 3.5);
    font(7.5, "normal", GRAY);
    doc.text(item.tienda, M + 148, y + 3.5);
    y += 6;
    alt = !alt;
  }

  /* ═══════════════════ FOOTER TODAS LAS PÁGINAS ═══════════════════ */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    fill(DARK);
    doc.rect(0, 287, PW, 10, "F");
    font(6.5, "normal", WHITE);
    doc.text("NutriGuate · nutriguate.com", M, 293);
    doc.text(`Pág. ${p} / ${total}`, PW - M, 293, { align: "right" });
    doc.text("Asesor: Irwing Samuel Sagastume Rossil · +502 5910 2808", PW / 2, 293, { align: "center" });
  }

  /* Guardar */
  const safeName = formData.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  doc.save(`NutriGuate-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
