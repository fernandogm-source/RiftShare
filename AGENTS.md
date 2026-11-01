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
- Requiere `backend/.env` con `DATABASE_URL` (plantilla en `.env.example`). No imprimir ni commitear `.env`.
- `npm run seed` va en una transacción: ejecuta `db/schema.sql`, `db/collection.sql` y `db/users.sql`, y hace `ROLLBACK` si algo falla. Termina el proceso al acabar (no es el servidor).
- `schema.sql` hace DROP y recrea las tablas del catálogo (`sets`, `cards`, `domains`, `card_domains`, `tags`, `card_tags`). Un reseed borra cartas, no usuarios.
- `users.sql` y `collection.sql` usan `CREATE TABLE IF NOT EXISTS`, así que usuarios, sesiones y colección sobreviven a un reseed.
- `collection.sql` restaura la FK `collection_items.card_id → cards.id` que el DROP de `cards` elimina. Si cambias el esquema, respeta ese orden.

## Backend
- `app.js` monta `/api` antes que los estáticos. Un `/api/*` desconocido devuelve 404 JSON.
- Flujo: `src/routes/*.routes.js` → `src/controllers/` → SQL con el `pool` de `src/db.js`. Filtros y paginación de cartas en `src/queries/cards.query.js`.
- Errores: un error con `isValidation = true` responde 400; cualquier otro, 500 genérico. Express 5 propaga los errores de handlers async.
- Listados: `{ data, pagination }`. `limit` máximo 100.
- Auth: login inserta en `sessions` y envía la cookie `session` (HttpOnly, SameSite=Lax, 1 h). Contraseñas con argon2. Registro espera `username`, `email` y `password`.
- No hay middleware de autenticación: las rutas de colección no comprueban la sesión todavía.

## Frontend
- Mismo origen que la API: usar rutas relativas (`/api/...`). La cookie de sesión la envía el navegador; JS no la lee ni la gestiona.
- Páginas: `index.html` (catálogo), `loginForm.html`, `registerForm.html`. `app.js` está vacío.
- `users.js` es un módulo ES (usa `export`): cargarlo con `<script type="module">`.
- Las imágenes `../RiftShare-cropped.svg` salen de `frontend/` y no resuelven al servir desde Express.
- El formulario de registro tiene el campo `nombre`, pero la API espera `username`.

## Inicio de sesión
- Antes de responder, lee `lessons.md` (en la raíz). Contiene lo que el usuario ya ha visto y practicado, y el punto en el que se quedó.
- Al terminar un paso o micro-paso relevante, añade una entrada nueva a `lessons.md` con la fecha, el tema y lo que el usuario ha conseguido.

## Contexto de enseñanza
- Es un proyecto de aprendizaje: el usuario escribe el frontend en vanilla JS. Explica y guía con pasos y pistas; no generes páginas completas de frontend salvo que lo pida explícitamente. El backend se puede modificar con normalidad.
