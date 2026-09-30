# Guía de deploy — Ay Gloria Bendita

Pasos para poner la tienda online **gratis** usando Vercel (hosting) +
Neon (base de datos PostgreSQL). Tiempo estimado: 15–20 minutos. Todo se
hace desde el navegador, no hace falta programar nada.

> Requisito: que el código esté en la rama principal (`main`) del repo de
> GitHub. Si todavía está en una rama de desarrollo, primero hay que
> mergearla.

## 1. Crear la base de datos (Neon)

1. Entrar a <https://neon.tech> y crear una cuenta (con GitHub es un clic).
2. Crear un proyecto nuevo (nombre: `aygloriabendita`, región: la más
   cercana, ej. `AWS South America (São Paulo)`).
3. En el panel del proyecto, buscar **Connection string** y copiar la URI
   que empieza con `postgresql://...`. Guardarla para el paso 3.
   - Si Neon muestra dos variantes ("pooled" y "direct"), copiar las dos:
     la *pooled* va en `DATABASE_URL` y la *direct* en `DIRECT_URL`.
     Si hay una sola, alcanza con `DATABASE_URL`.

## 2. Crear el proyecto en Vercel

1. Entrar a <https://vercel.com> y crear una cuenta eligiendo
   **Continue with GitHub** (la misma cuenta de GitHub donde está el repo).
2. Clic en **Add New → Project** e importar el repositorio `madrebageri`.
3. **No apretar Deploy todavía**: primero abrir la sección
   **Environment Variables** y cargar las variables del paso 3.

## 3. Variables de entorno

En la pantalla de importación (o después en *Settings → Environment
Variables*), agregar:

| Nombre | Valor |
|---|---|
| `DATABASE_URL` | la connection string de Neon |
| `DIRECT_URL` | (solo si Neon dio dos) la connection string "direct" |
| `JWT_SECRET` | un texto largo y aleatorio inventado (30+ caracteres) |
| `ADMIN_EMAIL` | el email con el que va a entrar al panel |
| `ADMIN_PASSWORD` | la contraseña del panel (¡una buena!) |
| `SEED_SECRET` | otro texto aleatorio distinto (se usa una sola vez) |
| `NEXT_PUBLIC_BASE_URL` | la URL del sitio, ej. `https://madrebageri.vercel.app` (se puede corregir después del primer deploy) |

Después sí: **Deploy**. El build corre las migraciones de la base
automáticamente (`prisma migrate deploy`).

## 4. Activar la subida de fotos (Vercel Blob)

1. En el proyecto de Vercel: pestaña **Storage → Create Database → Blob**.
2. Crear el store y conectarlo al proyecto. Esto agrega solo la variable
   `BLOB_READ_WRITE_TOKEN`.
3. Hacer un **Redeploy** (Deployments → menú ⋯ del último → Redeploy) para
   que la tome.

Sin este paso la tienda funciona igual, pero las fotos habría que subirlas
a otro servicio y pegar la URL.

## 5. Cargar los datos iniciales

Visitar una sola vez en el navegador:

```
https://TU-SITIO.vercel.app/api/admin/seed-init?secret=EL_SEED_SECRET
```

(reemplazando por tu URL real y el valor que pusiste en `SEED_SECRET`).
Esto crea el usuario admin y 12 productos de ejemplo con telas y stock.
Solo funciona con la base vacía, así que no hay riesgo de borrar nada
después.

## 6. Probar y cargar el catálogo real

1. Entrar a `https://TU-SITIO.vercel.app/admin/login` con `ADMIN_EMAIL` y
   `ADMIN_PASSWORD`.
2. En **Productos**, crear los productos reales sacando las fotos desde el
   celular, y borrar los de ejemplo.
3. Listo: la tienda ya está vendiendo. Compartí la URL por Instagram y
   WhatsApp.

## 7. Mercado Pago (cuando quieran cobrar con tarjeta)

Mientras no esté configurado, el checkout ofrece transferencia y efectivo
sin problema. Para habilitar tarjeta/cuotas:

1. Crear la aplicación en <https://www.mercadopago.com.ar/developers>
   (tipo *Checkout Pro*), con la cuenta de Mercado Pago de la vendedora.
2. Copiar las **credenciales de producción**: Access Token y Public Key.
3. En Vercel (*Settings → Environment Variables*) agregar:
   - `MERCADOPAGO_ACCESS_TOKEN` = el Access Token
   - `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` = la Public Key
4. Redeploy. Los pagos aprobados marcan el pedido como "Pagado" solos
   (webhook incluido).

## Dominio propio (opcional)

En Vercel: *Settings → Domains* permite conectar un dominio como
`aygloriabendita.com.ar` (se compra aparte, ej. en nic.ar). Al cambiarlo,
actualizar también `NEXT_PUBLIC_BASE_URL` y redeploy.

## Problemas comunes

- **El build falla con error de base de datos** → revisar que
  `DATABASE_URL` esté bien pegada (completa, con `?sslmode=require` si
  Neon la incluye).
- **La subida de fotos dice "no está configurada"** → falta el paso 4 o el
  redeploy posterior.
- **El seed dice "No autorizado"** → el `secret` de la URL no coincide con
  `SEED_SECRET`.
- **Mercado Pago no confirma pagos** → revisar que `NEXT_PUBLIC_BASE_URL`
  sea la URL pública real (el webhook se arma con ella).
