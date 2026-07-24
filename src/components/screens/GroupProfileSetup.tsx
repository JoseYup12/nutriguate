// ─────────────────────────────────────────────────────────────────────────────
// GroupProfileSetup.tsx
// Pantalla de configuración de perfiles grupales post-pago
// Aplica para: Plan Pareja (Q179/Q279), Plan Cuates (Q159/Q249), Plan Familiar (Q299/Q449)
//
// IMPORTANTE PARA JOSÉ:
// - Este componente NO reemplaza nada existente
// - Se muestra ÚNICAMENTE después de que el pago fue procesado exitosamente
// - Solo aplica si plan_type es: pareja_basic, pareja_plus, cuates_basic,
//   cuates_plus, familiar_basic, familiar_plus
// - Para planes individuales (q99, q149, q199, gratuito) NO mostrar esto
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type GroupType = "pareja" | "cuates" | "familiar";

type MemberCategory = "adulto" | "adolescente" | "nino";

type DietType =
  | "balanceada"
  | "low_carb"
  | "keto"
  | "mediterranea"
  | "alta_proteina"
  | "vegetariana";

type Objetivo =
  | "bajar_grasa"
  | "recomposicion"
  | "ganar_musculo"
  | "salud_general";

export interface MemberProfile {
  id: string;
  nombre: string;
  sexo: "masculino" | "femenino" | "";
  edad: string;
  peso_lbs: string;
  altura_cm: string;
  objetivo: Objetivo | "";
  diet_type: DietType;
  restricciones: string;
  categoria: MemberCategory;
  es_titular: boolean;
}

interface GroupProfileSetupProps {
  group_type: GroupType;
  plan_type: string;
  titular_nombre: string;
  onComplete: (members: MemberProfile[]) => void;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

const getCategoryByAge = (edad: string): MemberCategory => {
  const age = parseInt(edad);
  if (isNaN(age)) return "adulto";
  if (age >= 18) return "adulto";
  if (age >= 13) return "adolescente";
  return "nino";
};

const getGroupConfig = (group_type: GroupType) => {
  switch (group_type) {
    case "pareja":
      return {
        titulo: "Configurá el perfil de tu pareja",
        subtitulo:
          "Tu plan ya está listo. Ahora agregá a tu pareja para que Nutri armonice ambos planes y genere una lista de compras consolidada.",
        min_members: 2,
        max_members: 2,
        emoji: "💑",
        etiquetas: ["Vos (titular)", "Tu pareja"],
        permite_ninos: false,
      };
    case "cuates":
      return {
        titulo: "Configurá el perfil de tu cuate",
        subtitulo:
          "Sus planes son completamente independientes. Lo que los une: el mini challenge semanal. Que gane el mejor.",
        min_members: 2,
        max_members: 2,
        emoji: "🤜🤛",
        etiquetas: ["Vos (titular)", "Tu cuate"],
        permite_ninos: false,
      };
    case "familiar":
      return {
        titulo: "Configurá los perfiles de tu familia",
        subtitulo:
          "Agregá entre 2 y 4 miembros adicionales. Nutri armoniza los menús para que cocinen lo mismo con porciones ajustadas por edad y objetivo.",
        min_members: 3,
        max_members: 5,
        emoji: "👨‍👩‍👧‍👦",
        etiquetas: [],
        permite_ninos: true,
      };
  }
};

const OBJETIVOS = [
  { id: "bajar_grasa", label: "Bajar grasa", emoji: "📉" },
  { id: "recomposicion", label: "Recomposición", emoji: "⚖️" },
  { id: "ganar_musculo", label: "Ganar músculo", emoji: "💪" },
  { id: "salud_general", label: "Salud general", emoji: "🌿" },
];

const DIETAS = [
  { id: "balanceada", label: "Balanceada", emoji: "⚖️" },
  { id: "low_carb", label: "Low Carb", emoji: "📉" },
  { id: "keto", label: "Keto", emoji: "🔥" },
  { id: "mediterranea", label: "Mediterránea", emoji: "🫒" },
  { id: "alta_proteina", label: "Alta Proteína", emoji: "💪" },
  { id: "vegetariana", label: "Vegetariana", emoji: "🌱" },
];

const createEmptyMember = (
  id: string,
  es_titular: boolean,
  nombre_titular?: string
): MemberProfile => ({
  id,
  nombre: es_titular && nombre_titular ? nombre_titular : "",
  sexo: "",
  edad: "",
  peso_lbs: "",
  altura_cm: "",
  objetivo: "",
  diet_type: "balanceada",
  restricciones: "",
  categoria: "adulto",
  es_titular,
});

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function GroupProfileSetup({
  group_type,
  plan_type,
  titular_nombre,
  onComplete,
}: GroupProfileSetupProps) {
  const config = getGroupConfig(group_type);

  // Para pareja y cuates: siempre 2 miembros fijos
  // Para familiar: el titular + miembros adicionales dinámicos
  const [members, setMembers] = useState<MemberProfile[]>(() => {
    if (group_type === "familiar") {
      return [
        createEmptyMember("titular", true, titular_nombre),
        createEmptyMember("m1", false),
      ];
    }
    return [
      createEmptyMember("titular", true, titular_nombre),
      createEmptyMember("m1", false),
    ];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── HANDLERS ────────────────────────────────────────────────────────────────

  const updateMember = (
    index: number,
    field: keyof MemberProfile,
    value: string
  ) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Recalcular categoría si cambia la edad
      if (field === "edad") {
        updated[index].categoria = getCategoryByAge(value);
      }
      return updated;
    });
    // Limpiar error del campo
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${index}_${field}`];
      return next;
    });
  };

  const addMember = () => {
    if (members.length >= config.max_members) return;
    setMembers((prev) => [
      ...prev,
      createEmptyMember(`m${prev.length}`, false),
    ]);
    setActiveIndex(members.length);
  };

  const removeMember = (index: number) => {
    if (index === 0) return; // No eliminar titular
    if (members.length <= (group_type === "familiar" ? 2 : 2)) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex(Math.max(0, index - 1));
  };

  const validateMember = (member: MemberProfile, index: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (!member.nombre.trim())
      newErrors[`${index}_nombre`] = "Requerido";
    if (!member.sexo)
      newErrors[`${index}_sexo`] = "Requerido";
    if (!member.edad || parseInt(member.edad) < 4)
      newErrors[`${index}_edad`] = "Edad mínima 4 años";
    if (!member.peso_lbs || parseFloat(member.peso_lbs) < 20)
      newErrors[`${index}_peso_lbs`] = "Requerido";
    if (!member.altura_cm || parseFloat(member.altura_cm) < 80)
      newErrors[`${index}_altura_cm`] = "Requerido";
    if (!member.objetivo)
      newErrors[`${index}_objetivo`] = "Seleccioná un objetivo";
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateMember(members[activeIndex], activeIndex)) return;
    if (activeIndex < members.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleSubmit = () => {
    // Validar todos los miembros
    let allValid = true;
    members.forEach((m, i) => {
      if (!validateMember(m, i)) allValid = false;
    });
    if (!allValid) return;
    onComplete(members);
  };

  const allFilled = members.every(
    (m) => m.nombre && m.sexo && m.edad && m.peso_lbs && m.altura_cm && m.objetivo
  );

  // ── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.emoji}>{config.emoji}</span>
        <h2 style={S.titulo}>{config.titulo}</h2>
        <p style={S.subtitulo}>{config.subtitulo}</p>
        {group_type === "familiar" && config.permite_ninos && (
          <div style={S.ninosBadge}>
            👶 Incluye perfiles para niños (4-12) y adolescentes (13-17) con
            criterios nutricionales adaptados por edad
          </div>
        )}
      </div>

      {/* Tabs de miembros */}
      <div style={S.tabs}>
        {members.map((m, i) => (
          <button
            key={m.id}
            style={{
              ...S.tab,
              ...(activeIndex === i ? S.tabActive : {}),
            }}
            onClick={() => setActiveIndex(i)}
          >
            <span style={S.tabEmoji}>
              {m.categoria === "nino"
                ? "👶"
                : m.categoria === "adolescente"
                ? "🧑"
                : "👤"}
            </span>
            <span style={S.tabLabel}>
              {m.nombre ||
                (config.etiquetas[i]
                  ? config.etiquetas[i]
                  : `Miembro ${i + 1}`)}
            </span>
            {m.categoria !== "adulto" && (
              <span style={S.tabBadge}>
                {m.categoria === "nino" ? "Niño" : "Adolescente"}
              </span>
            )}
          </button>
        ))}
        {group_type === "familiar" && members.length < config.max_members && (
          <button style={S.addTab} onClick={addMember}>
            + Agregar
          </button>
        )}
      </div>

      {/* Formulario del miembro activo */}
      {members[activeIndex] && (
        <MemberForm
          member={members[activeIndex]}
          index={activeIndex}
          errors={errors}
          group_type={group_type}
          permite_ninos={config.permite_ninos}
          puede_eliminar={
            !members[activeIndex].es_titular && members.length > 2
          }
          onUpdate={(field, value) => updateMember(activeIndex, field, value)}
          onRemove={() => removeMember(activeIndex)}
        />
      )}

      {/* Advertencia para adolescentes/niños */}
      {members[activeIndex]?.categoria !== "adulto" && (
        <div style={S.ageWarning}>
          {members[activeIndex]?.categoria === "nino" ? (
            <>
              👶 <strong>Perfil infantil (4-12 años):</strong> Nutri nunca
              aplica déficit calórico en niños. El objetivo siempre es crecer
              sano, no bajar de peso.
            </>
          ) : (
            <>
              🧑 <strong>Perfil adolescente (13-17 años):</strong> Nutri agrega
              calorías extra por crecimiento y prioriza calcio diariamente. Sin
              déficit calórico.
            </>
          )}
        </div>
      )}

      {/* Navegación */}
      <div style={S.nav}>
        {activeIndex < members.length - 1 ? (
          <button style={S.btnPrimary} onClick={handleNext}>
            Siguiente perfil →
          </button>
        ) : (
          <button
            style={{
              ...S.btnPrimary,
              ...(allFilled ? {} : S.btnDisabled),
            }}
            onClick={handleSubmit}
            disabled={!allFilled}
          >
            Generar planes →
          </button>
        )}
        {activeIndex > 0 && (
          <button
            style={S.btnSecondary}
            onClick={() => setActiveIndex(activeIndex - 1)}
          >
            ← Anterior
          </button>
        )}
      </div>

      <p style={S.hint}>
        Nutri genera un plan personalizado para cada perfil.{" "}
        {group_type !== "cuates"
          ? "Los menús del almuerzo y cena se armonizan para que cocinen lo mismo."
          : "Los planes son completamente independientes."}
      </p>
    </div>
  );
}

// ── FORMULARIO DE MIEMBRO ─────────────────────────────────────────────────────

interface MemberFormProps {
  member: MemberProfile;
  index: number;
  errors: Record<string, string>;
  group_type: GroupType;
  permite_ninos: boolean;
  puede_eliminar: boolean;
  onUpdate: (field: keyof MemberProfile, value: string) => void;
  onRemove: () => void;
}

function MemberForm({
  member,
  index,
  errors,
  permite_ninos,
  puede_eliminar,
  onUpdate,
  onRemove,
}: MemberFormProps) {
  return (
    <div style={S.form}>
      {/* Header del miembro */}
      <div style={S.memberHeader}>
        <span style={S.memberTitle}>
          {member.es_titular ? "Tu perfil" : `Perfil ${index + 1}`}
          {member.categoria !== "adulto" && (
            <span style={S.categoryTag}>
              {member.categoria === "nino" ? "Niño" : "Adolescente"}
            </span>
          )}
        </span>
        {puede_eliminar && (
          <button style={S.removeBtn} onClick={onRemove}>
            Eliminar
          </button>
        )}
      </div>

      {/* Nombre */}
      <div style={S.field}>
        <label style={S.label}>Nombre</label>
        <input
          style={{
            ...S.input,
            ...(errors[`${index}_nombre`] ? S.inputError : {}),
          }}
          placeholder="Nombre completo"
          value={member.nombre}
          onChange={(e) => onUpdate("nombre", e.target.value)}
          disabled={member.es_titular}
        />
        {errors[`${index}_nombre`] && (
          <span style={S.error}>{errors[`${index}_nombre`]}</span>
        )}
      </div>

      {/* Sexo y Edad en fila */}
      <div style={S.row}>
        <div style={{ ...S.field, flex: 1 }}>
          <label style={S.label}>Sexo</label>
          <div style={S.segmented}>
            {["masculino", "femenino"].map((s) => (
              <button
                key={s}
                style={{
                  ...S.segBtn,
                  ...(member.sexo === s ? S.segBtnActive : {}),
                }}
                onClick={() => onUpdate("sexo", s)}
              >
                {s === "masculino" ? "♂ Masculino" : "♀ Femenino"}
              </button>
            ))}
          </div>
          {errors[`${index}_sexo`] && (
            <span style={S.error}>{errors[`${index}_sexo`]}</span>
          )}
        </div>

        <div style={{ ...S.field, flex: 1 }}>
          <label style={S.label}>
            Edad{" "}
            {permite_ninos && (
              <span style={{ color: "var(--aqua, #5BE0E5)", fontSize: "0.7rem" }}>
                (mín. 4 años)
              </span>
            )}
          </label>
          <input
            style={{
              ...S.input,
              ...(errors[`${index}_edad`] ? S.inputError : {}),
            }}
            type="number"
            placeholder="Años"
            min={permite_ninos ? "4" : "16"}
            max="99"
            value={member.edad}
            onChange={(e) => onUpdate("edad", e.target.value)}
          />
          {errors[`${index}_edad`] && (
            <span style={S.error}>{errors[`${index}_edad`]}</span>
          )}
        </div>
      </div>

      {/* Peso y Altura en fila */}
      <div style={S.row}>
        <div style={{ ...S.field, flex: 1 }}>
          <label style={S.label}>Peso (lbs)</label>
          <input
            style={{
              ...S.input,
              ...(errors[`${index}_peso_lbs`] ? S.inputError : {}),
            }}
            type="number"
            placeholder="Libras"
            value={member.peso_lbs}
            onChange={(e) => onUpdate("peso_lbs", e.target.value)}
          />
          {errors[`${index}_peso_lbs`] && (
            <span style={S.error}>{errors[`${index}_peso_lbs`]}</span>
          )}
        </div>

        <div style={{ ...S.field, flex: 1 }}>
          <label style={S.label}>Altura (cm)</label>
          <input
            style={{
              ...S.input,
              ...(errors[`${index}_altura_cm`] ? S.inputError : {}),
            }}
            type="number"
            placeholder="Centímetros"
            value={member.altura_cm}
            onChange={(e) => onUpdate("altura_cm", e.target.value)}
          />
          {errors[`${index}_altura_cm`] && (
            <span style={S.error}>{errors[`${index}_altura_cm`]}</span>
          )}
        </div>
      </div>

      {/* Objetivo — solo adultos y adolescentes */}
      {member.categoria !== "nino" && (
        <div style={S.field}>
          <label style={S.label}>Objetivo</label>
          <div style={S.objetivoGrid}>
            {OBJETIVOS.map((obj) => (
              <button
                key={obj.id}
                style={{
                  ...S.objetivoBtn,
                  ...(member.objetivo === obj.id ? S.objetivoBtnActive : {}),
                }}
                onClick={() => onUpdate("objetivo", obj.id)}
              >
                <span>{obj.emoji}</span>
                <span style={{ fontSize: "0.75rem" }}>{obj.label}</span>
              </button>
            ))}
          </div>
          {errors[`${index}_objetivo`] && (
            <span style={S.error}>{errors[`${index}_objetivo`]}</span>
          )}
        </div>
      )}

      {/* Para niños el objetivo siempre es salud_general */}
      {member.categoria === "nino" && (
        <div style={S.field}>
          <div style={S.ninoObjetivo}>
            🌿 Objetivo automático: <strong>Salud y crecimiento</strong> — en
            niños Nutri no aplica planes de pérdida de peso ni déficit calórico.
          </div>
        </div>
      )}

      {/* Tipo de dieta — solo adultos */}
      {member.categoria === "adulto" && (
        <div style={S.field}>
          <label style={S.label}>Tipo de alimentación</label>
          <div style={S.dietaGrid}>
            {DIETAS.map((d) => (
              <button
                key={d.id}
                style={{
                  ...S.dietaBtn,
                  ...(member.diet_type === d.id ? S.dietaBtnActive : {}),
                }}
                onClick={() => onUpdate("diet_type", d.id)}
              >
                <span style={{ fontSize: "1.1rem" }}>{d.emoji}</span>
                <span style={{ fontSize: "0.7rem", lineHeight: 1.2 }}>
                  {d.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restricciones */}
      <div style={S.field}>
        <label style={S.label}>
          Restricciones o alergias{" "}
          <span style={{ color: "var(--gray, #7A9A7A)", fontSize: "0.75rem" }}>
            (opcional)
          </span>
        </label>
        <input
          style={S.input}
          placeholder="Ej: sin mariscos, alergia al maní, vegetariano..."
          value={member.restricciones}
          onChange={(e) => onUpdate("restricciones", e.target.value)}
        />
      </div>
    </div>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
    maxWidth: "540px",
    margin: "0 auto",
    padding: "0 0.5rem",
  },
  header: {
    textAlign: "center",
    padding: "0.5rem 0",
  },
  emoji: {
    fontSize: "2rem",
    display: "block",
    marginBottom: "8px",
  },
  titulo: {
    fontSize: "1.2rem",
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
  ninosBadge: {
    marginTop: "10px",
    background: "rgba(91,224,229,0.08)",
    border: "1px solid rgba(91,224,229,0.2)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "0.78rem",
    color: "var(--aqua, #5BE0E5)",
    lineHeight: 1.5,
  },
  tabs: {
    display: "flex",
    gap: "0.4rem",
    overflowX: "auto",
    paddingBottom: "2px",
  },
  tab: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    padding: "6px 12px",
    background: "var(--surface, #1A2E1A)",
    border: "1px solid #2A3F2A",
    borderRadius: "8px",
    cursor: "pointer",
    minWidth: "80px",
    transition: "all 0.15s ease",
    position: "relative",
  },
  tabActive: {
    border: "1.5px solid var(--lima, #A9EF51)",
    background: "#1E3A1E",
  },
  tabEmoji: {
    fontSize: "1rem",
  },
  tabLabel: {
    fontSize: "0.7rem",
    color: "var(--white, #F0FFF2)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "80px",
  },
  tabBadge: {
    fontSize: "0.6rem",
    background: "var(--aqua, #5BE0E5)",
    color: "#0F1F0F",
    borderRadius: "4px",
    padding: "1px 4px",
    fontWeight: 700,
  },
  addTab: {
    padding: "6px 12px",
    background: "transparent",
    border: "1px dashed #2A3F2A",
    borderRadius: "8px",
    cursor: "pointer",
    color: "var(--lima, #A9EF51)",
    fontSize: "0.75rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  form: {
    background: "var(--surface, #1A2E1A)",
    border: "1px solid #2A3F2A",
    borderRadius: "12px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  memberHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--lima, #A9EF51)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  categoryTag: {
    fontSize: "0.65rem",
    background: "var(--aqua, #5BE0E5)",
    color: "#0F1F0F",
    borderRadius: "4px",
    padding: "2px 6px",
    fontWeight: 700,
  },
  removeBtn: {
    fontSize: "0.72rem",
    color: "#E05555",
    background: "transparent",
    border: "1px solid #E05555",
    borderRadius: "6px",
    padding: "3px 8px",
    cursor: "pointer",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--gray, #7A9A7A)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  input: {
    background: "#0F1F0F",
    border: "1px solid #2A3F2A",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "var(--white, #F0FFF2)",
    fontSize: "0.85rem",
    outline: "none",
    width: "100%",
  },
  inputError: {
    border: "1px solid #E05555",
  },
  error: {
    fontSize: "0.7rem",
    color: "#E05555",
  },
  row: {
    display: "flex",
    gap: "0.6rem",
  },
  segmented: {
    display: "flex",
    gap: "4px",
  },
  segBtn: {
    flex: 1,
    padding: "7px 4px",
    background: "#0F1F0F",
    border: "1px solid #2A3F2A",
    borderRadius: "8px",
    color: "var(--gray, #7A9A7A)",
    fontSize: "0.75rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  segBtnActive: {
    background: "#1E3A1E",
    border: "1.5px solid var(--lima, #A9EF51)",
    color: "var(--lima, #A9EF51)",
    fontWeight: 700,
  },
  objetivoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "4px",
  },
  objetivoBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    padding: "8px 4px",
    background: "#0F1F0F",
    border: "1px solid #2A3F2A",
    borderRadius: "8px",
    color: "var(--gray, #7A9A7A)",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "1rem",
  },
  objetivoBtnActive: {
    background: "#1E3A1E",
    border: "1.5px solid var(--lima, #A9EF51)",
    color: "var(--lima, #A9EF51)",
  },
  dietaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "4px",
  },
  dietaBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    padding: "7px 4px",
    background: "#0F1F0F",
    border: "1px solid #2A3F2A",
    borderRadius: "8px",
    color: "var(--gray, #7A9A7A)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  dietaBtnActive: {
    background: "#1E3A1E",
    border: "1.5px solid var(--aqua, #5BE0E5)",
    color: "var(--aqua, #5BE0E5)",
  },
  ninoObjetivo: {
    background: "rgba(169,239,81,0.06)",
    border: "1px solid rgba(169,239,81,0.15)",
    borderRadius: "8px",
    padding: "8px 10px",
    fontSize: "0.78rem",
    color: "var(--white, #F0FFF2)",
    lineHeight: 1.5,
  },
  ageWarning: {
    background: "rgba(91,224,229,0.06)",
    border: "1px solid rgba(91,224,229,0.2)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "0.78rem",
    color: "var(--aqua, #5BE0E5)",
    lineHeight: 1.5,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  btnPrimary: {
    width: "100%",
    padding: "12px",
    background: "var(--lima, #A9EF51)",
    color: "#0F1F0F",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  btnSecondary: {
    width: "100%",
    padding: "10px",
    background: "transparent",
    color: "var(--gray, #7A9A7A)",
    border: "1px solid #2A3F2A",
    borderRadius: "10px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  hint: {
    textAlign: "center",
    fontSize: "0.75rem",
    color: "var(--gray, #7A9A7A)",
    lineHeight: 1.5,
  },
};
