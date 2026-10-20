# Ay Gloria Bendita — Tienda online

Ecommerce de blanquería, deco y accesorios artesanales (almohadones,
sábanas, carteras, materos y más), con venta minorista y mayorista y envíos
a todo el país. Pensada para un negocio donde **las telas rotan**: cada
producto es un "modelo" y cada tela/diseño disponible es una variante con su
propia foto y stock.

## Cómo está pensada

- **Producto = modelo, variante = tela.** "Almohadón 40x40" se publica una
  sola vez; las telas disponibles se agregan/agotan desde el panel. Cuando
  una tela se termina, se pone en stock 0 (o se oculta) y el producto sigue
  publicado con el resto.
- **Minorista y mayorista juntos.** Cada producto puede tener precio
  mayorista + cantidad mínima. Al llegar a esa cantidad (sumando telas del
  mismo producto), el carrito y el servidor aplican el precio mayorista
  automáticamente. Sin registro ni lista de precios aparte.
- **Precio efectivo/transferencia** opcional con descuento sobre el precio
  de lista (tarjeta / Mercado Pago).
- **WhatsApp como canal de cierre.** Botón flotante, consulta de telas por
  producto y coordinación de envío/pago tras el pedido.
- **Envíos**: el costo se coordina por WhatsApp según destino y volumen (un
  acolchado no cuesta lo mismo que un matero); no hay cotizador automático.

## Stack

- Next.js 16 (App Router, Turbopack)
- PostgreSQL + Prisma ORM (driver adapter `pg`)
- Tailwind CSS v4
- Zustand (carrito, persistido en el navegador)
- Mercado Pago (Checkout Pro) — opcional hasta configurar el token
- Vercel Blob para subir fotos desde el celular — opcional, también se
  pueden pegar URLs
- JWT + cookie httpOnly para el panel admin

## Desarrollo local

1. `npm install` (corre `prisma generate` vía `postinstall`)
2. Crear una base Postgres y un `.env` con las variables de abajo
3. `npx prisma migrate deploy && npm run seed`
4. `npm run dev`

El seed crea 12 productos de ejemplo con telas/stock y el usuario admin
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL (puede ser un pooler) |
| `DIRECT_URL` | (Opcional) conexión directa para `prisma migrate`; si falta se usa `DATABASE_URL` |
| `JWT_SECRET` | Secreto de la sesión admin (cambiar en producción) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales que crea el seed |
| `SEED_SECRET` | Habilita el seed remoto una única vez (ver deploy) |
| `NEXT_PUBLIC_SITE_NAME` | Nombre de la tienda (default: "Ay Gloria Bendita") |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp en formato internacional sin `+` (ej `5493435000000`) |
| `NEXT_PUBLIC_INSTAGRAM` | Usuario de Instagram sin `@` (default: `aygloriabendita.deco`) |
| `NEXT_PUBLIC_BASE_URL` | URL pública del sitio (back_urls y webhook de Mercado Pago) |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token de Mercado Pago |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public key de Mercado Pago |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob (se crea solo al agregar un Blob store en Vercel) |

Mientras `MERCADOPAGO_ACCESS_TOKEN` esté vacío, el checkout con Mercado
Pago devuelve un error controlado y el cliente puede elegir transferencia o
efectivo. Mientras falte `BLOB_READ_WRITE_TOKEN`, el panel avisa y permite
pegar URLs de imágenes.

## Panel de administración (`/admin`)

Pensado para usarse desde el celular. Dos roles: **Dueña** (ve todo) y
**Carga de stock** (solo productos, telas y fotos; pensado para la community
manager).

- **Resumen**: vendido en el mes por canal, plata a cobrar, pedidos web
  pendientes, productos con margen bajo, telas por agotarse.
- **Productos**: crear/editar con fotos subidas desde la cámara/galería,
  telas con foto y stock propio, precios minorista/efectivo/mayorista,
  botón rápido "agotar" por tela y aumento masivo de precios por porcentaje
  (redondeado a los $100). Cada producto muestra su costo y margen.
- **Ventas**: todas las ventas en un solo lugar — las de la web entran solas
  y las de Instagram, locales mayoristas, conocidos y ferias se cargan con
  "Registrar venta" (descuenta stock igual que la web). Las ventas fiadas
  quedan como "a cobrar" hasta marcarlas cobradas.
- **Clientes**: locales y clientes frecuentes con historial y cuánto deben.
- **Costos**: parámetros del taller (sueldo propio, jornal de la empleada,
  horas productivas, gastos fijos, márgenes) y lista de materiales con su
  último precio por proveedor. La receta y los minutos de confección se
  cargan en cada producto; el costo se recalcula solo cuando cambia un
  precio o un parámetro, y el sistema sugiere precio mayorista y minorista.
- **Usuarios**: altas, contraseñas y roles.

### Cómo se calcula el costo de un producto

```
materiales   = Σ cantidad en la receta × último precio del material
mano de obra = minutos de confección / 60 × valor hora
               valor hora = (sueldo dueña + jornal × días/semana × 4,33) / horas productivas del mes
gastos fijos = gastos fijos del mes / productos estimados por mes
costo total  = materiales + mano de obra + gastos fijos
mayorista sugerido = costo × (1 + margen mayorista %)      (redondeado a $100)
minorista sugerido = mayorista × factor minorista
```

A propósito no se controla stock de materiales (metros, unidades): en un
taller con retazos y telas compartidas nunca queda al día. Solo se guardan
precios, que es lo que hace falta para costear.

## Deploy en Vercel

1. Crear una base Postgres administrada (Neon, Supabase o Vercel Postgres)
   y configurar `DATABASE_URL` (y `DIRECT_URL` si usa pooler).
2. Cargar todas las variables de entorno en Vercel.
3. Conectar el repo y deployar: el build corre `prisma migrate deploy`
   (script `vercel-build`).
4. Crear un Blob store en Storage para habilitar la subida de fotos.
5. Primera vez: visitar `https://<sitio>/api/admin/seed-init?secret=<SEED_SECRET>`
   para crear el admin y el catálogo de ejemplo (solo funciona con la base
   vacía). Después, cargar el catálogo real desde `/admin/productos` y
   borrar los productos de ejemplo.
