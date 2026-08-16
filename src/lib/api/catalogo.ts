// src/lib/api/catalogo.ts
import { apiClient, desenvolver } from './client';
import type { JobType } from './types';

export async function obtenerTiposDeEmpleo(): Promise<JobType[]> {
  const { data } = await apiClient.get('/job-types');
  const lista = desenvolver<JobType[]>(data);
  return Array.isArray(lista) ? lista : [];
}
