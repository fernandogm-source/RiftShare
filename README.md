# RiftShare

Catálogo de cartas de Riftbound con colección personal, precios, panel de administración y perfil de usuario. Proyecto de clase (DAW 2º, asignatura Cliente).

- **Backend:** API REST con Express 5 y PostgreSQL.
- **Frontend:** HTML, CSS y JavaScript vanilla, sin build ni frameworks. Express sirve los archivos estáticos desde `frontend/`.
- **Idioma:** la interfaz y los mensajes de la API están en español.

> Riftbound es una marca de Riot Games. Este proyecto es educativo y no está afiliado a Riot Games.

## Funcionalidades

- **Catálogo** (`index.html`): cartas paginadas, con nombre, tipo, rareza y precio en cada carta. Filtros por nombre, set, dominio, rareza, tipo y rangos de might, energy y power (sliders de doble pulgar que muestran el rango y lo marcan en dorado). Al pulsar una carta se abre su detalle en un modal.
- **Colección** (`Collection/collection.html`): cartas que tiene el usuario, con cantidad, rareza, precio y controles `+` y `-`. Usa los mismos filtros que el catálogo.
- **Diseño adaptable:** en pantallas estrechas, la cabecera se convierte en un menú hamburguesa, los filtros se apilan en columna y el panel de administración muestra cada carta como una tarjeta.
- **Cuentas:** registro e inicio de sesión con JWT (caduca a la hora) y contraseñas con argon2.
- **Perfil** (`Profile/profile.html`): nombre de usuario editable (con token nuevo), cambio de contraseña pidiendo la actual, número de copias y valor total de la colección en euros.
- **Panel de administración** (`Admin/admin.html`, solo rol `Admin`): lista paginada de todas las cartas con búsqueda por nombre, activación o desactivación de cada carta y edición de su precio.
- **Precios:** cada carta tiene un precio en euros. Se generan aleatoriamente en el seed según la rareza.
- **Cartas desactivadas:** no aparecen en el catálogo ni en la colección, ni se pueden añadir.

## Requisitos

- Node.js (versión LTS reciente) y npm.
- PostgreSQL en funcionamiento.

## Instalación

### 1. Base de datos

Crea una base de datos vacía en PostgreSQL, por ejemplo `riftbound`:

```sql
CREATE DATABASE riftbound;
```

### 2. Variables de entorno

Desde `backend/`, copia la plantilla y edítala:

```bash
cd backend
cp .env.example .env
```

| Variable       | Descripción                                                              |
|----------------|--------------------------------------------------------------------------|
| `PORT`         | Puerto del servidor (por defecto `3000`).                                |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL, por ejemplo `postgresql://usuario:contraseña@localhost:5432/riftbound`. |
| `JWT_SECRET`   | Cadena larga y aleatoria para firmar los tokens.                         |

No subas el `.env` al repositorio: ya está en `.gitignore`.

### 3. Dependencias y carga de datos

Todos los comandos de `npm` se ejecutan desde `backend/`:

```bash
npm install
npm run seed
```

`npm run seed` crea las tablas y carga las cartas desde `cards.json` (en la raíz del proyecto), con precios aleatorios. Se ejecuta en una transacción: si algo falla, se deshace todo.

### 4. Arrancar el servidor

```bash
npm run dev     # con recarga automática al cambiar el código
npm start       # sin recarga automática
```

Abre **http://localhost:3000**. Hay que usar esta dirección: si abres los HTML directamente desde el disco, el navegador bloquea las peticiones a la API (CORS).

## Scripts

| Comando (desde `backend/`)                              | Qué hace                                                                                  |
|---------------------------------------------------------|-------------------------------------------------------------------------------------------|
| `npm run dev`                                           | Servidor con `node --watch`.                                                              |
| `npm start`                                             | Servidor sin watch.                                                                       |
| `npm run seed`                                          | Recrea las tablas del catálogo y carga las cartas. Regenera precios y reactiva las cartas. |
| `npm run seed:collection -- <email\|username> [número]` | Añade cartas aleatorias (20 por defecto) a la colección de un usuario existente.          |

El seed de la colección requiere haber ejecutado antes `npm run seed`.

## Crear un usuario administrador

1. Regístrate desde la web.
2. En la base de datos, cambia el rol de tu cuenta:

```sql
UPDATE users SET role = 'Admin' WHERE email = 'tu@email.com';
```

3. Vuelve a iniciar sesión. Aparecerá el botón **ADMIN** en el menú.

## Estructura del proyecto

```
RiftShare/
├── cards.json              Catálogo de cartas que lee el seed (no editar a mano)
├── lessons.md              Registro de avance del proyecto
├── AGENTS.md               Guía de convenciones para asistentes de IA
├── backend/
│   ├── db/
│   │   ├── schema.sql      Tablas del catálogo (se recrean en cada seed)
│   │   ├── users.sql       Tabla de usuarios (no se borra en el seed)
│   │   ├── collection.sql  Tabla de colección (no se borra en el seed)
│   │   ├── seed.js         Carga el catálogo y los precios
│   │   └── seed-collection.js
│   └── src/
│       ├── app.js          Entrada del servidor
│       ├── db.js           Pool de PostgreSQL
│       ├── routes/         Rutas por dominio
│       ├── controllers/    Lógica de cada ruta
│       ├── queries/        Filtros y paginación de cartas
│       ├── validation/     Esquemas Zod y middleware `validate`
│       ├── middleware/     `requireAuth` y `requireAdmin`
│       └── utils/          Firma del token JWT
└── frontend/
    ├── index.html, app.js, cards.js, style.css   Catálogo
    ├── Auth/               Login, registro y llamadas a la API de sesión
    ├── Collection/         Mi colección
    ├── Profile/            Perfil de usuario
    ├── Admin/              Panel de administración
    ├── utils/              Módulos compartidos (cabecera y menú, paginación, filtros, sliders, detalle, precios)
    └── img/                Logo e icono
```

## API

Todas las rutas empiezan por `/api`. Las rutas marcadas con 🔒 requieren cabecera `Authorization: Bearer <token>`.

### Cartas, sets y filtros

| Método | Ruta                | Descripción                                                                                  |
|--------|---------------------|----------------------------------------------------------------------------------------------|
| GET    | `/cards`            | Lista paginada (`page`, `limit` de 1 a 100) con filtros `name`, `set`, `domain`, `rarity`, `type`, `might_min/max`, `energy_min/max`, `power_min/max`. |
| GET    | `/cards/:id`        | Detalle de una carta activa. 404 si no existe o está desactivada.                            |
| GET    | `/sets`             | Lista de sets.                                                                               |
| GET    | `/domains`          | Lista de dominios.                                                                           |
| GET    | `/filters`          | Rarezas y tipos disponibles.                                                                 |

### Autenticación

| Método | Ruta                  | Descripción                                                    |
|--------|-----------------------|----------------------------------------------------------------|
| POST   | `/auth/register`      | Body: `{ username, email, contraseña }`.                        |
| POST   | `/auth/login`         | Body: `{ email, contraseña }`. Devuelve `{ token, user }`.      |

### Colección 🔒

| Método | Ruta                       | Descripción                                                          |
|--------|----------------------------|----------------------------------------------------------------------|
| GET    | `/collection`              | Cartas de la colección del usuario, con los mismos filtros y paginación que `/cards`. |
| GET    | `/collection/summary`      | Resumen por set (cartas totales, distintas y copias).                 |
| GET    | `/collection/quantities`   | Mapa `{ card_id: cantidad }`.                                         |
| POST   | `/collection`              | Body: `{ card_id, quantity }`. Suma la cantidad (máximo 99).          |
| PUT    | `/collection/:cardId`      | Body: `{ quantity }`. Cambia la cantidad.                             |
| DELETE | `/collection/:cardId`      | Quita la carta de la colección.                                       |

### Perfil 🔒

| Método | Ruta                    | Descripción                                                                                         |
|--------|-------------------------|-----------------------------------------------------------------------------------------------------|
| GET    | `/users/me`             | Nombre, email, rol, número de copias y valor de la colección.                                       |
| PUT    | `/users/me`             | Body: `{ username }`. Devuelve `{ token, user }`.                                                   |
| PUT    | `/users/me/password`    | Body: `{ contraseña_actual, contraseña_nueva }`. Devuelve `{ token, user }`.                         |

### Administración 🔒 (rol `Admin`)

| Método | Ruta                  | Descripción                                                                 |
|--------|-----------------------|-----------------------------------------------------------------------------|
| GET    | `/admin/cards`        | Todas las cartas (también desactivadas), paginadas, con `name` opcional.    |
| PUT    | `/admin/cards/:id`    | Body: `is_active`, `price` o ambos.                                         |

Los errores de validación devuelven 400 con `{ error, details: [{ field, message }] }`. Un token caducado o ausente devuelve 401 y un usuario sin permisos 403.

## Notas importantes

- **`npm run seed` recrea el catálogo.** Vuelve a generar los precios y reactiva todas las cartas. Usuarios y colecciones se conservan.
- **Los precios son aleatorios.** Son datos de ejemplo, no precios reales de mercado.
- **Los tokens no se invalidan** al cambiar la contraseña: el servidor no guarda sesiones y siguen valiendo hasta que caduquen (1 hora).
- **Sin tests, lint ni typecheck.** No hay `npm test` configurado.

## Documentación interna

- `AGENTS.md`: convenciones del proyecto para asistentes de IA (estructura, comandos y decisiones de diseño).
- `lessons.md`: registro cronológico de lo implementado y de lo pendiente.
