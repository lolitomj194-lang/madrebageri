# Vision Equis - Ecommerce Ray-Ban (Parana)

Tienda online para Vision Equis, distribuidor autorizado Ray-Ban en Parana,
Entre Rios. Next.js (App Router) + Prisma + PostgreSQL, con panel de
administracion propio para cargar productos, stock y gestionar pedidos.

## Stack

- Next.js 16 (App Router, Turbopack)
- PostgreSQL + Prisma ORM
- Tailwind CSS v4
- Framer Motion (animaciones)
- Zustand (carrito, persistido en el navegador)
- Mercado Pago (Checkout Pro)
- JWT + cookie httpOnly para el login del panel admin

## Desarrollo local

1. Instalar dependencias (esto tambien genera el cliente de Prisma via `postinstall`):

   ```bash
   npm install
   ```

2. Crear una base de datos Postgres local y copiar `.env.example`... (no hay
   `.env.example` en el repo por seguridad; ver la seccion de variables de
   entorno mas abajo) a `.env` con tus datos.

3. Correr las migraciones y cargar datos de ejemplo:

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

   El seed crea ~12 productos de ejemplo (incluyendo la linea Ferrari) y un
   usuario admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`).

4. Levantar el servidor:

   ```bash
   npm run dev
   ```

## Variables de entorno

| Variable | Descripcion |
|---|---|
| `DATABASE_URL` | Cadena de conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar la sesion del panel admin (cambiar en produccion) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales que crea el script de seed |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numero de WhatsApp en formato internacional sin `+` (ej `5493435173734`) |
| `NEXT_PUBLIC_INSTAGRAM` | Usuario de Instagram (sin `@`) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de Mercado Pago (produccion o sandbox) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public key de Mercado Pago |
| `NEXT_PUBLIC_BASE_URL` | URL publica del sitio (usada en los `back_urls` y webhook de Mercado Pago) |

Mientras `MERCADOPAGO_ACCESS_TOKEN` este vacio, el checkout con Mercado Pago
devuelve un error controlado y el cliente puede elegir transferencia o
efectivo en su lugar.

## Panel de administracion

`/admin/login` - permite:

- Ver resumen de ventas, pedidos pendientes y stock bajo
- Crear, editar y eliminar productos (precio tarjeta/Mercado Pago, precio
  efectivo/transferencia opcional, categoria, coleccion, imagenes por URL,
  variantes de color con stock y ajuste de precio)
- Ver pedidos y cambiar su estado (pendiente, pagado, preparando,
  enviado, entregado, cancelado). Al cancelar un pedido se repone el stock
  reservado automaticamente.

Las imagenes de producto se cargan pegando una URL (por ejemplo subida a
Cloudinary, Imgur o similar) - no hay upload de archivos integrado todavia.

### Precio tarjeta vs. efectivo/transferencia

Cada producto tiene un precio base (el que se muestra por defecto, pensado
para Mercado Pago/tarjeta) y un precio opcional para efectivo/transferencia.
Si se deja vacio el precio efectivo, se cobra el mismo precio base. El total
del carrito se recalcula automaticamente en el checkout segun el medio de
pago elegido, y el precio final se recalcula tambien en el servidor al crear
el pedido (nunca se confia en el precio que manda el navegador).

## Deploy en Vercel

1. Crear una base de datos Postgres administrada (Neon, Supabase o Vercel
   Postgres) y usar su `DATABASE_URL` en las variables de entorno del
   proyecto en Vercel.
2. Configurar todas las variables de entorno de la tabla de arriba en Vercel.
3. Correr `npx prisma migrate deploy` contra esa base (una vez, desde tu
   maquina o un job de CI) y `npm run seed` si queres cargar los datos de
   ejemplo iniciales.
4. Conectar el repo en Vercel y deployar. El build corre `prisma generate`
   automaticamente via `postinstall`.
5. Cargar el catalogo real (los ~100 productos Ray-Ban) desde el panel
   `/admin/productos` reemplazando los datos de ejemplo.

## Datos de ejemplo (seed)

`prisma/seed.ts` contiene un catalogo de PLACEHOLDER (nombres de modelos
Ray-Ban reales pero precios e imagenes de ejemplo) para poder probar el
sitio de punta a punta antes de cargar el catalogo real de ~100 productos
desde el panel de administracion.
