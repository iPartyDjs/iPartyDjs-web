import { useState } from "react";
import "@/styles/legacy/Register.css";
import {
    RegisterClientSchema,
    type RegisterClientInput,
} from "@ipartydjs/shared";

type PasswordStrength = "weak" | "medium" | "strong" | "";

const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return "";
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return "weak";
    if (score <= 3) return "medium";
    return "strong";
};

const strengthLabel: Record<PasswordStrength, string> = {
    weak: "Seguridad baja · Usa mayúsculas y números",
    medium: "Seguridad media · Añade símbolos para mejorarla",
    strong: "Contraseña segura",
    "": "",
};

const strengthColor: Record<PasswordStrength, string> = {
    weak: "#e05252",
    medium: "#C9A84C",
    strong: "#4caf7d",
    "": "transparent",
};

const Register = () => {
    const [form, setForm] = useState<RegisterClientInput>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState<
        Record<keyof RegisterClientInput, boolean>
    >({
        nombre: false,
        apellido: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const [submitted, setSubmitted] = useState(false);

    const passwordStrength = getPasswordStrength(form.password);

    // ====================== VALIDACIÓN CON ZOD ======================
    const validation = RegisterClientSchema.safeParse(form);

    const errors = validation.success
        ? {}
        : Object.fromEntries(
              validation.error.issues.map((issue) => [
                  issue.path[0] as keyof RegisterClientInput,
                  issue.message,
              ]),
          );
    // ================================================================

    const showError = (field: keyof RegisterClientInput) =>
        (touched[field] || submitted) && !!errors[field];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (field: keyof RegisterClientInput) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!validation.success) {
            return;
        }

        // Aquí irá la llamada real al backend
        console.log("Datos de registro:", form);
        alert("¡Cuenta creada exitosamente! (Simulación)");
    };

    return (
        <div className="register-page">
            <div className="register-card">
                {/* Header */}
                <div className="register-header">
                    <span className="register-eyebrow">NUEVO USUARIO</span>
                    <h1 className="register-title">Crear cuenta</h1>
                    <p className="register-subtitle">
                        Regístrate para solicitar y dar seguimiento a tus
                        eventos.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="step-indicator">
                    <div className="step active" />
                    <div className="step active" />
                    <div className="step" />
                </div>

                {/* Form */}
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Row 1 - Nombre y Apellido */}
                    <div className="form-row">
                        <div
                            className={`field ${showError("nombre") ? "has-error" : ""}`}
                        >
                            <label htmlFor="nombre">
                                Nombre <span className="required">*</span>
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="María"
                                value={form.nombre}
                                onChange={handleChange}
                                onBlur={() => handleBlur("nombre")}
                            />
                            {showError("nombre") && (
                                <span className="error-msg">
                                    {errors.nombre}
                                </span>
                            )}
                        </div>

                        <div
                            className={`field ${showError("apellido") ? "has-error" : ""}`}
                        >
                            <label htmlFor="apellido">
                                Apellido <span className="required">*</span>
                            </label>
                            <input
                                id="apellido"
                                name="apellido"
                                type="text"
                                placeholder="González"
                                value={form.apellido}
                                onChange={handleChange}
                                onBlur={() => handleBlur("apellido")}
                            />
                            {showError("apellido") && (
                                <span className="error-msg">
                                    {errors.apellido}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Correo */}
                    <div
                        className={`field ${showError("email") ? "has-error" : ""}`}
                    >
                        <label htmlFor="email">
                            Correo electrónico{" "}
                            <span className="required">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="maria.gonzalez@gmail.com"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={() => handleBlur("email")}
                        />
                        {showError("email") && (
                            <span className="error-msg">{errors.email}</span>
                        )}
                    </div>

                    {/* Password */}
                    <div
                        className={`field ${showError("password") ? "has-error" : ""}`}
                    >
                        <label htmlFor="password">
                            Contraseña <span className="required">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                        />
                        {form.password && (
                            <div className="strength-wrapper">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${passwordStrength === "weak" ? 33 : passwordStrength === "medium" ? 66 : 100}%`,
                                            background:
                                                strengthColor[passwordStrength],
                                        }}
                                    />
                                </div>
                                <span
                                    className="strength-label"
                                    style={{
                                        color: strengthColor[passwordStrength],
                                    }}
                                >
                                    {strengthLabel[passwordStrength]}
                                </span>
                            </div>
                        )}
                        {showError("password") && (
                            <span className="error-msg">{errors.password}</span>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div
                        className={`field ${showError("confirmPassword") ? "has-error" : ""}`}
                    >
                        <label htmlFor="confirmPassword">
                            Confirmar contraseña{" "}
                            <span className="required">*</span>
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => handleBlur("confirmPassword")}
                        />
                        {showError("confirmPassword") && (
                            <span className="error-msg">
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-register">
                        Crear mi cuenta
                    </button>

                    {/* Login link */}
                    <p className="login-link">
                        ¿Ya tienes cuenta?{" "}
                        <a href="/login" className="link-gold">
                            Inicia sesión
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
