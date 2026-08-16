# Persona 4 — Parte 2: Mis ofertas publicadas + Mis pagos

## Instalación
No agrega paquetes nuevos, reutiliza la capa de API de la parte 1.

## Cómo aplicar
Descomprime en la raíz del repo (misma carpeta de siempre), reemplaza si
pregunta:
- src/app/mis-ofertas/ (carpeta nueva: index.tsx, [id].tsx, _layout.tsx)
- src/app/mis-pagos.tsx (nuevo)

## Qué cubre "Mis ofertas publicadas"
- /mis-ofertas: lista tus ofertas (GET /me/offers), con contador de
  aplicantes si el API lo trae, pull-to-refresh
- /mis-ofertas/[id]: lista de aplicantes de esa oferta (GET
  /offers/{id}/applications), cada uno con:
  - Calificación de 1 a 5 estrellas (PATCH /applications/{id} { rating })
  - Botones Finalista / Ganador / Descartar (PATCH ... { status })
  - Una vez Ganador o Descartado, los botones desaparecen (son estados
    finales — igual que hicimos con los estados de presupuesto en el
    proyecto anterior)

## Qué cubre "Mis pagos"
- /mis-pagos: historial completo (GET /me/payments), con chip de estado
  (Aprobado en verde, cualquier otro en rojo)

## Prueba esto
1. Ya deberías tener al menos 1 oferta publicada de la parte anterior —
   ve a /mis-ofertas y debe aparecer
2. Entra a esa oferta — como todavía no hay aplicantes reales (nadie ha
   aplicado desde otra cuenta), vas a ver "Todavía no hay aplicantes"
3. Para probar la gestión de candidatos de verdad, necesitas que alguien
   más (otra cuenta, quizás un compañero de equipo) aplique a tu oferta
   usando POST /offers/{id}/apply desde el Swagger
4. Ve a /mis-pagos — debe aparecer el pago de 1 USD que hiciste al
   publicar, en verde ("Aprobado")

## ⚠️ Ajuste pendiente de verificar contra la API real
Igual que avisé en la parte 1: `/offers/{id}/applications` y
`/me/payments` no tienen un schema formal en el Swagger (solo "Lista de
X" en prosa). Los campos que asumí (`applicant.nombre`, `pago.amount`,
`pago.status`, etc.) están en `src/lib/api/types.ts` — si al probar con
un aplicante real algún campo no calza, ese es el único archivo a tocar.
