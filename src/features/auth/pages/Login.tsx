import { useState } from "react";
import { LoginSchema, type LoginInput } from "@ipartydjs/shared";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/features/auth/hooks/useAuth";
import axios from "axios";
import { Button, ButtonForm, Input } from "@/shared/ui";
import Overline from "@/shared/ui/Overline";

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
                    message =
                        error.response?.data?.message ||
                        error.message ||
                        message;
                } else if (error instanceof Error) {
                    message = error.message;
                }

                setServerErrorMessage(message);
            },
        });
    };

    return (
        <section className="relative isolate overflow-hidden bg-surface px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56">
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <Overline children={"Bienvenido"} />
                    </div>

                    <h1 className="font-display text-3xl font-medium text-balance text-cream sm:text-5xl">
                        Ingrese a su{" "}
                        <span className="text-gold not-italic">
                            Perfil personal
                        </span>
                    </h1>
                </div>
                <div className="mx-auto">
                    {/* Form */}
                    <form
                        className="space-y-6 p-6 sm:p-8"
                        onSubmit={handleSubmit}
                        noValidate
                    >
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
                            disabled={loginMutation.isPending}
                            error={showError("email") ? errors.email : ""}
                            required
                        />
                        {/* Contraseña */}
                        <Input
                            label="Contraseña"
                            name="password"
                            type="password"
                            placeholder="Tu contraseña"
                            value={form.password}
                            onChange={handleChange}
                            onBlur={() => handleBlur("password")}
                            autoComplete="current-password"
                            disabled={loginMutation.isPending}
                            error={showError("password") ? errors.password : ""}
                            required
                        />

                        {/* Auth error alert */}
                        {serverErrorMessage && (
                            <div className="flex items-center gap-3 border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/20 text-xs font-bold text-red-100">
                                    !
                                </span>
                                {serverErrorMessage}
                            </div>
                        )}

                        {/* Submit */}
                        <ButtonForm
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full"
                        >
                            {loginMutation.isPending
                                ? "Iniciando sesión..."
                                : "Iniciar sesión"}
                        </ButtonForm>
                    </form>

                    {/* Register link */}
                    <div className="mt-8 text-center space-x-12">
                        ¿Aún no tienes cuenta?{" "}
                        <Button href="/register" variant="outline">
                            Regístrate gratis
                        </Button>
                    </div>
                </div>
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

export default Login;
