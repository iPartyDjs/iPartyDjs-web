import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { isAxiosError } from "axios";
import { LoginSchema } from "@ipartydjs/shared";
import { apiClient } from "../../../core/api/client";
import { useAuthStore } from "../../../core/stores/auth.store";
import "./AdminLogin.css";

type LoginInput = z.infer<typeof LoginSchema>;
type FieldErrors = Partial<Record<"email" | "password", string>>;
type Alert = { type: "error" | "success"; message: string } | null;

interface LoginResponseData {
  token: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  const showAlert = (next: Alert) => {
    setAlert(next);
    window.setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = LoginSchema.safeParse({ email, password });
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
    try {
      const { data } = await apiClient.post<{ data: LoginResponseData }>(
        "/auth/login",
        result.data satisfies LoginInput,
      );

      const { token, usuario } = data.data;
      if (!["administrador", "superadministrador"].includes(usuario.rol)) {
        showAlert({
          type: "error",
          message: "Esta cuenta no tiene acceso al panel de administración.",
        });
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setAuth(token, usuario as unknown as Parameters<typeof setAuth>[1]);

      navigate("/admin/dashboard");
    } catch (error) {
      let message = "No pudimos iniciar sesión. Intenta de nuevo.";
      if (isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          message =
            "Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.";
        } else if (error.response?.status === 429) {
          message =
            "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
        }
      }
      showAlert({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
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

            <div className="admin-form-row">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recordar este dispositivo</span>
              </label>
              <a href="#" className="admin-link">
                ¿Olvidaste tu contraseña?
              </a>
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
          <a href="#">Ir al inicio de sesión de clientes</a>
        </p>
      </div>
    </div>
  );
}

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
