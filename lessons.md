# Lecciones – RiftShare

## Estado actual
- Sesión en curso: 3 (paginación). Sesión 2 (pintar cartas): completada.
- Micro-paso 1 (`app.js` cargado desde `index.html`): completado.
- Micro-paso 2 (pedir `/api/cards` desde `app.js` y guardar los datos en una variable): completado. Tiene 20 cartas.
- Micro-paso 3 (pintar un nombre por carta dentro de `#cartas`): completado y confirmado en el navegador.
- Micro-paso 4 (más datos por carta: imagen, nombre y tipo, con clases): completado. Cada carta es un `div` con `id`, `img`, y dos `p` con clases `nombre` y `tipo`.
- Estilos de cartas: `#cartas` es una cuadrícula con `display: grid`; `.imagenCarta` ocupa el 100% de la columna. Ajustado por el usuario en `style.css`.
- Próximo paso: sesión 3, paginación (botones anterior/siguiente, URL con `page` y `limit`, repintar `#cartas`).
- Pendientes opcionales de la sesión 2, no bloqueantes: revisar el scroll de `.main-index` con 20 cartas y añadir estilos a `.nombre` y `.tipo`.
- Logo: resuelto (SVG movido a `frontend/`, rutas relativas sin `../`). Favicon: pendiente de decidir si se añade.

## Registro

### Sesión 1 – Entorno y primera petición
- Base de datos y seed comprobados (`npm run seed`).
- Servidor con `npm run dev`; `/api/cards` devuelve `{ data, pagination }`.
- `limit` se limita a 100 en el servidor, sin error.
- Errores de validación con código 400: `might_min debe ser un número entero` y `might_min no puede ser mayor que might_max`.
- `/api/sets` y `/api/domains` devuelven un array directamente. Cada dominio tiene `id` y `name` (7 dominios).
- Primera petición con `fetch` + `.then(respuesta => respuesta.json())` en la consola.

### Sesión 2 – Pintar cartas (completada)
- Micro-paso 1: `app.js` cargado desde `index.html`. Para abrir la página hay que usar `http://localhost:3000`; si se abre `index.html` con doble clic, el origen es `null` y aparece error de CORS.
- Micro-paso 2: `fetch` + `await` dentro de `async function cargarCartas()`. Se guarda `datos.data` en `let cartas` (declarada fuera de la función).
- Micro-paso 3: `pintarCartas()` se llama dentro de `cargarCartas()`, después de asignar `cartas`. Un `<p>` por carta con `createElement`, `textContent` y `appendChild` dentro de `#cartas`.
- Micro-paso 4: cada carta es un `div` con `id` (el `id` de la base de datos), `img` con `src`/`alt`, y dos `p` con `className`. Se añaden con `appendChild` en el orden imagen, nombre, tipo.
- Logo: `RiftShare-cropped.svg` movido a `frontend/`. La ruta `../` no funcionaba porque Express solo sirve `frontend/`.
- CSS de cartas: `display: grid` en el contenedor, `gap` y columnas con `repeat(auto-fill, ...)`.

## Conceptos vistos
- `fetch` devuelve una promesa; `.json()` también es asíncrono.
- `async`/`await`: `await` espera el valor de la promesa, pero solo dentro de funciones `async` en un script clásico.
- Una función no se ejecuta por existir: hay que llamarla.
- Una promesa no es su valor: si imprimes la variable antes de que llegue la respuesta, verás `Promise { <pending> }`.
- `document.getElementById` localiza un elemento por `id`.
- `createElement` crea un elemento en memoria; no aparece hasta `appendChild`.
- `textContent` escribe texto de forma segura; `innerHTML` interpreta HTML.
- Propiedades para elementos nuevos: `id` (único), `className` (reemplaza todas las clases), `classList` (`add`, `remove`, `toggle`), `src` y `alt` en imágenes.
- El `<script>` al final del `<body>` garantiza que `#cartas` ya existe en el DOM.
- `pagination.totalPages` y `offset = (page - 1) * limit`.
- Rutas relativas (`/api/cards`) frente a absolutas (`http://localhost:3000/api/cards`).
- CSS grid: `repeat(auto-fill, minmax(300px, 1fr))` crea tantas columnas de al menos 300px como quepan y reparte el espacio libre con `fr`.
- `fr` es una fracción del espacio libre, después de descontar medidas fijas y `gap`.

## Errores frecuentes
- Llamar a `pintarCartas()` antes de que llegue la respuesta: `cartas` es `undefined`.
- Concatenar texto en una variable en lugar de crear elementos.
- Usar `datos` cuando lo que necesitas es `datos.data`.
- Mezclar columnas fijas con `auto-fill` en `grid-template-columns`: las cartas quedan de anchos distintos.
- Asignar `className` cuando quieres añadir una clase: reemplaza las anteriores; usa `classList.add`.
