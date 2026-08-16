// src/lib/schemas/oferta-schema.ts
import { z } from 'zod';

export const ofertaSchema = z.object({
  jobTypeKey: z.string().min(1, 'Selecciona un tipo de empleo'),
  contractType: z.enum(['temporal', 'fijo', 'horas'], {
    message: 'Selecciona un tipo de contrato',
  }),
  description: z.string().trim().min(10, 'Describe el empleo (mínimo 10 caracteres)'),
  address: z.string().trim().min(1, 'La dirección es obligatoria'),
  // La URL de la foto se llena sola al subir la imagen — el usuario nunca
  // la escribe a mano, pero zod la exige para bloquear el envío sin foto
  // (criterio de aceptación: "bloquear la publicación si no existe la
  // imagen obligatoria").
  photoUrl: z.string().min(1, 'La foto es obligatoria'),
  deadline: z.string().optional().or(z.literal('')),
  cardNumber: z.string().refine((v) => /^\d{13,19}$/.test(v), 'Número de tarjeta inválido'),
  cvv: z.string().refine((v) => /^\d{3,4}$/.test(v), 'CVV inválido'),
  expMonth: z.string().refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 12;
  }, 'Mes inválido (1-12)'),
  expYear: z.string().refine((v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= new Date().getFullYear();
  }, 'Año inválido'),
  cardholder: z.string().optional().or(z.literal('')),
});

export type OfertaFormValues = z.infer<typeof ofertaSchema>;
