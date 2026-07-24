// ─────────────────────────────────────────────────────────────────────────────
// DietTypeSelector.tsx
// Componente para el formulario de diagnóstico de NutriGuate
//
// INSTRUCCIONES PARA JOSÉ:
// 1. Agregá este archivo en: src/components/forms/DietTypeSelector.tsx
// 2. En FormularioDiagnostico.tsx, importá este componente y agregá un nuevo
//    paso al formulario (después de "Tu objetivo" o antes de "Confirmación")
// 3. En el estado del formulario (formData), agregá el campo:
//    diet_type: string (default: 'balanceada')
// 4. Pasale al componente:
//    - value: formData.diet_type
//    - onChange: (val) => setFormData({...formData, diet_type: val})
// 5. Asegurate de incluir diet_type en el JSON que se le manda a claude.ts
//    cuando se genera el plan — Nutri lo usa para personalizar la dieta
// 6. NO modificar nada más del formulario, solo agregar este paso nuevo
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ── TIPOS ────────────────────────────────────────────────────────────────────
type DietType = {
  id: string;
  nombre: string;
  emoji: string;
  tagline: string;
  descripcion: string;
  permite: string[];
  limita: string[];
  ideal_para: string;
  advertencia?: string;
};

// ── DATOS DE DIETAS ──────────────────────────────────────────────────────────
const DIETAS: DietType[] = [
  {
    id: "balanceada",
    nombre: "Balanceada",
    emoji: "⚖️",
    tagline: "La más versátil",
    descripcion:
      "Distribución equilibrada de proteínas, carbohidratos y grasas. Funciona para cualquier objetivo y es la más fácil de seguir en el día a día guatemalteco.",
    permite: ["Tortillas", "Arroz", "Frijoles", "Pollo", "Res", "Frutas", "Avena"],
    limita: ["Azúcar procesada", "Pan dulce", "Bebidas azucaradas"],
    ideal_para: "Cualquier objetivo — pérdida de grasa, recomposición o ganancia muscular.",
  },
  {
    id: "low_carb",
    nombre: "Low Carb",
    emoji: "📉",
    tagline: "Menos carbos, más resultados",
    descripcion:
      "Reducción moderada de carbohidratos para mejorar composición corporal y control de insulina. Más flexible que keto — podés comer tortilla y frijoles en porciones controladas.",
    permite: ["Huevo", "Carnes", "Aguacate", "Chipilín", "Güisquil", "Frijoles (porciones pequeñas)", "1 tortilla por comida"],
    limita: ["Arroz en exceso", "Plátano", "Pan", "Azúcar"],
    ideal_para: "Pérdida de grasa y mejora de composición sin restricciones extremas.",
  },
  {
    id: "keto",
    nombre: "Keto",
    emoji: "🔥",
    tagline: "Tu cuerpo quema grasa como combustible",
    descripcion:
      "Alta en grasa, muy baja en carbos. El cuerpo entra en cetosis y usa grasa como energía principal. Requiere disciplina estricta — menos de 50g de carbos al día.",
    permite: ["Huevo", "Carnes", "Aguacate", "Queso", "Chipilín", "Loroco", "Güisquil", "Aceite de oliva", "Nueces"],
    limita: ["Tortillas", "Arroz", "Frijoles", "Plátano", "Avena", "Frutas (excepto fresas)"],
    ideal_para: "Pérdida de grasa rápida en personas con disciplina alta.",
    advertencia: "Los primeros 3-7 días podés sentir fatiga y mareos (keto flu). Es normal y temporal.",
  },
  {
    id: "mediterranea",
    nombre: "Mediterránea",
    emoji: "🫒",
    tagline: "Salud a largo plazo",
    descripcion:
      "Rica en grasas saludables, legumbres y vegetales. Adaptada al contexto guatemalteco con chipilín, loroco y güisquil como base vegetal. Énfasis en variedad y colores.",
    permite: ["Aceite de oliva", "Aguacate", "Frijoles", "Lentejas", "Tilapia", "Chipilín", "Loroco", "Frutas", "Nueces"],
    limita: ["Carnes rojas en exceso", "Azúcar procesada", "Frituras"],
    ideal_para: "Salud general, longevidad y bienestar. Excelente para sostenibilidad a largo plazo.",
  },
  {
    id: "alta_proteina",
    nombre: "Alta Proteína",
    emoji: "💪",
    tagline: "Máximo músculo, mínima grasa",
    descripcion:
      "Proteína elevada (2.4-3.0g por kg de peso) para maximizar ganancia muscular o preservar masa en déficit. Carbos moderados, grasa controlada.",
    permite: ["Pollo", "Res", "Tilapia", "Atún", "Huevo", "Frijoles", "Lentejas", "Chipilín"],
    limita: ["Grasas en exceso", "Carbos simples", "Azúcar"],
    ideal_para: "Recomposición corporal o ganancia muscular con control de grasa.",
  },
  {
    id: "vegetariana",
    nombre: "Vegetariana",
    emoji: "🌱",
    tagline: "Sin carne, sin límites",
    descripcion:
      "Sin carne ni pescado. Proteína completa por combinación de alimentos: frijoles + tortilla, lentejas + arroz, huevo + legumbres. 100% viable con alimentos guatemaltecos.",
    permite: ["Huevo", "Frijoles", "Lentejas", "Chipilín", "Macuy", "Queso fresco", "Aguacate", "Tortillas", "Arroz"],
    limita: ["Carnes", "Pollo", "Pescado", "Mariscos"],
    ideal_para: "Personas que no consumen carne por preferencia, ética o salud.",
  },
];

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
interface DietTypeSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function DietTypeSelector({ value, onChange }: DietTypeSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeTooltip = DIETAS.find((d) => d.id === hoveredId);
  const selectedDiet = DIETAS.find((d) => d.id === value);

  return (
    <div style={styles.wrapper}>
      {/* Título del paso */}
      <div style={styles.header}>
        <p style={styles.paso}>Tu contexto</p>
        <h2 style={styles.titulo}>¿Qué tipo de alimentación preferís?</h2>
        <p style={styles.subtitulo}>
          Nutri va a generar tu plan según este enfoque. Podés cambiarlo después si querés probar otro.
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div style={styles.grid}>
        {DIETAS.map((dieta) => {
          const isSelected = value === dieta.id;
          const isHovered = hoveredId === dieta.id;

          return (
            <button
              key={dieta.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
                ...(isHovered && !isSelected ? styles.cardHovered : {}),
              }}
              onClick={() => onChange(dieta.id)}
              onMouseEnter={() => setHoveredId(dieta.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Indicador seleccionado */}
              {isSelected && (
                <div style={styles.checkBadge}>✓</div>
              )}

              <span style={styles.cardEmoji}>{dieta.emoji}</span>
              <span style={styles.cardNombre}>{dieta.nombre}</span>
              <span style={styles.cardTagline}>{dieta.tagline}</span>

              {/* Barra inferior animada */}
              <div
                style={{
                  ...styles.cardBar,
                  opacity: isSelected || isHovered ? 1 : 0,
                  backgroundColor: isSelected ? "var(--lima, #A9EF51)" : "var(--aqua, #5BE0E5)",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Tooltip expandido */}
      <div
        style={{
          ...styles.tooltip,
          opacity: activeTooltip ? 1 : 0,
          transform: activeTooltip ? "translateY(0)" : "translateY(8px)",
          pointerEvents: activeTooltip ? "auto" : "none",
        }}
      >
        {activeTooltip && (
          <>
            <p style={styles.tooltipDesc}>{activeTooltip.descripcion}</p>

            <div style={styles.tooltipColumns}>
              <div>
                <p style={styles.tooltipLabel}>✅ Permitido</p>
                {activeTooltip.permite.map((item) => (
                  <p key={item} style={styles.tooltipItem}>• {item}</p>
                ))}
              </div>
              <div>
                <p style={styles.tooltipLabel}>⚠️ Limitado</p>
                {activeTooltip.limita.map((item) => (
                  <p key={item} style={styles.tooltipItem}>• {item}</p>
                ))}
              </div>
            </div>

            <p style={styles.tooltipIdeal}>
              <span style={{ color: "var(--aqua, #5BE0E5)" }}>Ideal para: </span>
              {activeTooltip.ideal_para}
            </p>

            {activeTooltip.advertencia && (
              <p style={styles.tooltipAdvertencia}>
                ⚡ {activeTooltip.advertencia}
              </p>
            )}
          </>
        )}
        {!activeTooltip && (
          <p style={{ color: "var(--gray, #7A9A7A)", fontSize: "0.85rem", textAlign: "center" }}>
            Pasá el cursor sobre una opción para ver los detalles
          </p>
        )}
      </div>

      {/* Selección actual */}
      {selectedDiet && (
        <div style={styles.seleccionActual}>
          <span style={{ color: "var(--gray, #7A9A7A)", fontSize: "0.8rem" }}>Seleccionaste: </span>
          <span style={{ color: "var(--lima, #A9EF51)", fontWeight: 700 }}>
            {selectedDiet.emoji} {selectedDiet.nombre}
          </span>
        </div>
      )}
    </div>
  );
}

// ── ESTILOS ──────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    width: "100%",
    maxWidth: "520px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
  },
  paso: {
    fontSize: "0.75rem",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--aqua, #5BE0E5)",
    marginBottom: "6px",
  },
  titulo: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "var(--white, #F0FFF2)",
    marginBottom: "6px",
    lineHeight: 1.3,
  },
  subtitulo: {
    fontSize: "0.82rem",
    color: "var(--gray, #7A9A7A)",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.6rem",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "0.9rem 0.5rem 0.8rem",
    background: "var(--surface, #1A2E1A)",
    border: "1px solid #2A3F2A",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.18s ease",
    overflow: "hidden",
  },
  cardSelected: {
    border: "1.5px solid var(--lima, #A9EF51)",
    background: "#1E3A1E",
    boxShadow: "0 0 12px rgba(169,239,81,0.12)",
  },
  cardHovered: {
    border: "1px solid var(--aqua, #5BE0E5)",
    background: "#1A2E2E",
  },
  checkBadge: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "var(--lima, #A9EF51)",
    color: "#0F1F0F",
    fontSize: "9px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: "1.4rem",
    lineHeight: 1,
  },
  cardNombre: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--white, #F0FFF2)",
    textAlign: "center",
  },
  cardTagline: {
    fontSize: "0.68rem",
    color: "var(--gray, #7A9A7A)",
    textAlign: "center",
    lineHeight: 1.3,
  },
  cardBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "2px",
    transition: "opacity 0.18s ease, background-color 0.18s ease",
  },
  tooltip: {
    background: "var(--surface, #1A2E1A)",
    border: "1px solid #2A3F2A",
    borderRadius: "10px",
    padding: "1rem 1.1rem",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    minHeight: "80px",
  },
  tooltipDesc: {
    fontSize: "0.82rem",
    color: "var(--white, #F0FFF2)",
    lineHeight: 1.55,
    marginBottom: "0.8rem",
  },
  tooltipColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.8rem",
    marginBottom: "0.7rem",
  },
  tooltipLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "var(--gray, #7A9A7A)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  tooltipItem: {
    fontSize: "0.76rem",
    color: "var(--white, #F0FFF2)",
    lineHeight: 1.6,
  },
  tooltipIdeal: {
    fontSize: "0.78rem",
    color: "var(--white, #F0FFF2)",
    lineHeight: 1.5,
    borderTop: "1px solid #2A3F2A",
    paddingTop: "0.6rem",
  },
  tooltipAdvertencia: {
    fontSize: "0.76rem",
    color: "#F0C060",
    marginTop: "0.5rem",
    lineHeight: 1.5,
    background: "rgba(240,192,96,0.08)",
    padding: "6px 8px",
    borderRadius: "6px",
  },
  seleccionActual: {
    textAlign: "center",
    fontSize: "0.82rem",
    padding: "6px",
  },
};
