# ENTRE CORTES — Asado a domicilio en Paraná

> **Vos poné el fuego. Nosotros, el asado.**

Plataforma web comercial para ENTRE CORTES (Paraná, Entre Ríos): catálogo de cortes por **porción**, combos
prearmados, calculadora de asado, armado por presupuesto, carrito persistente, **solicitud de pedido por
WhatsApp** (sin pagos en la web), seguimiento de pedidos y panel administrativo completo.

## Stack

- **Next.js 16** (App Router, Turbopack, `proxy.ts`) + **TypeScript** + **Tailwind CSS v4** + Framer Motion
- **PostgreSQL** + **Prisma 7** (adapter `pg`)
- **Zustand** (carrito persistido en el navegador)
- Autenticación del panel: JWT en cookie `httpOnly` + bcrypt
- Despliegue sugerido: **Vercel** + Postgres administrado (Neon, Supabase o Vercel Postgres)
- Imágenes: URL o subida a **Cloudinary** (opcional)

## Puesta en marcha local

```bash
npm install                       # también genera el cliente de Prisma (postinstall)
cp .env.example .env              # si no existe, ver la tabla de variables más abajo
npx prisma migrate dev            # crea las tablas
npm run seed                      # carga DATOS DE EJEMPLO + usuario admin
npm run dev                       # http://localhost:3000
```

Panel: `http://localhost:3000/admin/login` con `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`
(por defecto `admin@entrecortes.local` / `cambiar123`). **Cambiá la contraseña desde Configuración.**

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a PostgreSQL usada por la app (puede ser un pooler). |
| `DIRECT_URL` | Sí | Conexión directa usada por `prisma migrate`. En local puede ser igual a `DATABASE_URL`. |
| `JWT_SECRET` | Sí (prod) | Secreto largo y aleatorio para firmar la sesión del panel. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Solo para el seed | Credenciales iniciales del administrador. |
| `SETUP_TOKEN` | Solo en el primer deploy | Habilita `/api/setup?token=...` para cargar datos iniciales sin terminal. |
| `NEXT_PUBLIC_BASE_URL` | Sí (prod) | URL pública del sitio (ej. `https://entrecortes.com.ar`). Se usa en SEO y en el enlace de seguimiento del mensaje de WhatsApp. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | No | Habilitan el botón “Subir foto” en el panel. Sin esto, las imágenes se cargan pegando una URL. |
| `RESEND_API_KEY` | Para avisos por correo | API key de [Resend](https://resend.com). Con el dominio de prueba (`onboarding@resend.dev`) solo se puede enviar a la casilla con la que se creó la cuenta de Resend; con un dominio propio verificado, a cualquiera. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Alternativa a Resend | Envío por SMTP. Para Gmail: host `smtp.gmail.com`, puerto `465`, usuario = tu Gmail, contraseña = una [contraseña de aplicación](https://myaccount.google.com/apppasswords). |
| `EMAIL_FROM` | No | Remitente (ej. `ENTRE CORTES <pedidos@tudominio.com>`). |

### Avisos por correo de cada pedido

En **Configuración → Correo para avisos de pedidos** se define la casilla que recibe cada nueva solicitud
con el detalle completo (cliente, WhatsApp, entrega, productos, totales, observaciones y enlaces al panel y
al seguimiento). El envío ocurre después de registrar el pedido y nunca bloquea la solicitud: si el proveedor
falla, el pedido igual queda guardado y el error se registra en los logs. El botón **Enviar correo de
prueba** verifica la configuración.

Ejemplo de `.env` local:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/entrecortes"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/entrecortes"
JWT_SECRET="cambiar-por-un-secreto-largo"
ADMIN_EMAIL="admin@entrecortes.local"
ADMIN_PASSWORD="cambiar123"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Datos de ejemplo (seed)

`prisma/seed.ts` → `src/lib/seed-data.ts` carga **23 productos, 7 combos, 4 zonas, horarios (miércoles a
domingo), 1 cupón y el usuario admin**. Los **precios, pesos e imágenes son ilustrativos** (las imágenes son
SVG generados en `public/img/`, marcados como “imagen ilustrativa”). Antes de publicar:

1. Cargar precios reales, pesos de porción y fotos desde `/admin/productos` y `/admin/combos`.
2. Cargar el **WhatsApp comercial**, dirección y slogans en `/admin/configuracion`.
3. Revisar zonas/tarifas (`/admin/zonas`), horarios y cupos (`/admin/horarios`) y cupones.
4. Revisar las reglas de la calculadora en `/admin/configuracion`.

El seed es idempotente (upsert): se puede volver a correr sin duplicar datos.

## Qué hace la plataforma

### Sitio público
- **Inicio**: hero, cómo funciona, combos destacados, cortes recomendados, promociones, delivery express,
  horarios y zonas de cobertura. SEO local (metadata, JSON-LD, `sitemap.xml`, `robots.txt`).
- **Armá tu asado** (`/catalogo`): productos por categoría con selector de **porciones** (no kilos). Cada
  corte muestra porción individual estimada (mín–máx), precio por porción (calculado desde precio/kg ×
  peso de referencia, o precio fijo) y peso estimado del subtotal. Los precios por kilo se marcan como
  **estimados** y se confirman por WhatsApp.
- **Combos** (`/combos`): combos de precio fijo o **escalables por persona** con detalle de lo incluido.
- **Calculadora** (`/calculadora`): personas, niños, apetito, nivel, achuras y embutidos → recomendación
  editable con porciones, peso total estimado y precio. Reglas configurables desde el panel.
- **Por presupuesto** (`/presupuesto`): presupuesto + personas + preferencia (+ accesorios y envío
  opcional) → propuesta con precios reales; baja de nivel, quita achuras, ajusta cantidades y, si no llega al
  mínimo recomendado, **lo advierte y ofrece alternativas** sin presentar una cantidad insuficiente como adecuada.
- **Todo para el fuego** (`/fuego`) y sugerencia no invasiva en el carrito (“¿Ya tenés todo para prender el fuego?”).
- **Carrito** persistente (localStorage) con porciones, unidades, cupones y total estimado.
- **Checkout** (`/checkout`): datos del cliente, modalidad (express / programado / retiro), zona, dirección,
  día y franja con cupos, observaciones. Al enviar: valida en el servidor, recalcula precios (nunca confía
  en el navegador), registra la solicitud con número `EC-000123`, genera el mensaje y abre WhatsApp
  (`wa.me`, compatible con celular y escritorio). Previene duplicados con una clave por intento.
- **Seguimiento** (`/pedido/<token>`): enlace seguro por pedido con estado, detalle, botón para reabrir
  WhatsApp, copiar número y **repetir pedido** con precios y disponibilidad actuales.

### Panel administrativo (`/admin`)
- **Dashboard**: solicitudes del día, pendientes, confirmados, en preparación, en reparto, entregados,
  ventas confirmadas, cobros recibidos, ticket promedio y productos más solicitados.
- **Pedidos**: filtros por estado, cambio de estado, precio final confirmado, cobro recibido, notas
  internas, chat de WhatsApp con el cliente, enlace de seguimiento.
- **Productos** y **categorías**: unidad de venta, modo de precio (por kg / fijo), rango y referencia de peso
  por porción, cantidad mínima, nivel, rol en el asado, sugerido por persona, destacado, disponibilidad.
- **Combos**: productos incluidos con cantidades (totales o por persona), precio, promoción, destacado.
- **Clientes**: historial agrupado por WhatsApp (sin registro ni contraseña).
- **Zonas y envíos**: barrios, tarifa, compra mínima, envío gratis desde, habilitar/deshabilitar.
- **Horarios**: por día, franjas, cupos por franja, cierres excepcionales, modalidades y tiempos.
- **Cupones**: porcentaje o fijo, vigencia, compra mínima, límite de usos (un solo cupón por pedido).
- **Configuración**: nombre, slogans, WhatsApp, dirección, redes, logo, imagen de inicio, aviso de precios
  estimados, políticas, reglas de la calculadora y cambio de contraseña.

### Estados de pedido
`SOLICITADA → PENDIENTE_CONTACTO → PENDIENTE_CONFIRMACION → CONFIRMADO → EN_PREPARACION →
LISTO_PARA_RETIRAR / EN_REPARTO → ENTREGADO` (o `CANCELADO`). Abrir WhatsApp **no** confirma nada: la
solicitud queda como *Solicitud recibida* hasta que el negocio la actualiza desde el panel.

## Deploy en Vercel (sin usar la terminal)

1. En [vercel.com/new](https://vercel.com/new) importar el repositorio de GitHub.
2. En **Settings → Git → Production Branch** poner la rama que contiene ENTRE CORTES
   (`claude/wonderful-hopper-43a62s`, o `main` si se la mergeó).
3. En **Storage → Create Database → Neon (Postgres)** crear la base y conectarla al proyecto: Vercel
   inyecta `DATABASE_URL` y `DATABASE_URL_UNPOOLED` automáticamente (la app los reconoce).
4. En **Settings → Environment Variables** agregar: `JWT_SECRET` (texto largo aleatorio), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `SETUP_TOKEN` (otro texto aleatorio) y `NEXT_PUBLIC_BASE_URL` (la URL del proyecto,
   por ejemplo `https://entre-cortes.vercel.app`).
5. **Deploy**. El build corre `prisma migrate deploy && next build`, así que las tablas se crean solas.
6. Abrir una sola vez `https://<tu-dominio>/api/setup?token=<SETUP_TOKEN>` para cargar los datos de
   ejemplo y el usuario administrador. Después entrar en `/admin/login` y reemplazar los datos de ejemplo
   por los reales (WhatsApp, precios, fotos, zonas, horarios).
7. Opcional: configurar el dominio propio en **Settings → Domains** y actualizar `NEXT_PUBLIC_BASE_URL`.

El endpoint `/api/setup` solo funciona si todavía no existe ningún administrador y requiere el token, así
que no puede volver a ejecutarse por error.

> Si ya existía una base de datos del proyecto anterior en esa misma instancia, hay que vaciarla o usar una
> base nueva: el esquema de ENTRE CORTES parte de una migración inicial nueva.

## Pendiente / fuera del alcance de esta versión

- **Fotografías reales** de cortes, combos e inicio (hoy son ilustraciones SVG de ejemplo).
- **Datos comerciales reales**: WhatsApp, dirección, precios, pesos, zonas y horarios definitivos.
- **Subida de archivos** requiere configurar Cloudinary (sin eso, se cargan URLs).
- Pagos integrados (Mercado Pago, transferencias automáticas): **excluidos a propósito**; todo se acuerda por WhatsApp.
- Notificaciones automáticas al negocio (correo/Telegram) al recibir una solicitud.
- Múltiples usuarios administradores con roles.
- Rate limiting del login en memoria (por instancia); para mayor robustez usar un store compartido.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` / `npm start` | Producción |
| `npm run lint` | ESLint |
| `npm run seed` | Datos de ejemplo + admin |
| `node scripts/generate-placeholders.mjs` | Regenera las imágenes SVG de ejemplo |
