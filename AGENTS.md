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
- La colección es por usuario: `collection_items` tiene `user_id` y clave primaria `(user_id, card_id)`. Los controladores siempre filtran por `req.user.id`.

## Frontend
- Mismo origen que la API: usar rutas relativas (`/api/...`). El token JWT se guarda en `localStorage`; no hay cookie de sesión.
- Reparto para auth: `auth.js` (llamadas a la API, sin DOM), `login.js` y `register.js` (lógica de cada formulario, importan de `auth.js`).
- `auth.js` lanza un `Error` con `message` = `datos.error` y, si la API lo envía, `details` (array de `{ field, message }`) para pintar cada error bajo su campo.
- Páginas: `index.html` (catálogo), `loginForm.html`, `registerForm.html`, `collection.html` (mi colección). `app.js` contiene la lógica del catálogo y el modal de detalle.
- Módulos compartidos: `header.js` (`actualizarCabecera()`: muestra u oculta los botones de sesión y registra sus listeners) y `pagination.js` (`iniciarPaginacion(alCambiarPagina)`, `pintarPaginacion(total)` y `paginaActual()`: guarda la página actual y registra los botones «anterior» y «siguiente»). Cada página los importa; no se comparten variables entre archivos, solo funciones exportadas.
- Convención de nombres para la colección: `collectionAPI.js` (llamadas a la API, sin DOM, como `auth.js`) y `collectionDOM.js` (script de `collection.html`: pinta y escucha eventos, sin `fetch` directo).
- El SVG del logo está en `frontend/`; usar rutas relativas sin `../`.
- El formulario de registro usa `username` en el HTML; la API espera `username`, `email` y `contraseña`.
- La validación de formularios es solo la del backend (Zod). No usar atributos de validación HTML (`required`, `type="email"` sin `novalidate`) para no bloquear el envío.

## Inicio de sesión
- Antes de responder, lee `lessons.md` (en la raíz). Contiene lo que el usuario ya ha visto y practicado, y el punto en el que se quedó.
- Al terminar un paso o micro-paso relevante, añade una entrada nueva a `lessons.md` con la fecha, el tema y lo que el usuario ha conseguido.

## Contexto de enseñanza
- Es un proyecto de aprendizaje: el usuario escribe el frontend en vanilla JS. Explica y guía con pasos y pistas; no generes páginas completas de frontend salvo que lo pida explícitamente. El backend se puede modificar con normalidad.
