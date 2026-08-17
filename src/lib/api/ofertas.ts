// src/lib/api/ofertas.ts
import { apiClient, desenvolver } from './client';
import type { ActualizarAplicacionInput, Application, Offer, OfferInput } from './types';

// POST /offers — requiere perfil completo, paymentId aprobado y foto.
export async function publicarOferta(input: OfferInput): Promise<Offer> {
  const { data } = await apiClient.post('/offers', input);
  return desenvolver<Offer>(data);
}

// GET /me/offers — HU "Mis ofertas publicadas"
export async function obtenerMisOfertas(): Promise<Offer[]> {
  const { data } = await apiClient.get('/me/offers');
  const lista = desenvolver<Offer[]>(data);
  return Array.isArray(lista) ? lista : [];
}

export async function obtenerOferta(id: string): Promise<Offer> {
  const { data } = await apiClient.get(`/offers/${id}`);
  return desenvolver<Offer>(data);
}

// POST /offers/{id}/deactivate — solo el dueño
export async function desactivarOferta(id: string): Promise<void> {
  await apiClient.post(`/offers/${id}/deactivate`);
}

// GET /offers/{id}/applications — aplicantes de una oferta (solo dueño)
export async function obtenerAplicantes(ofertaId: string): Promise<Application[]> {
  const { data } = await apiClient.get(`/offers/${ofertaId}/applications`);
  const lista = desenvolver<Application[]>(data);
  return Array.isArray(lista) ? lista : [];
}

// PATCH /applications/{id} — calificar / descartar / finalista / ganador.
// Al poner status='winner' el API crea automáticamente un contrato.
export async function actualizarAplicacion(
  aplicacionId: string,
  cambios: ActualizarAplicacionInput
): Promise<Application> {
  const { data } = await apiClient.patch(`/applications/${aplicacionId}`, cambios);
  return desenvolver<Application>(data);
}
