// src/lib/api/types.ts
// Tipos basados en openapi.yaml (Ocupa2 API v1.0.0).
//
// OJO: el spec define con precisión los REQUEST bodies (OfferInput, etc.)
// pero varias respuestas solo dicen "Lista de X" en prosa, sin $ref a un
// schema formal (job-types, /offers/{id}/applications, /me/payments). Esos
// tipos son mi mejor inferencia a partir de la descripción — si al probar
// contra la API real algún campo se llama distinto, el ajuste queda
// localizado aquí, no desperdigado por las pantallas.

export type ContractType = 'temporal' | 'fijo' | 'horas';
export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'check';
export type ApplicationStatus = 'applied' | 'discarded' | 'finalist' | 'winner';

export interface CustomField {
  key: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[];
}

// Respuesta de GET /job-types — no documentada formalmente en el spec.
// Se asume esta forma (tipo de trabajo + sus campos personalizados, ya que
// el módulo debe "construir el formulario de publicación dinámicamente").
export interface JobType {
  key: string;
  name: string;
  customFields?: CustomField[];
}

// Pregunta que el publicador agrega al crear la oferta (no confundir con
// CustomField del tipo de empleo — esta la define el publicador libremente).
export interface OfferQuestionInput {
  label: string;
  type: 'text' | 'date' | 'select' | 'check';
  required?: boolean;
  options?: string[];
}

export interface OfferInput {
  jobTypeKey: string;
  contractType: ContractType;
  description: string;
  address: string;
  photo: string; // URL devuelta por POST /uploads
  paymentId: string; // id de un pago aprobado en POST /payments
  location?: { lat: number; lng: number };
  payment: { amount: number; currency: string };
  deadline?: string; // YYYY-MM-DD
  customAnswers?: Record<string, unknown>;
  questions?: OfferQuestionInput[];
}

// Respuesta de POST /offers y GET /me/offers — id + eco de los campos
// enviados. `active` se infiere del endpoint /offers/{id}/deactivate.
export interface Offer {
  id: string;
  jobTypeKey: string;
  contractType: ContractType;
  description: string;
  address: string;
  photo: string;
  location?: { lat: number; lng: number };
  payment: { amount: number; currency: string };
  deadline?: string;
  customAnswers?: Record<string, unknown>;
  questions?: OfferQuestionInput[];
  active?: boolean;
  createdAt?: string;
  applicationsCount?: number;
  likesCount?: number;
}

// Respuesta de POST /payments.
export interface Payment {
  id: string;
  amount?: number;
  currency?: string;
  status?: 'approved' | 'rejected' | string;
  createdAt?: string;
}

export interface CardInput {
  cardNumber: string;
  cvv: string;
  expMonth: number;
  expYear: number;
  cardholder?: string;
}

// Respuesta de GET /offers/{id}/applications — "aplicantes con su identidad".
// Se asume que trae los datos del aplicante embebidos (applicant).
export interface Application {
  id: string;
  offerId: string;
  applicantId?: string;
  applicant?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    nombre?: string;
    email?: string;
  };
  comment: string;
  answers?: { questionId?: string; value: unknown }[];
  rating?: number;
  status: ApplicationStatus;
  createdAt?: string;
}

export interface ActualizarAplicacionInput {
  rating?: number;
  status?: ApplicationStatus;
  salary?: number;
  currency?: string;
  startDate?: string;
  duration?: string;
}
