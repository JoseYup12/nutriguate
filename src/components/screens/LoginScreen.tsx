import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import heroImg from "@/assets/hero-person.jpg";
import { type SheetUser } from "@/lib/googleSheets";
import { loginSupabaseUser, registerSupabaseUser } from "@/lib/supabase-auth";

/* ── Icono de ojo para toggle de contraseña ── */
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

/* ── Input con icono opcional ── */
interface InputFieldProps {
  label:       string;
  type?:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  disabled?:   boolean;
  hasError?:   boolean;
  autoComplete?: string;
  icon?:       React.ReactNode;
  rightEl?:    React.ReactNode;
  hint?:       string;
}
const InputField = ({
  label, type = "text", value, onChange, placeholder,
  disabled, hasError, autoComplete, icon, rightEl, hint,
}: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/35 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={[
          "w-full bg-surface rounded-xl py-3.5 text-sm text-foreground",
          "placeholder:text-foreground/25 focus:outline-none transition-all duration-200",
          "border-[1.5px]",
          hasError
            ? "border-crimson/50 focus:border-crimson"
            : "border-lima/10 focus:border-lima focus:shadow-[0_0_0_3px_hsl(84_83%_63%/0.12)]",
          icon    ? "pl-11 pr-4"    : "px-4",
          rightEl ? "pr-11 pl-11" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      />
      {rightEl && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {rightEl}
        </div>
      )}
    </div>
    {hint && <p className="text-[10px] text-foreground/35">{hint}</p>}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════════
   LoginScreen
   ════════════════════════════════════════════════════════════════════════════ */
interface Props {
  onAuthSuccess: (user: SheetUser) => void;
}

type Tab = "login" | "register";

export const LoginScreen = ({ onAuthSuccess }: Props) => {
  const [tab, setTab]           = useState<Tab>("login");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  /* ── Login fields ── */
  const [lEmail, setLEmail]       = useState("");
  const [lPassword, setLPassword] = useState("");
  const [showLP, setShowLP]       = useState(false);

  /* ── Register fields ── */
  const [rNombre, setRNombre]     = useState("");
  const [rPhone, setRPhone]       = useState("");
  const [rEmail, setREmail]       = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rConfirm, setRConfirm]   = useState("");
  const [showRP, setShowRP]       = useState(false);
  const [showRC, setShowRC]       = useState(false);

  const clearError = () => setError(null);

  /* ── Validaciones ── */
  const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const pwdValid   = (p: string) => p.length >= 8;

  /* ── Submit login ── */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!lEmail || !lPassword) { setError("Completá todos los campos."); return; }
    setLoading(true); setError(null);
    try {
      const user = await loginSupabaseUser(lEmail, lPassword);
      setSuccess(true);
      setTimeout(() => onAuthSuccess(user), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Submit register ── */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!rNombre.trim()) { setError("Ingresá tu nombre."); return; }
    if (!rPhone.trim() || !/^502\d{8}$/.test(rPhone.trim())) { setError("Ingresa tu número con formato 502XXXXXXXX (11 dígitos)"); return; }
    if (!emailValid(rEmail)) { setError("El correo no tiene un formato válido."); return; }
    if (!pwdValid(rPassword)) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (rPassword !== rConfirm) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true); setError(null);
    try {
      const user = await registerSupabaseUser(rNombre.trim(), rEmail, rPassword, rPhone);
      setSuccess(true);
      setTimeout(() => onAuthSuccess(user), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Iconos SVG inline ── */
  const PersonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const LockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

  /* ── Estado de éxito ── */
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 anim-fade-up">
          <div className="w-20 h-20 rounded-full bg-lima/15 border-2 border-lima flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="hsl(var(--lima))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="font-display text-2xl text-lima">¡Bienvenido/a!</p>
          <p className="text-foreground/50 text-sm">Preparando tu plan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Fondo con foto muy tenue ── */}
      <div className="fixed inset-0 pointer-events-none">
        <img src={heroImg} alt="" className="w-full h-full object-cover opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        {/* Glow sutil */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(84 83% 63% / 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Contenido centrado ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Logo + tagline */}
        <div className="text-center mb-8 anim-fade-up">
          <Logo size="lg" />
          <p className="mt-3 text-foreground/45 text-sm tracking-wide">
            Tu sistema nutricional personal · Guatemala
          </p>
        </div>

        {/* ── Tarjeta principal ── */}
        <div className="w-full max-w-[440px] anim-fade-up">
          <div className="glass-card overflow-hidden">

            {/* Badge de estado */}
            <div className="px-6 pt-5 pb-4 border-b border-lima/8">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lima anim-pulse-soft" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                  Conectado · NutriGuate
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-5 pb-0">
              <div className="relative flex gap-1 bg-surface/60 rounded-xl p-1">
                {/* Indicador animado */}
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-lima/15 border border-lima/30 transition-all duration-300"
                  style={{
                    left:  tab === "login"    ? "4px" : "50%",
                    right: tab === "register" ? "4px" : "50%",
                  }}
                />
                {(["login", "register"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); clearError(); }}
                    className={[
                      "relative flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors duration-200 z-10",
                      tab === t ? "text-lima" : "text-foreground/40 hover:text-foreground/70",
                    ].join(" ")}
                  >
                    {t === "login" ? "Iniciar sesión" : "Nueva cuenta"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── FORMULARIO ── */}
            <div className="p-6">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-crimson/8 border border-crimson/25 rounded-xl px-4 py-3 mb-5">
                  <svg className="flex-shrink-0 mt-0.5 text-crimson" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-sm text-crimson/90 leading-snug">{error}</p>
                </div>
              )}

              {/* ──────────── LOGIN FORM ──────────── */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <InputField
                    label="Correo electrónico"
                    type="email"
                    value={lEmail}
                    onChange={(v) => { setLEmail(v); clearError(); }}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    disabled={loading}
                    hasError={!!error && !lEmail}
                    icon={<MailIcon />}
                  />
                  <InputField
                    label="Contraseña"
                    type={showLP ? "text" : "password"}
                    value={lPassword}
                    onChange={(v) => { setLPassword(v); clearError(); }}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    disabled={loading}
                    hasError={!!error && !lPassword}
                    icon={<LockIcon />}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowLP((v) => !v)}
                        className="text-foreground/40 hover:text-foreground/70 transition-colors"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showLP} />
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading || !lEmail || !lPassword}
                    className={[
                      "w-full rounded-xl py-3.5 font-bold text-sm transition-all mt-1",
                      loading || !lEmail || !lPassword
                        ? "bg-surface border border-lima/10 text-foreground/25 cursor-not-allowed"
                        : "cta-primary",
                    ].join(" ")}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-lima/20 border-t-lima anim-spin-slow" />
                        Verificando…
                      </span>
                    ) : "Iniciar sesión →"}
                  </button>
                </form>
              )}

              {/* ──────────── REGISTER FORM ──────────── */}
              {tab === "register" && (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <InputField
                    label="Nombre completo"
                    value={rNombre}
                    onChange={(v) => { setRNombre(v); clearError(); }}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    disabled={loading}
                    hasError={!!error && !rNombre.trim()}
                    icon={<PersonIcon />}
                  />
                  <InputField
                    label="Número de WhatsApp"
                    type="tel"
                    value={rPhone}
                    onChange={(v) => { setRPhone(v); clearError(); }}
                    placeholder="502XXXXXXXX"
                    autoComplete="tel"
                    disabled={loading}
                    hasError={!!error && !rPhone.trim()}
                  />
                  <InputField
                    label="Correo electrónico"
                    type="email"
                    value={rEmail}
                    onChange={(v) => { setREmail(v); clearError(); }}
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    disabled={loading}
                    hasError={!!error && !emailValid(rEmail)}
                    icon={<MailIcon />}
                  />
                  <InputField
                    label="Contraseña"
                    type={showRP ? "text" : "password"}
                    value={rPassword}
                    onChange={(v) => { setRPassword(v); clearError(); }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={loading}
                    hasError={!!error && !pwdValid(rPassword)}
                    hint={rPassword && !pwdValid(rPassword) ? "Mínimo 8 caracteres" : undefined}
                    icon={<LockIcon />}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowRP((v) => !v)}
                        className="text-foreground/40 hover:text-foreground/70 transition-colors"
                        tabIndex={-1}
                      >
                        <EyeIcon open={showRP} />
                      </button>
                    }
                  />
                  <InputField
                    label="Confirmar contraseña"
                    type={showRC ? "text" : "password"}
                    value={rConfirm}
                    onChange={(v) => { setRConfirm(v); clearError(); }}
                    placeholder="Repetí tu contraseña"
                    autoComplete="new-password"
                    disabled={loading}
                    hasError={!!error && rPassword !== rConfirm}
                    icon={<LockIcon />}
                    rightEl={
                      rConfirm && rConfirm === rPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="hsl(var(--lima))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRC((v) => !v)}
                          className="text-foreground/40 hover:text-foreground/70 transition-colors"
                          tabIndex={-1}
                        >
                          <EyeIcon open={showRC} />
                        </button>
                      )
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading || !rNombre || !rPhone || !rEmail || !rPassword || !rConfirm}
                    className={[
                      "w-full rounded-xl py-3.5 font-bold text-sm transition-all mt-1",
                      loading || !rNombre || !rEmail || !rPassword || !rConfirm
                        ? "bg-surface border border-lima/10 text-foreground/25 cursor-not-allowed"
                        : "cta-primary",
                    ].join(" ")}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-lima/20 border-t-lima anim-spin-slow" />
                        Creando cuenta…
                      </span>
                    ) : "Crear cuenta gratis →"}
                  </button>

                  <p className="text-[10px] text-foreground/30 text-center leading-relaxed">
                    Al crear una cuenta aceptás los términos de uso de NutriGuate.
                    Tu contraseña se almacena encriptada.
                  </p>
                </form>
              )}
            </div>
          </div>


          {/* ── Stats de confianza ── */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              ["🔒", "Contraseña encriptada", "SHA-256"],
              ["🇬🇹", "Hecho para Guatemala", "100% local"],
              ["⚡", "Plan en 2 minutos", "Gratis"],
            ].map(([e, t, s]) => (
              <div key={t} className="bg-surface/40 border border-lima/8 rounded-xl p-3">
                <div className="text-xl mb-1">{e}</div>
                <div className="text-[10px] font-bold text-foreground/50 leading-tight">{t}</div>
                <div className="text-[9px] text-foreground/25 mt-0.5">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center pb-6 text-[10px] text-foreground/25 px-4">
        NutriGuate © 2026 · Guatemala 🇬🇹 · Tu información está protegida
      </div>
    </div>
  );
};
