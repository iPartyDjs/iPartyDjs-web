/* ===== src/features/profile/pages/Profile.tsx ===== */
import { useEffect, useRef, useState } from "react";
import {
    UpdateProfileSchema,
    ChangePasswordSchema,
    type UpdateProfileInput,
    type ChangePasswordInput,
} from "@ipartydjs/shared";
import {
    useProfile,
    useUpdateProfile,
    useChangePassword,
} from "@/features/profile/hooks/useProfile";
import { useAuthStore } from "@/core/stores/auth.store";
import "./profile.css";
import "@/styles/components.css";
import "@/styles/globals.css";
import "@/styles/layouts.css";

/* ---------------------------------------------------
   Tipos
--------------------------------------------------- */
type PasswordForm = ChangePasswordInput;

type ProfileFieldErrors = Partial<Record<keyof UpdateProfileInput, string>>;
type PasswordFieldErrors = Partial<Record<keyof PasswordForm, string>>;

type AlertState = { type: "success" | "error"; message: string } | null;

/* ---------------------------------------------------
   Icons (inline SVG, sin dependencias externas)
--------------------------------------------------- */
const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
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

const CheckCircleIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
    >
        <circle cx="12" cy="12" r="9.2" />
        <path d="M8.2 12.4l2.4 2.4 5.2-5.6" />
    </svg>
);

/* ---------------------------------------------------
   Helpers
--------------------------------------------------- */
const ROLE_LABELS: Record<string, string> = {
    cliente: "Cliente",
    administrador: "Administrador",
    superadministrador: "Superadministrador",
    colaborador_fotografico: "Colaborador fotográfico",
};

function formatMemberSince(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

/* ---------------------------------------------------
   Componente principal
--------------------------------------------------- */
export default function ProfilePage() {
    const { data: user, isLoading } = useProfile();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();
    const role = useAuthStore((state) => state.user?.rol);

    const [profile, setProfile] = useState<UpdateProfileInput>({
        nombre: "",
        apellido: "",
    });
    const [profileErrors, setProfileErrors] = useState<ProfileFieldErrors>({});

    const [passwords, setPasswords] = useState<PasswordForm>({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState<PasswordFieldErrors>(
        {},
    );
    const [visibility, setVisibility] = useState({
        current: false,
        next: false,
        confirm: false,
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [alert, setAlert] = useState<AlertState>(null);

    const alertTimeoutRef = useRef<number | null>(null);

    const showAlert = (state: AlertState) => {
        setAlert(state);
        if (alertTimeoutRef.current)
            window.clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = window.setTimeout(() => setAlert(null), 3500);
    };

    useEffect(() => {
        if (user) {
            setProfile({ nombre: user.nombre, apellido: user.apellido });
        }
    }, [user]);

    /* ---------- Datos personales ---------- */
    const handleProfileField = (
        field: keyof UpdateProfileInput,
        value: string,
    ) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
        if (profileErrors[field]) {
            setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateProfile = (): boolean => {
        const result = UpdateProfileSchema.safeParse(profile);
        if (result.success) {
            setProfileErrors({});
            return true;
        }
        const errors: ProfileFieldErrors = {};
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof UpdateProfileInput;
            if (!errors[field]) errors[field] = issue.message;
        }
        setProfileErrors(errors);
        return false;
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateProfile()) return;
        setSavingProfile(true);
        updateProfile.mutate(profile, {
            onSuccess: () => {
                setSavingProfile(false);
                showAlert({
                    type: "success",
                    message:
                        "Tu información personal se actualizó correctamente.",
                });
            },
            onError: (error) => {
                setSavingProfile(false);
                showAlert({
                    type: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "No se pudo actualizar tu información.",
                });
            },
        });
    };

    /* ---------- Seguridad ---------- */
    const handlePasswordField = (field: keyof PasswordForm, value: string) => {
        setPasswords((prev) => ({ ...prev, [field]: value }));
        if (passwordErrors[field]) {
            setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const toggleVisibility = (field: keyof typeof visibility) => {
        setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePasswords = (): boolean => {
        const result = ChangePasswordSchema.safeParse(passwords);
        if (result.success) {
            setPasswordErrors({});
            return true;
        }
        const errors: PasswordFieldErrors = {};
        for (const issue of result.error.issues) {
            const field = issue.path[0] as keyof PasswordForm;
            if (!errors[field]) errors[field] = issue.message;
        }
        setPasswordErrors(errors);
        return false;
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePasswords()) return;
        setSavingPassword(true);
        changePassword.mutate(passwords, {
            onSuccess: () => {
                setSavingPassword(false);
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
                showAlert({
                    type: "success",
                    message: "Tu contraseña se actualizó correctamente.",
                });
            },
            onError: (error) => {
                setSavingPassword(false);
                showAlert({
                    type: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "No se pudo actualizar tu contraseña.",
                });
            },
        });
    };

    if (isLoading) {
        return <div className="profile-page">Cargando perfil...</div>;
    }

    const roleLabel = role ? (ROLE_LABELS[role] ?? role) : "";
    const memberSince = user ? formatMemberSince(user.created_at) : "";

    return (
        <div className="profile-page">
            {alert && (
                <div
                    className={`profile-alert profile-alert--${alert.type} fade-up`}
                    role="status"
                >
                    <CheckCircleIcon />
                    <span>{alert.message}</span>
                </div>
            )}

            <header className="profile-header fade-up">
                <p className="profile-eyebrow">CUENTA</p>
                <h1 className="profile-title">Mi Perfil</h1>
                <p className="profile-subtitle">
                    Administra tu información personal y tu seguridad.
                </p>
            </header>

            <section className="profile-card profile-summary fade-up">
                <div className="profile-summary-info">
                    <h2>
                        {user?.nombre} {user?.apellido}
                    </h2>
                    {roleLabel && (
                        <span className="profile-badge">{roleLabel}</span>
                    )}
                    {memberSince && (
                        <p className="profile-meta">
                            Miembro desde {memberSince}
                        </p>
                    )}
                </div>
            </section>

            <section className="profile-card fade-up">
                <div className="profile-card-header">
                    <h3>Información personal</h3>
                    <p>
                        Estos datos se usan para contactarte sobre tus eventos y
                        citas.
                    </p>
                </div>

                <form
                    className="profile-form"
                    onSubmit={handleSaveProfile}
                    noValidate
                >
                    <div className="profile-form-grid">
                        <div className="profile-field">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                value={profile.nombre ?? ""}
                                onChange={(e) =>
                                    handleProfileField("nombre", e.target.value)
                                }
                                className={
                                    profileErrors.nombre ? "is-invalid" : ""
                                }
                            />
                            {profileErrors.nombre && (
                                <span className="field-error">
                                    {profileErrors.nombre}
                                </span>
                            )}
                        </div>

                        <div className="profile-field">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                value={profile.apellido ?? ""}
                                onChange={(e) =>
                                    handleProfileField(
                                        "apellido",
                                        e.target.value,
                                    )
                                }
                                className={
                                    profileErrors.apellido ? "is-invalid" : ""
                                }
                            />
                            {profileErrors.apellido && (
                                <span className="field-error">
                                    {profileErrors.apellido}
                                </span>
                            )}
                        </div>

                        <div className="profile-field profile-field--full">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                value={user?.email ?? ""}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="profile-form-actions">
                        <button
                            type="submit"
                            className="btn-gold"
                            disabled={savingProfile}
                        >
                            {savingProfile ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="profile-card fade-up">
                <div className="profile-card-header">
                    <h3>Seguridad</h3>
                    <p>
                        Actualiza tu contraseña de forma periódica para proteger
                        tu cuenta.
                    </p>
                </div>

                <form
                    className="profile-form"
                    onSubmit={handleChangePassword}
                    noValidate
                >
                    <div className="profile-form-grid">
                        <div className="profile-field profile-field--full">
                            <label htmlFor="current-password">
                                Contraseña actual
                            </label>
                            <div className="profile-input-icon">
                                <input
                                    id="current-password"
                                    type={
                                        visibility.current ? "text" : "password"
                                    }
                                    value={passwords.currentPassword}
                                    onChange={(e) =>
                                        handlePasswordField(
                                            "currentPassword",
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        passwordErrors.currentPassword
                                            ? "is-invalid"
                                            : ""
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility("current")}
                                    aria-label="Mostrar u ocultar contraseña actual"
                                >
                                    <EyeIcon open={visibility.current} />
                                </button>
                            </div>
                            {passwordErrors.currentPassword && (
                                <span className="field-error">
                                    {passwordErrors.currentPassword}
                                </span>
                            )}
                        </div>

                        <div className="profile-field">
                            <label htmlFor="new-password">
                                Nueva contraseña
                            </label>
                            <div className="profile-input-icon">
                                <input
                                    id="new-password"
                                    type={visibility.next ? "text" : "password"}
                                    value={passwords.newPassword}
                                    onChange={(e) =>
                                        handlePasswordField(
                                            "newPassword",
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        passwordErrors.newPassword
                                            ? "is-invalid"
                                            : ""
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility("next")}
                                    aria-label="Mostrar u ocultar nueva contraseña"
                                >
                                    <EyeIcon open={visibility.next} />
                                </button>
                            </div>
                            {passwordErrors.newPassword && (
                                <span className="field-error">
                                    {passwordErrors.newPassword}
                                </span>
                            )}
                        </div>

                        <div className="profile-field">
                            <label htmlFor="confirm-password">
                                Confirmar contraseña
                            </label>
                            <div className="profile-input-icon">
                                <input
                                    id="confirm-password"
                                    type={
                                        visibility.confirm ? "text" : "password"
                                    }
                                    value={passwords.confirmNewPassword}
                                    onChange={(e) =>
                                        handlePasswordField(
                                            "confirmNewPassword",
                                            e.target.value,
                                        )
                                    }
                                    className={
                                        passwordErrors.confirmNewPassword
                                            ? "is-invalid"
                                            : ""
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility("confirm")}
                                    aria-label="Mostrar u ocultar confirmación de contraseña"
                                >
                                    <EyeIcon open={visibility.confirm} />
                                </button>
                            </div>
                            {passwordErrors.confirmNewPassword && (
                                <span className="field-error">
                                    {passwordErrors.confirmNewPassword}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="profile-form-actions">
                        <button
                            type="submit"
                            className="btn-outline-gold"
                            disabled={savingPassword}
                        >
                            {savingPassword
                                ? "Actualizando..."
                                : "Actualizar contraseña"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
