// src/lib/api/catalogo.ts
import { requestApi } from './client';
import type { JobType } from './types';

export async function obtenerTiposDeEmpleo(): Promise<JobType[]> {
  const lista = await requestApi<JobType[]>({ method: 'GET', path: '/job-types' });
  return Array.isArray(lista) ? lista : [];
}
