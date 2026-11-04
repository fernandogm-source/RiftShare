# Lecciones – RiftShare

## Estado actual
- Sesiones 1, 2 y 3 completadas.
- Sesión 2 (pintar cartas): micro-pasos 1 a 4 completados. Cada carta es un `div` con `id`, `div.imgDiv` con la `img`, y dos `p` con clases `nombre` y `tipo`.
- Sesión 3 (paginación): completada. Botones «anterior» y «siguiente» con `pagina` como estado, URL con `page` y `limit`, vaciado de `#cartas` antes de repintar, y ocultación de los botones con `hidden` según `totalPages`.
- Trabajo extra completado: los campos de batalla (`card_type === "Battlefield"`) tienen que verse con el mismo tamaño que el resto de cartas. Se usa `position: relative` en `.imgDiv`, `aspect-ratio: 5 / 7`, y `.battlefieldImg` girada 90 grados con `position: absolute`. Comprobado en el navegador.
- Sesión 4 en curso (casi completada): detalle de carta (`/api/cards/:id`) en un modal dentro de `index.html`. Ver registro abajo.
- Autenticación con JWT (backend): completada. Login devuelve `{ token, user }`, tabla `sessions` y ruta de logout eliminadas. Frontend de login/registro pendiente.
- Pendientes no bloqueantes:
  - Comprobar `respuesta.ok` en `cargarDetails` y `cargarCartas`.
  - Mostrar los dominios con `join(", ")` en el modal (ahora se ven separados por comas sin espacio).
  - Comprobar si el fondo del modal debe ser transparente (ahora es `#1A1A1A` sólido).
  - Revisar el reset `*` de `style.css`, que se quitó y vuelve a afectar a márgenes y padding.
  - Sustituir el `limit = 12` de `cargarCartas` por una constante (`CARTAS_POR_PAGINA`) declarada arriba. Pendiente la prueba de cambiar el límite a 5 y comprobar el número de páginas.
  - Revisar el scroll de `.main-index` con 20 cartas.
  - Añadir estilos a `.nombre` y `.tipo`.
  - Decidir si se añade el favicon (ya hay una etiqueta `<link rel="shortcut icon">` apuntando a `favicon.png`; comprobar que el archivo existe).
  - Decidir si se muestra un mensaje cuando la carga falla.
- Logo: resuelto (SVG movido a `frontend/`, rutas relativas sin `../`).

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

### Sesión 3 – Paginación (completada)
- Estado: `let pagina = 1;` fuera de las funciones. Los botones cambian `pagina` y llaman a `cargarCartas(pagina)`.
- `cargarCartas(page, limit = 12)` construye la URL con `page` y `limit`.
- Vaciado de `#cartas` con un bucle `while` que quita `firstChild` mientras haya hijos. Los botones están en `#paginacion`, fuera de `#cartas`, así que no se borran.
- «Anterior» se oculta en la página 1 y «siguiente» en la última, comparando con `datos.pagination.totalPages`.
- Comprobado: la última página tiene las cartas restantes y «siguiente» desaparece.
- Efecto de cambiar `limit`: cambia las cartas por página, el número de páginas (`Math.ceil(total / limit)`) y el desplazamiento (`(page - 1) * limit`). El servidor corrige cualquier valor mayor de 100.

### Trabajo extra – Campos de batalla (completado)
- Las imágenes de campos de batalla se giran 90 grados con `transform: rotate(90deg)` para que encajen en la cuadrícula.
- Primer intento: `object-fit: contain` sobre la imagen girada. No tuvo efecto, porque la caja ya tenía la proporción de la imagen.
- La rotación no cambia el espacio que ocupa el elemento: la imagen girada se salía de su caja y tapaba el texto.
- Solución propuesta: `.imgDiv` con `position: relative`, `aspect-ratio: 5 / 7` y `overflow: hidden`. `.battlefieldImg` con `position: absolute`, centrada con `top`/`left` al 50%, `width: 140%`, `height: 71.43%` y `transform: translate(-50%, -50%) rotate(90deg)`.
- Resuelto: comprobado en el navegador, con el mismo tamaño que el resto de cartas.

### Sesión 4 – Detalle de carta (en curso, 04/11/2026)
- Cambio de planteamiento: en lugar de página nueva, el detalle se muestra en un modal `<dialog id="details">` dentro de `index.html`.
- HTML del modal: `#imgDetails` (imagen), `#infoDetails` (datos con etiquetas `p.etiquetaDetails` y valores en `p#detailsCarta`, `#detailsTipo`, `#detailsDominio`, `#detailsRareza`, `#detailsTexto`) y el botón `#cerrarDetails` («Cerrar»). Sin atributo `open`, el modal empieza oculto.
- CSS: `dialog { display: flex; }` anulaba el comportamiento por defecto del navegador y el modal se veía al cargar. Solucionado limitando la regla a los `dialog:open`.
- Clic en una carta: el listener de `.contenedor` llama a `showModal()` y a `cargarDetails(element.id)`.
- `cargarDetails`: `fetch` a `/api/cards/:id` con `await`, `json()` con `await` y llamada a `pintarDetails(carta)`, que pinta la imagen (con `alt`) y los datos con `textContent`.
- Listener de «Cerrar» registrado una sola vez en el nivel superior. Antes estaba dentro del clic de cada carta y se acumulaba.
- Limpieza con `details.addEventListener("close", borrarDetails)`. Así se vacía el modal tanto con «Cerrar» como con la tecla Escape; si no, quedaban imágenes duplicadas.
- Cerrar al hacer clic fuera: se probó con `e.target === details`, pero se decidió quitarlo.
- Layout: imagen a la izquierda e info a la derecha (`#imgDetails` y `#infoDetails` al 50%). Modal con `max-width: 90vw`.
- `lang="es"` en `index.html` y `console.log` de depuración eliminado.
- Pendiente: comprobar `respuesta.ok` (404), mostrar los dominios con `join(", ")`, decidir si el fondo del modal es transparente y colocar el botón «Cerrar» centrado debajo del contenido.

### Autenticación con JWT – backend (completada, 04/11/2026)
- Se sustituyó la cookie `session` y la tabla `sessions` por un JWT firmado con `jsonwebtoken`, con caducidad de 1 hora.
- Login: devuelve `{ token, user: { id, username, email, role } }`. El `sub` del token es el id del usuario (como texto) y `JWT_SECRET` se lee del `.env`.
- Logout eliminado: sin estado en el servidor, el cliente borra el token. Nadie lo usaba en el frontend.
- `users.sql`: `DROP TABLE IF EXISTS sessions;` para quitarla también de la base de datos existente.
- Pendiente del paso: el frontend de login y registro, y el middleware que proteja las rutas de colección (lo que se aplica con `Authorization: Bearer <token>`).

## Conceptos vistos
- `fetch` devuelve una promesa; `.json()` también es asíncrono.
- `async`/`await`: `await` espera el valor de la promesa, pero solo dentro de funciones `async` en un script clásico.
- Una función no se ejecuta por existir: hay que llamarla.
- Una promesa no es su valor: si imprimes la variable antes de que llegue la respuesta, verás `Promise { <pending> }`.
- `document.getElementById` localiza un elemento por `id`.
- `addEventListener("click", función)`: el segundo argumento es una función, no un objeto.
- `createElement` crea un elemento en memoria; no aparece hasta `appendChild`.
- `textContent` escribe texto de forma segura; `innerHTML` interpreta HTML.
- Propiedades para elementos nuevos: `id` (único), `className` (reemplaza todas las clases), `classList` (`add`, `remove`, `toggle`), `src` y `alt` en imágenes.
- `getElementsByClassName` devuelve una colección viva sin `forEach`; `querySelectorAll` devuelve una lista estática que sí lo tiene.
- Atributos booleanos como `disabled` y `hidden`: el navegador mira si el atributo existe, no su valor. Por eso `setAttribute("disabled", "false")` deja el botón desactivado. Para quitarlo, `removeAttribute`. Las propiedades `disabled` y `hidden` son booleanas (`true`/`false`).
- `disabled` deja el botón visible pero inactivo; `hidden` lo oculta.
- El `<script>` al final del `<body>` garantiza que `#cartas` ya existe en el DOM.
- `pagination.totalPages` y `offset = (page - 1) * limit`. Número de páginas: `Math.ceil(total / limit)`.
- Rutas relativas (`/api/cards`) frente a absolutas (`http://localhost:3000/api/cards`).
- CSS grid: `repeat(auto-fill, minmax(300px, 1fr))` crea tantas columnas de al menos 300px como quepan y reparte el espacio libre con `fr`.
- `fr` es una fracción del espacio libre, después de descontar medidas fijas y `gap`.
- `object-fit` decide cómo encaja una imagen dentro de su caja. Si la caja ya tiene la proporción de la imagen, no tiene efecto.
- `transform` cambia lo que se ve, pero no el espacio que el elemento reserva en el diseño.
- `aspect-ratio` fija la forma de una caja sin fijar su tamaño.
- `position: absolute` respecto a un padre con `position: relative`; los porcentajes se calculan sobre el padre.
- El orden de `transform: translate(...) rotate(...)` importa: se aplica de derecha a izquierda.
- `<dialog>` está oculto por defecto; `showModal()` lo abre como modal y `close()` lo cierra. Una regla `display` en tu CSS puede anular ese comportamiento.
- Un selector de atributo como `dialog[open]` aplica estilos solo cuando el atributo existe.
- `fetch` y `json()` devuelven promesas: hacen falta dos `await`, uno para cada uno.
- `respuesta.ok` indica si el servidor respondió con éxito (código 200 a 299).
- `dialog` tiene un evento `close` que se dispara con `close()`, con un botón o con la tecla Escape. Es el sitio adecuado para limpiar el modal.
- Un `dialog` abierto con `showModal()` se centra con su `margin: auto` por defecto. Un reset `* { margin: 0 }` lo desplaza.
- Un `dialog` con `display: flex` pone sus hijos en fila. Para apilarlos, `flex-direction: column`.
- `e.target` en un clic indica el elemento que se pulsó. Con un `dialog`, el `target` es el propio dialog si pulsas en el `::backdrop`.

## Errores frecuentes
- Llamar a `pintarCartas()` antes de que llegue la respuesta: `cartas` es `undefined`.
- Concatenar texto en una variable en lugar de crear elementos.
- Usar `datos` cuando lo que necesitas es `datos.data`.
- Pasar un objeto `{ ... }` a `addEventListener` en lugar de una función.
- Escribir `getElementByClassName` en lugar de `getElementsByClassName`.
- Usar `setAttribute("disabled", "false")` para reactivar un botón: el atributo sigue presente.
- Mezclar columnas fijas con `auto-fill` en `grid-template-columns`: las cartas quedan de anchos distintos.
- Asignar `className` cuando quieres añadir una clase: reemplaza las anteriores; usa `classList.add`.
- Esperar que `object-fit` o `transform` cambien el hueco que ocupa un elemento: no lo hacen.
- Dejar valores de prueba en el código (`let pagina = 26;`).
- Escribir una clase en JavaScript con un nombre distinto al de la hoja de estilos (`battlefield_img` frente a `battlefieldImg`): la regla no se aplica y no hay error visible.
- Quitar `await` de `fetch`: `respuesta.json` no existe porque `respuesta` es una promesa.
- Poner `display` en `dialog` sin restringirlo a `[open]`: el modal se ve al cargar la página.
- No vaciar el contenido del modal antes de pintar otra carta: se ven datos de la anterior o se acumulan.
- Registrar un listener dentro de un clic (por ejemplo, el de «Cerrar» dentro del clic de cada carta): cada clic añade otro listener y la acción se repite.
- Limpiar el modal solo en el botón «Cerrar»: al cerrar con Escape no se ejecuta esa limpieza. Usa el evento `close`.
