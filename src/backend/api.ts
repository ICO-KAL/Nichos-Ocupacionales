import axios from 'axios';

// Instancia global de Axios para Ocupa2
export const api = axios.create({
  baseURL: 'https://ocupa2.ia3x.com/apix',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Nota: La Persona 2 agregará aquí el interceptor para inyectar el token JWT
// en los headers (Authorization: Bearer <token>) cuando esté implementado el Login.

