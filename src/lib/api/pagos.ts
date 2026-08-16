// src/lib/api/pagos.ts
// POST /payments: cobro simulado de 1 USD para publicar una oferta.
// Tarjeta de prueba aprobada: 4242424242424242. Rechazada: 4000000000000002.
// GET /me/payments: historial (HU "Mis pagos").

import { apiClient, desenvolver } from './client';
import type { CardInput, Payment } from './types';

export async function cobrarPago(tarjeta: CardInput): Promise<Payment> {
  const { data } = await apiClient.post('/payments', tarjeta);
  return desenvolver<Payment>(data);
}

export async function obtenerMisPagos(): Promise<Payment[]> {
  const { data } = await apiClient.get('/me/payments');
  const lista = desenvolver<Payment[]>(data);
  return Array.isArray(lista) ? lista : [];
}
