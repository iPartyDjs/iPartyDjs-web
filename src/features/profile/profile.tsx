import React, { useRef, useState } from "react";
import "./Profile.css";

/* ---------------------------------------------------
   Tipos
--------------------------------------------------- */
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  clientType: string;
  memberSince: string;
  avatarUrl: string | null;
}

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

interface NotificationPrefs {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  eventReminders: boolean;
  promotions: boolean;
}

type AlertState = { type: "success" | "error"; message: string } | null;

/* ---------------------------------------------------
   Icons (inline SVG, sin dependencias externas)
--------------------------------------------------- */
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 8h3.2l1.4-2h6.8l1.4 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="14" r="3.2" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2C11.06 5.07 11.53 5 12 5c6.4 0 10 7 10 7a17.5 17.5 0 0 1-4 4.6M6.6 6.6C4 8.3 2 12 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.5 9.6a3.2 3.2 0 0 0 4.5 4.5" />
    </svg>
  );

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9.2" />
    <path d="M8.2 12.4l2.4 2.4 5.2-5.6" />
  </svg>
);

/* ---------------------------------------------------
   Validaciones
--------------------------------------------------- */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s()-]{7,15}$/;

/* ---------------------------------------------------
   Componente principal
--------------------------------------------------- */
export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: "Maria",
    lastName: "Gonzalez",
    email: "maria.gonzalez@email.com",
    phone: "+52 777 123 4567",
    city: "Cuernavaca, Morelos",
    clientType: "Cliente Premium",
    memberSince: "Marzo 2024",
    avatarUrl: null,
  });

  const [profileErrors, setProfileErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  const [passwords, setPasswords] = useState<PasswordForm>({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [visibility, setVisibility] = useState({ current: false, next: false, confirm: false });

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    whatsappNotifications: true,
    eventReminders: true,
    promotions: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const alertTimeoutRef = useRef<number | null>(null);

  const showAlert = (state: AlertState) => {
    setAlert(state);
    if (alertTimeoutRef.current) window.clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = window.setTimeout(() => setAlert(null), 3500);
  };


  /* ---------- Avatar ---------- */
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert({ type: "error", message: "Selecciona un archivo de imagen válido." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  /* ---------- Datos personales ---------- */
  const handleProfileField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateProfile = (): boolean => {
    const errors: Partial<Record<keyof ProfileData, string>> = {};
    if (!profile.firstName.trim()) errors.firstName = "Ingresa tu nombre.";
    if (!profile.lastName.trim()) errors.lastName = "Ingresa tu apellido.";
    if (!EMAIL_REGEX.test(profile.email)) errors.email = "Ingresa un correo válido.";
    if (!PHONE_REGEX.test(profile.phone)) errors.phone = "Ingresa un teléfono válido.";
    if (!profile.city.trim()) errors.city = "Ingresa tu ciudad.";
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSavingProfile(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSavingProfile(false);
    showAlert({ type: "success", message: "Tu información personal se actualizó correctamente." });
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
    const errors: Partial<Record<keyof PasswordForm, string>> = {};
    if (!passwords.current) errors.current = "Ingresa tu contraseña actual.";
    if (passwords.next.length < 8) errors.next = "Mínimo 8 caracteres.";
    if (passwords.confirm !== passwords.next) errors.confirm = "Las contraseñas no coinciden.";
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSavingPassword(false);
    setPasswords({ current: "", next: "", confirm: "" });
    showAlert({ type: "success", message: "Tu contraseña se actualizó correctamente." });
  };

  /* ---------- Preferencias ---------- */
  const handleTogglePref = (field: keyof NotificationPrefs) => {
    setPrefs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="profile-page">
      {alert && (
        <div className={`profile-alert profile-alert--${alert.type} fade-up`} role="status">
          <CheckCircleIcon />
          <span>{alert.message}</span>
        </div>
      )}

      <header className="profile-header fade-up">
        <p className="profile-eyebrow">CUENTA</p>
        <h1 className="profile-title">Mi Perfil</h1>
        <p className="profile-subtitle">
          Administra tu información personal, tu seguridad y tus preferencias de contacto.
        </p>
      </header>

      {/* -------- Avatar + resumen -------- */}
      <section className="profile-card profile-summary fade-up">
        <div className="profile-avatar-wrap">
          <button
            type="button"
            className="profile-avatar"
            onClick={handleAvatarClick}
            aria-label="Cambiar foto de perfil"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Foto de perfil" />
            ) : (
              <span className="profile-avatar-initials">{initials}</span>
            )}
            <span className="profile-avatar-overlay">
              <CameraIcon />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="profile-avatar-input"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="profile-summary-info">
          <h2>
            {profile.firstName} {profile.lastName}
          </h2>
          <span className="profile-badge">{profile.clientType}</span>
          <p className="profile-meta">Miembro desde {profile.memberSince}</p>
        </div>
      </section>

      {/* -------- Información personal -------- */}
      <section className="profile-card fade-up">
        <div className="profile-card-header">
          <h3>Información personal</h3>
          <p>Estos datos se usan para contactarte sobre tus eventos y citas.</p>
        </div>

        <form className="profile-form" onSubmit={handleSaveProfile} noValidate>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                type="text"
                value={profile.firstName}
                onChange={(e) => handleProfileField("firstName", e.target.value)}
                className={profileErrors.firstName ? "is-invalid" : ""}
              />
              {profileErrors.firstName && <span className="field-error">{profileErrors.firstName}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                type="text"
                value={profile.lastName}
                onChange={(e) => handleProfileField("lastName", e.target.value)}
                className={profileErrors.lastName ? "is-invalid" : ""}
              />
              {profileErrors.lastName && <span className="field-error">{profileErrors.lastName}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileField("email", e.target.value)}
                className={profileErrors.email ? "is-invalid" : ""}
              />
              {profileErrors.email && <span className="field-error">{profileErrors.email}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileField("phone", e.target.value)}
                className={profileErrors.phone ? "is-invalid" : ""}
              />
              {profileErrors.phone && <span className="field-error">{profileErrors.phone}</span>}
            </div>

            <div className="profile-field profile-field--full">
              <label htmlFor="city">Ciudad</label>
              <input
                id="city"
                type="text"
                value={profile.city}
                onChange={(e) => handleProfileField("city", e.target.value)}
                className={profileErrors.city ? "is-invalid" : ""}
              />
              {profileErrors.city && <span className="field-error">{profileErrors.city}</span>}
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="btn-gold" disabled={savingProfile}>
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>

      {/* -------- Seguridad -------- */}
      <section className="profile-card fade-up">
        <div className="profile-card-header">
          <h3>Seguridad</h3>
          <p>Actualiza tu contraseña de forma periódica para proteger tu cuenta.</p>
        </div>

        <form className="profile-form" onSubmit={handleChangePassword} noValidate>
          <div className="profile-form-grid">
            <div className="profile-field profile-field--full">
              <label htmlFor="current-password">Contraseña actual</label>
              <div className="profile-input-icon">
                <input
                  id="current-password"
                  type={visibility.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => handlePasswordField("current", e.target.value)}
                  className={passwordErrors.current ? "is-invalid" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("current")}
                  aria-label="Mostrar u ocultar contraseña actual"
                >
                  <EyeIcon open={visibility.current} />
                </button>
              </div>
              {passwordErrors.current && <span className="field-error">{passwordErrors.current}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="new-password">Nueva contraseña</label>
              <div className="profile-input-icon">
                <input
                  id="new-password"
                  type={visibility.next ? "text" : "password"}
                  value={passwords.next}
                  onChange={(e) => handlePasswordField("next", e.target.value)}
                  className={passwordErrors.next ? "is-invalid" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("next")}
                  aria-label="Mostrar u ocultar nueva contraseña"
                >
                  <EyeIcon open={visibility.next} />
                </button>
              </div>
              {passwordErrors.next && <span className="field-error">{passwordErrors.next}</span>}
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-password">Confirmar contraseña</label>
              <div className="profile-input-icon">
                <input
                  id="confirm-password"
                  type={visibility.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordField("confirm", e.target.value)}
                  className={passwordErrors.confirm ? "is-invalid" : ""}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("confirm")}
                  aria-label="Mostrar u ocultar confirmación de contraseña"
                >
                  <EyeIcon open={visibility.confirm} />
                </button>
              </div>
              {passwordErrors.confirm && <span className="field-error">{passwordErrors.confirm}</span>}
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="btn-outline-gold" disabled={savingPassword}>
              {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </div>
        </form>
      </section>

      {/* -------- Preferencias -------- */}
      <section className="profile-card fade-up">
        <div className="profile-card-header">
          <h3>Preferencias de notificación</h3>
          <p>Elige cómo quieres que te avisemos sobre tus solicitudes y citas.</p>
        </div>

        <div className="profile-toggle-list">
          <ToggleRow
            label="Notificaciones por correo"
            description="Confirmaciones y recordatorios de tus eventos."
            checked={prefs.emailNotifications}
            onChange={() => handleTogglePref("emailNotifications")}
          />
          <ToggleRow
            label="Notificaciones por WhatsApp"
            description="Avisos rápidos sobre el estado de tu solicitud."
            checked={prefs.whatsappNotifications}
            onChange={() => handleTogglePref("whatsappNotifications")}
          />
          <ToggleRow
            label="Recordatorios de citas"
            description="Te avisamos con anticipación antes de cada videollamada."
            checked={prefs.eventReminders}
            onChange={() => handleTogglePref("eventReminders")}
          />
          <ToggleRow
            label="Promociones y novedades"
            description="Ofertas especiales y noticias de iPartyDJs."
            checked={prefs.promotions}
            onChange={() => handleTogglePref("promotions")}
          />
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------
   Subcomponente: fila de toggle
--------------------------------------------------- */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-row">
      <div>
        <p className="toggle-row-label">{label}</p>
        <p className="toggle-row-description">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`toggle-switch ${checked ? "is-on" : ""}`}
        onClick={onChange}
      >
        <span className="toggle-switch-thumb" />
      </button>
    </div>
  );
}
