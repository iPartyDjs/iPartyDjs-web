import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { setAdminAuthenticated } from "./RequireAdminAuth";
import "./Adminlogin.css";

/* ---------------------------------------------------
   Esquema de validación (Zod)
--------------------------------------------------- */
const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;
type Alert = { type: "error" | "success"; message: string } | null;

const ADMIN_ACCOUNT = { email: "admin@ipartydjs.com", password: "Admin1234" };

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  const showAlert = (next: Alert) => {
    setAlert(next);
    window.setTimeout(() => setAlert(null), 4000);
  };

  /* ---------- Validación en tiempo real ---------- */
  const validateField = (field: "email" | "password", value: string) => {
    const result = credentialsSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  // Validación independiente para Email
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (touched.email) validateField("email", email);
  }, [email, touched.email]);

  // Validación independiente para Password
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (touched.password) validateField("password", password);
  }, [password, touched.password]);

  /* ---------- Envío ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const result = credentialsSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as "email" | "password";
        errors[key] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);

    if (email !== ADMIN_ACCOUNT.email || password !== ADMIN_ACCOUNT.password) {
      showAlert({
        type: "error",
        message:
          "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.",
      });
      return;
    }

    setAdminAuthenticated(true);
    setSuccess(true);
    showAlert({
      type: "success",
      message: "Bienvenida de nuevo. Redirigiendo al panel...",
    });

    window.setTimeout(() => navigate("/dashboard/admin"), 900);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-content">
        {alert && (
          <div
            className={`admin-alert admin-alert--${alert.type} fade-up`}
            role="status"
          >
            {alert.message}
          </div>
        )}

        <div className="admin-login-card fade-up">
          <div className="admin-login-badge">
            <LockIcon />
            <span>ACCESO ADMINISTRADOR</span>
          </div>

          <h1 className="admin-login-title">iPartyDJs</h1>
          <p className="admin-login-subtitle">
            Panel de administración interno
          </p>

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-field">
              <label htmlFor="admin-email">Correo electrónico</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({
                    ...prev,
                    email: true,
                  }))
                }
                className={fieldErrors.email ? "is-invalid" : ""}
                placeholder="admin@ipartydjs.com"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Contraseña</label>
              <div className="admin-input-icon">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({
                      ...prev,
                      password: true,
                    }))
                  }
                  className={fieldErrors.password ? "is-invalid" : ""}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-gold admin-submit"
              disabled={submitting || success}
            >
              {submitting
                ? "Verificando..."
                : success
                  ? "¡Bienvenida!"
                  : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="admin-footnote">
          ¿No eres administrador?{" "}
          <Link to="/login">Ir al inicio de sesión de clientes</Link>
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   Iconos inline
--------------------------------------------------- */
function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2C11.06 5.07 11.53 5 12 5c6.4 0 10 7 10 7a17.5 17.5 0 0 1-4 4.6M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.5 9.6a3.2 3.2 0 0 0 4.5 4.5" />
    </svg>
  );
}
