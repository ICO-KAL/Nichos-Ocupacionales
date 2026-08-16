// src/lib/api/uploads.ts
// POST /uploads: envía la imagen en base64 (o data URI) en el campo `image`.
// Devuelve la URL pública que luego va en OfferInput.photo.

import { apiClient, desenvolver } from './client';

interface RespuestaUpload {
  key: string;
  url: string;
  mime: string;
  size: number;
}

export async function subirImagen(base64OuDataUri: string, filename?: string): Promise<string> {
  const { data } = await apiClient.post('/uploads', { image: base64OuDataUri, filename });
  const resultado = desenvolver<RespuestaUpload>(data);
  return resultado.url;
}
