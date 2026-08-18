// src/lib/api/pagos.ts
// POST /payments: cobro simulado de 1 USD para publicar una oferta.
// Tarjeta de prueba aprobada: 4242424242424242. Rechazada: 4000000000000002.
// GET /me/payments: historial (HU "Mis pagos").

import { requestApi } from './client';
import type { CardInput, Payment } from './types';

export async function cobrarPago(tarjeta: CardInput): Promise<Payment> {
  return requestApi<Payment>({ method: 'POST', path: '/payments', data: tarjeta });
}

export async function obtenerMisPagos(): Promise<Payment[]> {
  const lista = await requestApi<Payment[]>({ method: 'GET', path: '/me/payments' });
  return Array.isArray(lista) ? lista : [];
}
