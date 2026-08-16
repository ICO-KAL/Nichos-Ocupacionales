# Persona 4 — Parte 1: Capa de API compartida + Publicar oferta

## Instalación
No agrega paquetes nuevos — todo lo que uso (axios, expo-image-picker,
expo-location, expo-secure-store, react-hook-form, zod) ya estaba en tu
package.json.

## Cómo aplicar
Descomprime en la raíz del repo (rama persona4), reemplaza si pregunta:
- src/lib/api/ (carpeta nueva: client.ts, types.ts, catalogo.ts, uploads.ts,
  pagos.ts, ofertas.ts)
- src/lib/schemas/oferta-schema.ts (nuevo)
- src/components/themed-text-input.tsx (nuevo)
- src/app/ofertas/ (carpeta nueva: publicar.tsx, _layout.tsx)

## ⚠️ Cosa importante para TODO el equipo, no solo para ti

`src/auth/auth-context.tsx` es código del proyecto viejo abandonado (apunta
a `localhost:3001`, usa endpoints que no existen en Ocupa2). Armé
`src/lib/api/client.ts` desde cero siguiendo el Swagger real. Esto debería
ser la ÚNICA capa de comunicación con el API que use todo el equipo (así lo
pide el documento de distribución del proyecto).

**Punto crítico:** guardo el JWT bajo la llave `'ocupa2.access-token'`
(`TOKEN_KEY` en `client.ts`). Cuando Persona 2 construya el login/registro
real (contra `/auth/register`, `/auth/login`, `/auth/verify-code`), tiene
que guardar el token con `setToken()` de este mismo archivo — si usa su
propia llave o su propio storage, mis pantallas (y las del resto) nunca van
a encontrar la sesión. Avísale a Persona 2 de esto cuanto antes.

## Qué cubre "Publicar oferta"
- Tipo de empleo cargado dinámicamente desde GET /job-types (chips)
- Tipo de contrato (temporal/fijo/horas)
- Descripción, dirección
- Ubicación opcional (botón "Usar mi ubicación actual", expo-location)
- Foto OBLIGATORIA: tomar foto o elegir de galería, se sube a POST /uploads
  al instante y la URL queda guardada; el formulario NO deja enviar sin ella
- Fecha límite opcional
- Preguntas adicionales dinámicas (texto, fecha, selección con opciones,
  sí/no) — agregar/quitar libremente
- Pago: captura tarjeta, cobra 1 USD vía POST /payments, y SOLO si el pago
  aprueba, publica la oferta vía POST /offers con el paymentId

## ⚠️ Cosas que asumí porque el Swagger no las documenta con schema exacto
El spec describe estas respuestas solo en prosa ("Lista de tipos de
trabajo", etc.), sin un `$ref` a un schema formal:
- **GET /job-types**: asumí `{ key, name, customFields? }` por tarea —
  ajusta `JobType` en `src/lib/api/types.ts` si el campo real se llama
  distinto (ej. `label` en vez de `name`)
- **payment.amount/currency en OfferInput**: uso lo que devuelva el pago
  (`pago.amount`, `pago.currency`), con `1` y `'USD'` como respaldo

Todo el ajuste queda centralizado en `types.ts` — si algo no calza al
probar contra la API real, es el único archivo que hay que tocar.

## Prueba esto
1. Necesitas estar autenticado (con un JWT guardado bajo `'ocupa2.access-token'`
   — si el login real de Persona 2 no está listo, puedes guardar un token
   de prueba a mano desde la consola del navegador:
   `sessionStorage.setItem('ocupa2.access-token', 'TU_JWT_AQUI')`
2. Ve a /ofertas/publicar
3. Llena el formulario, usa la tarjeta de prueba `4242424242424242`
4. Debe publicar y redirigirte a /mis-ofertas (esa pantalla la construyo
   en la siguiente entrega)

## Siguiente paso
"Mis ofertas publicadas" (listado + gestión de candidatos: calificar,
descartar, finalista, ganador) y "Mis pagos" (historial). Dime cuando
quieras que siga con eso.
