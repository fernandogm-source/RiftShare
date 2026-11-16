# RiftShare – guía para agentes

Proyecto de clase (DAW 2º, asignatura Cliente): catálogo de cartas Riftbound. Backend Express 5 + PostgreSQL; frontend HTML/CSS/JS vanilla sin build. Textos de la UI y mensajes de la API en español.

## Estructura
- `backend/`: API Express. Entrypoint `src/app.js`. Todos los comandos `npm` se ejecutan desde aquí; la raíz no tiene `package.json`.
- `frontend/`: archivos estáticos que Express sirve desde `/`. No hay dev server aparte.
- `cards.json` (raíz): catálogo que lee el seed. No editar a mano.

## Comandos (desde `backend/`)
- `npm install`
- `npm run dev`: servidor con `node --watch` en http://localhost:3000
- `npm start`: sin watch
- `npm run seed`: recarga la base de datos desde `cards.json` y los SQL
- `npm run seed:collection -- <email|username> [numeroDeCartas]`: añade cartas aleatorias (20 por defecto, cantidad de 1 a 3) a la colección de un usuario existente. Requiere haber ejecutado antes `npm run seed`. Es `db/seed-collection.js`, distinto de `db/seed.js`.
- No hay tests, lint ni typecheck configurados. No inventes `npm test`.

## Base de datos
- Requiere `backend/.env` con `DATABASE_URL` y `JWT_SECRET` (plantilla en `.env.example`). No imprimir ni commitear `.env`.
- `npm run seed` va en una transacción: ejecuta `db/schema.sql`, `db/users.sql` y `db/collection.sql` (en ese orden, porque la colección referencia a `users`), y hace `ROLLBACK` si algo falla. Termina el proceso al acabar (no es el servidor).
- `schema.sql` hace DROP y recrea las tablas del catálogo (`sets`, `cards`, `domains`, `card_domains`, `tags`, `card_tags`). Un reseed borra cartas, no usuarios ni colección; las sesiones se eliminan (`users.sql` hace `DROP TABLE IF EXISTS sessions`).
- `users.sql` y `collection.sql` usan `CREATE TABLE IF NOT EXISTS`, así que usuarios y colección sobreviven a un reseed.
- `collection.sql` restaura la FK `collection_items.card_id → cards.id` que el DROP de `cards` elimina. Si cambias el esquema, respeta ese orden.

## Backend
- `app.js` monta `/api` antes que los estáticos. Un `/api/*` desconocido devuelve 404 JSON.
- Flujo: `src/routes/*.routes.js` → `src/controllers/` → SQL con el `pool` de `src/db.js`. Filtros y paginación de cartas en `src/queries/cards.query.js`.
- Validación con Zod en `src/validation/`: esquemas por dominio y middleware `validate`. Valida body, query y params antes del controlador; los errores responden 400 con mensajes en español.
- Errores: `ZodError` responde 400; cualquier otro error, 500 genérico. Express 5 propaga los errores de handlers async.
- Listados: `{ data, pagination }`. `page` debe ser ≥ 1 y `limit` entero entre 1 y 100; fuera de rango responde 400.
- Auth con JWT (`jsonwebtoken`, caducidad 1 h) firmado con `JWT_SECRET`. Login devuelve `{ token, user: { id, username, email, role } }`; registro y login esperan `username`, `email` y `contraseña` (clave JSON en español, igual que el formulario). Contraseñas con argon2.
- No hay logout en el servidor: el cliente borra el token.
- Middleware `requireAuth` (`src/middleware/auth.middleware.js`): protege todas las rutas de `/api/collection` y deja `req.user` (`id`, `username`, `role`). Las rutas de cartas son públicas.
- Cartas desactivadas: `cards.is_active` (booleano, por defecto `TRUE`). `buildCardFilters` siempre añade `c.is_active = TRUE`, así que catálogo y colección las ocultan; `/api/cards/:id` y `addItem` también las rechazan. Un `npm run seed` reactiva todas las cartas, porque `schema.sql` recrea la tabla.
- Precios: `cards.price NUMERIC(10,2) NOT NULL`. `seed.js` asigna un precio aleatorio según la rareza (`RANGOS_PRECIO`), así que cada `npm run seed` regenera todos los precios y pierde los cambios del admin. La API devuelve `price` como texto (`NUMERIC`); el frontend lo convierte con `formatearPrecio` (`utils/precio.js`).
- Admin: `/api/admin` (`src/routes/admin.routes.js`) usa `requireAuth` + `requireAdmin` (`src/middleware/admin.middleware.js`), que comprueba el rol en la base de datos. `GET /api/admin/cards?page&limit&name` lista todas las cartas (también inactivas) y `PUT /api/admin/cards/:id` acepta `is_active`, `price` o ambos (`adminCardUpdateBodySchema`).
- Perfil: `/api/users` (`src/routes/users.routes.js`, con `requireAuth`). `GET /me` devuelve `username`, `email`, `role`, `total_copies` (suma de cantidades de cartas activas) y `valor_coleccion` (suma de cantidad × precio, en euros). `PUT /me` cambia el nombre y `PUT /me/password` cambia la contraseña (pide `contraseña_actual`). Ambas devuelven `{ token, user }` con un token nuevo. `utils/token.js` (`firmarToken`) firma el JWT para login y perfil.
- Primer admin: no hay forma de crearlo desde la web. Ejecutar `UPDATE users SET role = 'Admin' WHERE email = '...';` en la base de datos.
- La colección es por usuario: `collection_items` tiene `user_id` y clave primaria `(user_id, card_id)`. Los controladores siempre filtran por `req.user.id`.

## Frontend
- Mismo origen que la API: usar rutas relativas (`/api/...`). El token JWT se guarda en `localStorage`; no hay cookie de sesión.
- Reparto para auth: `Auth/auth.js` (llamadas a la API y utilidades de sesión: `cabeceraAutorizacion()` redirige al login si no hay token y devuelve la cabecera; `usuarioLogueado()` devuelve `true`/`false` sin redirigir), `login.js` y `register.js` (lógica de cada formulario, importan de `auth.js`).
- `cards.js` (raíz de `frontend/`): `cargarCartas`, `pintarCartas` (catálogo: con sesión muestra la cantidad de cada carta y los controles `-` y `+`; `-` se desactiva con cantidad 0 y `+` con 99, usando la propiedad `disabled`), `vaciarCartas`, y las acciones de la colección `añadirCarta(cardId)` y `quitarCarta(cardId, cantidadActual)`. Con sesión, `cargarCartas` pide `GET /api/collection/quantities` (vía `cargarCantidades()`) y guarda el resultado en la variable de módulo `cantidades` (`{ card_id: cantidad }`). `cargarCantidades()` nunca lanza error: si la sesión ha caducado (401) redirige a `/Auth/loginForm.html` con `sesionCaducada(respuesta)`, y si falla cualquier otra cosa deja `cantidades` vacío, para que el catálogo se vea igual. Lo importan `app.js` y `Collection/collection.js`.
- `Auth/auth.js` exporta `sesionCaducada(respuesta)`: devuelve `true` si la respuesta es 401 y borra `token` y `user`. Siempre se le pasa el objeto `respuesta`, no `respuesta.status`, y su resultado se usa en un `if`. En la colección, la comprobación va justo después del `fetch`, antes de `respuesta.json()`.
- `Admin/admin.html` y `Admin/admin.js`: panel de administración (lista de cartas con búsqueda por nombre y botón para activar o desactivar). Solo se muestra el botón «ADMIN» si `localStorage.role === "Admin"`; la página redirige si no lo es. `login.js` guarda `role` y `header.js`/`sesionCaducada` lo borran al cerrar sesión.
- `Profile/profile.html` y `Profile/profile.js`: perfil del usuario. Muestra email, rol, contraseña (`********`) y número de copias en colección; permite cambiar el nombre y la contraseña (pidiendo la actual). Al guardar, actualiza `token` y `user` en `localStorage` y el texto de `#headerUsername`. Se accede con el botón «PERFIL» de `#menu`.
- `utils/filters.js`: `iniciarFiltros(alAplicarFiltros)` y `filtrosActuales()`. Lo usan `cards.js` y `Collection/collection.js` para añadir los filtros a la URL.
- `auth.js` lanza un `Error` con `message` = `datos.error` y, si la API lo envía, `details` (array de `{ field, message }`) para pintar cada error bajo su campo.
- Páginas: `index.html` (catálogo), `loginForm.html`, `registerForm.html`, `collection.html` (mi colección). `app.js` contiene la lógica del catálogo y el modal de detalle.
- Módulos compartidos: `header.js` (`actualizarCabecera()`: muestra u oculta los botones de sesión y registra sus listeners) y `pagination.js` (`iniciarPaginacion(alCambiarPagina)`, `pintarPaginacion(total)` y `paginaActual()`: guarda la página actual y registra los botones «anterior» y «siguiente»). Cada página los importa; no se comparten variables entre archivos, solo funciones exportadas.
- La colección tiene un único script, `collection.js` (script de `collection.html`): hace las llamadas a la API, pinta y escucha eventos. No se separa en módulos de API y DOM. Pinta la colección con su propia función, `pintarColeccion`, que vive en `collection.js` y tiene sus controles `+` y `-`. Usa `vaciarCartas` de `cards.js` (importada desde `../cards.js`). No reutiliza `pintarCartas`, porque el catálogo y la colección tienen controles distintos.
- Estructura: `index.html`, `app.js`, `cards.js` y `style.css` en la raíz de `frontend/`; `Auth/` (login y registro), `Collection/` (colección) y `utils/` (`header.js`, `pagination.js`, `details.js`); imágenes en `img/`.
- Rutas de recursos y navegación absolutas desde la raíz de `frontend/` (`/style.css`, `/img/RiftShare-cropped.svg`, `/Auth/loginForm.html`), para que funcionen desde cualquier carpeta.
- El formulario de registro usa `username` en el HTML; la API espera `username`, `email` y `contraseña`.
- La validación de formularios es solo la del backend (Zod). No usar atributos de validación HTML (`required`, `type="email"` sin `novalidate`) para no bloquear el envío.

## Inicio de sesión
- Antes de responder, lee `lessons.md` (en la raíz). Contiene lo que el usuario ya ha visto y practicado, y el punto en el que se quedó.
- Al terminar un paso o micro-paso relevante, añade una entrada nueva a `lessons.md` con la fecha, el tema y lo que el usuario ha conseguido.
- Paso en curso (16/11/2026): botones +1 / -1 en las cartas, ya funcionales en catálogo y colección. Último arreglo: sesión caducada, que ahora redirige al login desde el catálogo y la colección (`sesionCaducada`). Filtros implementados en catálogo y colección, pendientes de comprobar en el navegador. Lo pendiente está en `lessons.md` (sección «Estado actual» y «Token caducado en el catálogo»). Decisión (13/11/2026): el catálogo y la colección tienen cada uno su función de pintado (`pintarCartas` y `pintarColeccion`), y cada página se recarga a sí misma.

## Contexto de enseñanza
- Es un proyecto de aprendizaje: el usuario escribe el frontend en vanilla JS. Explica y guía con pasos y pistas; no generes páginas completas de frontend salvo que lo pida explícitamente. El backend se puede modificar con normalidad.
