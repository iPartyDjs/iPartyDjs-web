import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';

import { z } from 'zod';
import './ReviewForm.css';

const EVENT_TYPES = ['Boda', 'XV años', 'Cumpleaños', 'Empresarial', 'Otro'] as const;

const RATING_LABELS: Record<number, string> = {
  1: 'Regular',
  2: 'Buena',
  3: 'Muy buena',
  4: 'Excelente',
  5: 'Perfecta',
};

const reviewSchema = z.object({
  rating: z.number().min(1, 'Selecciona una calificación'),
  eventType: z.enum(EVENT_TYPES, { message: 'Selecciona el tipo de evento' }),
  names: z.string().trim().min(2, 'Ingresa tu nombre o el de la pareja'),
  eventDate: z.string().min(1, 'Selecciona la fecha del evento'),
  venue: z.string().trim().min(2, 'Ingresa el lugar del evento'),
  testimonial: z
    .string()
    .trim()
    .min(20, 'Cuéntanos un poco más (mínimo 20 caracteres)')
    .max(400, 'Máximo 400 caracteres'),
  consent: z.literal(true, {
    message: 'Debes autorizar la publicación de tu reseña',
  }),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  /** Callback invocado con los datos validados al enviar el formulario. */
  onSubmit?: (data: ReviewFormData, photo: File | null) => void | Promise<void>;
}

type FormErrors = Partial<Record<keyof ReviewFormData, string>>;

const TESTIMONIAL_MAX = 400;

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [eventType, setEventType] = useState<typeof EVENT_TYPES[number] | ''>('');
  const [names, setNames] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayRating = hoverRating || rating;

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoName(file ? file.name : '');
  };

  const validate = () => {
    const result = reviewSchema.safeParse({
      rating,
      eventType,
      names,
      eventDate,
      venue,
      testimonial,
      consent,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ReviewFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }

    setErrors({});
    return result.data;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;

    try {
      setSubmitting(true);
      await onSubmit?.(data, photo);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="review-page">
        <div className="review-wrap">
          <div className="review-card">
            <div className="review-success">
              <div className="review-success-check">✓</div>
              <h2>Gracias por tu historia</h2>
              <p>
                Tu reseña fue enviada y será revisada por nuestro equipo antes de
                publicarse. Nos encantó ser parte de tu celebración.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page">
      <div className="review-wrap">
        <div className="review-eyebrow">Comparte tu experiencia</div>
        <h1 className="review-title">
          Tu historia
          <br />
          <em>merece contarse</em>
        </h1>
        <p className="review-subtext">
          Gracias por confiar en nosotros para tu evento. Cuéntanos cómo fue tu
          experiencia — tu reseña ayuda a otras parejas a soñar en grande.
        </p>

        <div className="review-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Calificación */}
            <div className="review-field">
              <label>Calificación general</label>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span
                    key={v}
                    className={`review-star ${v <= displayRating ? 'filled' : ''}`}
                    onClick={() => setRating(v)}
                    onMouseEnter={() => setHoverRating(v)}
                    onMouseLeave={() => setHoverRating(0)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${v} estrellas`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setRating(v);
                    }}
                  >
                    ★
                  </span>
                ))}
                {displayRating > 0 && (
                  <span className="review-rating-word">
                    {RATING_LABELS[displayRating]}
                  </span>
                )}
              </div>
              {errors.rating && <span className="review-error">{errors.rating}</span>}
            </div>

            {/* Tipo de evento */}
            <div className="review-field">
              <label>Tipo de evento</label>
              <div className="review-chips">
                {EVENT_TYPES.map((type) => (
                  <div
                    key={type}
                    className={`review-chip ${eventType === type ? 'active' : ''}`}
                    onClick={() => setEventType(type)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setEventType(type);
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
              {errors.eventType && (
                <span className="review-error">{errors.eventType}</span>
              )}
            </div>

            {/* Nombre y fecha */}
            <div className="review-row2">
              <div className="review-field">
                <label>Nombre(s)</label>
                <input
                  type="text"
                  placeholder="Ej. Mariana &amp; Diego"
                  value={names}
                  onChange={(e) => setNames(e.target.value)}
                />
                {errors.names && <span className="review-error">{errors.names}</span>}
              </div>
              <div className="review-field">
                <label>Fecha del evento</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                {errors.eventDate && (
                  <span className="review-error">{errors.eventDate}</span>
                )}
              </div>
            </div>

            {/* Lugar */}
            <div className="review-field">
              <label>Lugar del evento</label>
              <input
                type="text"
                placeholder="Ej. Hacienda San Gabriel"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
              {errors.venue && <span className="review-error">{errors.venue}</span>}
            </div>

            {/* Testimonio */}
            <div className="review-field">
              <label>Tu testimonio</label>
              <textarea
                maxLength={TESTIMONIAL_MAX}
                placeholder="Cuéntanos qué hizo especial tu celebración con iPartyDJs..."
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
              />
              <div className="review-counter">
                {testimonial.length}/{TESTIMONIAL_MAX}
              </div>
              {errors.testimonial && (
                <span className="review-error">{errors.testimonial}</span>
              )}
            </div>

            {/* Foto */}
            <div className="review-field">
              <label>
                Foto del evento <span className="review-hint">(opcional)</span>
              </label>
              <div
                className="review-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="review-dropzone-icon">⤒</div>
                <p>
                  {photoName ? (
                    photoName
                  ) : (
                    <>
                      <span>Sube una foto</span> o arrástrala aquí
                    </>
                  )}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {/* Consentimiento */}
            <label className="review-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className="review-consent-txt">
                Autorizo a iPartyDJs a publicar mi reseña y foto en el sitio web y
                redes sociales de la empresa.
              </span>
            </label>
            {errors.consent && <span className="review-error">{errors.consent}</span>}

            <button type="submit" className="review-btn-submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar mi reseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
