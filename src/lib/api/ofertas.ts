// src/lib/api/ofertas.ts
import { requestApi } from './client';
import type { ActualizarAplicacionInput, Application, Offer, OfferInput } from './types';

// POST /offers — requiere perfil completo, paymentId aprobado y foto.
export async function publicarOferta(input: OfferInput): Promise<Offer> {
  return requestApi<Offer>({ method: 'POST', path: '/offers', data: input });
}

// GET /me/offers — HU "Mis ofertas publicadas"
export async function obtenerMisOfertas(): Promise<Offer[]> {
  const lista = await requestApi<Offer[]>({ method: 'GET', path: '/me/offers' });
  return Array.isArray(lista) ? lista : [];
}

export async function obtenerOferta(id: string): Promise<Offer> {
  return requestApi<Offer>({ method: 'GET', path: `/offers/${id}` });
}

// POST /offers/{id}/deactivate — solo el dueño
export async function desactivarOferta(id: string): Promise<void> {
  await requestApi({ method: 'POST', path: `/offers/${id}/deactivate` });
}

// GET /offers/{id}/applications — aplicantes de una oferta (solo dueño)
export async function obtenerAplicantes(ofertaId: string): Promise<Application[]> {
  const lista = await requestApi<Application[]>({
    method: 'GET',
    path: `/offers/${ofertaId}/applications`,
  });
  return Array.isArray(lista) ? lista : [];
}

// PATCH /applications/{id} — calificar / descartar / finalista / ganador.
// Al poner status='winner' el API crea automáticamente un contrato.
export async function actualizarAplicacion(
  aplicacionId: string,
  cambios: ActualizarAplicacionInput
): Promise<Application> {
  return requestApi<Application>({
    method: 'PATCH',
    path: `/applications/${aplicacionId}`,
    data: cambios,
  });
}
