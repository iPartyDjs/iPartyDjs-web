import { useState } from "react";
import { LoginSchema, type LoginInput } from "@ipartydjs/shared"; // Asegúrate que el tipo también se importe
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<LoginInput>({
        email: "",
        password: "",
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const [authError, setAuthError] = useState(false);

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
        console.log(
            "touched:",
            touched,
            "submitted:",
            submitted,
            "errors:",
            errors,
        );
        return (touched[field] || submitted) && errors[field];
    };

    // ================================================================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setAuthError(false);
    };

    const handleBlur = (field: keyof LoginInput) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validation.success) {
            return; // No continuar si hay errores de validación
        }

        // Aquí iría tu lógica real de login (API call)
        console.log("Intentando login con:", form);
        navigate("/dashboard"); // Simulación de redirección
        setAuthError(true); // Simulación actual
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
                        className={`field ${showError("email") || authError ? "has-error" : ""}`}
                    >
                        <label htmlFor="email">
                            Correo electrónico{" "}
                            <span className="required">*</span>
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
                        />
                        {showError("email") && !authError && (
                            <span className="error-msg">{errors.correo}</span>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div
                        className={`field ${showError("password") || authError ? "has-error" : ""}`}
                    >
                        <div className="field-top-row">
                            <label htmlFor="password">
                                Contraseña <span className="required">*</span>
                            </label>
                            {/* <a href="/recuperar" className="forgot-link">¿Olvidaste tu contraseña?</a> */}
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
                        />
                        {showError("password") && !authError && (
                            <span className="error-msg">{errors.password}</span>
                        )}
                    </div>

                    {/* Auth error alert */}
                    {authError && (
                        <div className="auth-error">
                            <span className="auth-error-icon">!</span>
                            Correo o contraseña incorrectos
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" className="btn-login">
                        Iniciar sesión
                    </button>
                </form>

                {/* Register link */}
                <p className="register-link">
                    ¿Aún no tienes cuenta?{" "}
                    <a href="/registro" className="link-gold">
                        Regístrate gratis
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
