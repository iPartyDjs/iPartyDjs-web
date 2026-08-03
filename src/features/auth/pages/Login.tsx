import { useState } from "react";
import { LoginSchema, type LoginInput } from "@ipartydjs/shared";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks/useAuth";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [form, setForm] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );

  // ====================== VALIDACIÓN CON ZOD ======================
  const validation = LoginSchema.safeParse(form);

  const errors = validation.success
    ? {}
    : Object.fromEntries(
        validation.error.issues.map((issue) => [
          issue.path[0] as keyof LoginInput,
          issue.message,
        ]),
      );

  const showError = (field: keyof LoginInput) => {
    return (touched[field] || submitted) && !!errors[field];
  };

  // ================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setServerErrorMessage(null);
  };

  const handleBlur = (field: keyof LoginInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerErrorMessage(null);

    if (!validation.success) {
      return;
    }

    loginMutation.mutate(form, {
      onSuccess: () => {
        navigate("/dashboard");
      },
      onError: (error: unknown) => {
        let message = "Correo o contraseña incorrectos";

        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || error.message || message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        setServerErrorMessage(message);
      },
    });
  };

  return (
    <div className="login-page">
      <div className="hero-bg">
        <div className="hero-gradient" />
        <div className="hero-grid" />
      </div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <span className="login-eyebrow">Bienvenido</span>
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">
            Ingresa tus datos para acceder a tu panel personal.
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Correo */}
          <div
            className={`field ${showError("email") || serverErrorMessage ? "has-error" : ""}`}
          >
            <label htmlFor="email">
              Correo electrónico <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              autoComplete="email"
              disabled={loginMutation.isPending}
            />
            {showError("email") && (
              <span className="error-msg">{errors.email}</span>
            )}
          </div>

          {/* Contraseña */}
          <div
            className={`field ${showError("password") || serverErrorMessage ? "has-error" : ""}`}
          >
            <div className="field-top-row">
              <label htmlFor="password">
                Contraseña <span className="required">*</span>
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              autoComplete="current-password"
              disabled={loginMutation.isPending}
            />
            {showError("password") && (
              <span className="error-msg">{errors.password}</span>
            )}
          </div>

          {/* Auth error alert */}
          {serverErrorMessage && (
            <div className="auth-error">
              <span className="auth-error-icon">!</span>
              {serverErrorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-login"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Register link */}
        <p className="register-link">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/registro" className="link-gold">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
