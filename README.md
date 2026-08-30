# City Soul Echoes

Plataforma cultural digital dedicada a la escena artística, el emprendimiento consciente y el bienestar comunitario de Cali, Colombia. Stack MEAN (MongoDB, Express, Angular, Node.js) con Angular 19 en componentes standalone.

## Stack técnico

- **Backend:** Node.js 26.1.0 + Express + MongoDB (Atlas) + JWT + Cloudinary
- **Frontend:** Angular 19 (standalone components) + Bootstrap 5 + Web Audio API
- **Despliegue:** Frontend en Vercel, Backend en Render, Base de datos en MongoDB Atlas

## Deuda técnica registrada

### Vulnerabilidades de dependencias — Frontend (npm audit)
**Estado:** 31 alertas (2 low, 7 moderate, 21 high, 1 critical) — pospuestas a un bloque dedicado, no ignoradas.

**Por qué se posponen:** todas requieren `npm audit fix --force`, que salta Angular de v19 a v22 (breaking change real). La mayoría de los paquetes afectados (esbuild, vite, postcss, webpack-dev-server, piscina, tar, @babel/core, serialize-javascript, image-size, @sigstore/*) son herramientas del proceso de *build*, nunca se envían al navegador del usuario final. Las 3 alertas que sí afectan runtime (@angular/core, @angular/common, @angular/compiler) tienen impacto acotado en este proyecto: XSS vía i18n (no usado), DoS en formatDate (uso mínimo), envenenamiento de HttpTransferCache (función de SSR, no usada, esta app es client-side puro con `ng serve`).

**Cuándo se resuelve:** en un bloque dedicado, con testing regresivo completo de audio, cohete, 5 efectos de fondo y todos los paneles admin antes de subir a producción.

**Fecha de este registro:** 29/08/2026

### Vulnerabilidades de dependencias — Backend (npm audit)
**Estado:** ✅ Resuelto (29/08/2026) — `npm audit fix` sin `--force`, corrigió `brace-expansion` y `ip-address` (ambas altas). Confirmado `0 vulnerabilities` tras el fix.

## Pendientes activos — Bloque 2 (pulido, en curso)

- Coreografía de partículas por zona (pieza final del Bloque 2, sin definir concepto todavía)
- Sonido de motor/llama del cohete: rotación bilateral ya resuelta; queda revisar si algún detalle sonoro adicional hace falta
- Reproductor Soul Station completo: integración a Jamendo, ecualizador, control tipo playlist, visualizador de espectro estilo PS1 (Web Audio API `AnalyserNode`) — pendiente desde hace varias sesiones, no iniciado

## Pendientes activos — Bloque 3 (el más grande y complejo, decidido que se hace al final)

Confirmado con el dueño del proyecto: este bloque queda deliberadamente para el final, porque es el paso más grande e importante del roadmap — toca modelo de datos, backend, y dinero real.

- **Marketplace comunitario tipo OLX**: para que artistas y usuarios listen artículos propios en venta (distinto del Vault, que es el showroom curado y no transaccional del propio fundador)
- **Sistema de suscripciones por rol**: planes diferenciados con beneficios propios según el plan contratado — pieza central del modelo de monetización
- **Cambio de rol bidireccional con prorrateo de cobro**: lógica de facturación proporcional según los días restantes del plan actual al momento del cambio — no trivial
- **Sistema de banners publicitarios pagos** para negocios locales de Cali
- **Integración de pagos real** (Wompi, ya probado en Sandbox según registros anteriores, pendiente de producción)

## Pendientes técnicos generales (Bloque 5 del roadmap original)

- Validación de inputs con Zod en el backend, de forma sistemática (hoy no está aplicado en todos los endpoints)
- Testing automatizado (unitario e integración) — deuda reconocida, no iniciado
- Refresh tokens con rotación (hoy JWT de 7 días sin revocación, comportamiento documentado pero no ideal)
- `.env.example` completo y actualizado
- Health check endpoint (`/api/health`)
- Graceful shutdown del servidor
- Logging estructurado en producción (reemplazar console.log sueltos)
- Paginación en endpoints que devuelven listas
- Versionado de API (`/api/v1/...`)

## Pendientes de producto/legal (Bloque 6)

- Documentos legales reales: política de privacidad y términos de uso (Ley 1581/2012 y Ley 1480/2011, Colombia) — obligatorio antes de operar con usuarios reales y datos personales
- Checklist QA completa antes de lanzamiento