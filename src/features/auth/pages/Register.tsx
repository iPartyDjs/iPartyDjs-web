import { useState } from "react";
import {
    RegisterClientSchema,
    type RegisterClientInput,
} from "@ipartydjs/shared";
import { useNavigate } from "react-router-dom";
import { useRegister } from "@/features/auth/hooks/useAuth";
import Overline from "@/shared/ui/Overline";
import { Button, ButtonForm, Input } from "@/shared/ui";

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
    const navigate = useNavigate();
    const registerMutation = useRegister();

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
    const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
        null,
    );

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
        setServerErrorMessage(null);
    };

    const handleBlur = (field: keyof RegisterClientInput) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setServerErrorMessage(null);

        if (!validation.success) {
            return;
        }

        registerMutation.mutate(form, {
            onSuccess: () => {
                navigate("/login");
            },
            onError: (error: any) => {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    "Ocurrió un error al registrar la cuenta";
                setServerErrorMessage(message);
            },
        });
    };

    return (
        <section className="relative isolate overflow-hidden bg-surface px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
                {/* Header */}
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <Overline children={"Se parte de nosotros"} />
                    </div>

                    <h1 className="font-display text-3xl font-medium text-balance text-cream sm:text-5xl">
                        Registrate y crea una cuenta
                    </h1>
                    <p className="mt-8 font-body text-sm text-pretty text-cream-dim sm:text-base">
                        Regístrate para solicitar y dar seguimiento a tus
                        eventos.
                    </p>
                </div>

                <br />

                {/* Form */}
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Row 1 - Nombre y Apellido */}
                    <div className="form-row">
                        <Input
                            label="Nombre"
                            name="nombre"
                            type="text"
                            placeholder="Tu nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            onBlur={() => handleBlur("nombre")}
                            disabled={registerMutation.isPending}
                            error={showError("nombre") ? errors.nombre : ""}
                            required
                        />
                        <Input
                            label="Apellidos"
                            name="apellido"
                            type="text"
                            placeholder="Tus apellidos"
                            value={form.apellido}
                            onChange={handleChange}
                            onBlur={() => handleBlur("apellido")}
                            disabled={registerMutation.isPending}
                            error={showError("apellido") ? errors.apellido : ""}
                            required
                        />
                    </div>

                    {/* Correo */}

                    <Input
                        label="Correo electrónico"
                        name="email"
                        type="text"
                        placeholder="usuario@ejemplo.com"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur("email")}
                        autoComplete="email"
                        disabled={registerMutation.isPending}
                        error={showError("email") ? errors.email : ""}
                        required
                    />

                    {/* Password */}
                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur("password")}
                        autoComplete="current-password"
                        disabled={registerMutation.isPending}
                        error={showError("password") ? errors.password : ""}
                        required
                    />
                    <div
                        className={`field ${showError("password") ? "has-error" : ""}`}
                    >
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
                    <Input
                        label="Confirmar contraseña"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur("confirmPassword")}
                        disabled={registerMutation.isPending}
                        error={
                            showError("confirmPassword")
                                ? errors.confirmPassword
                                : ""
                        }
                        required
                    />

                    {/* Server error alert */}
                    {serverErrorMessage && (
                        <div className="flex items-center gap-3 border border-red-400/30 bg-red-500/10 px-3 py-4 text-sm text-red-200">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/20 text-xs font-bold text-red-100">
                                !
                            </span>
                            {serverErrorMessage}
                        </div>
                    )}

                    {/* Submit */}
                    <ButtonForm
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full"
                    >
                        {registerMutation.isPending
                            ? "Creando cuenta..."
                            : "Crear mi cuenta"}
                    </ButtonForm>

                    {/* Login link */}
                    <p className="mt-8 text-center text-cream/80">
                        ¿Ya tienes cuenta?{" "}
                        <Button href="/login" variant="outline">
                            Inicia sesión
                        </Button>
                    </p>
                </form>
            </div>
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            >
                <div
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                    className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-gold-dark to-gold opacity-25 sm:left-[calc(50%+36rem)] sm:w-288.75"
                />
            </div>
        </section>
    );
};

export default Register;
