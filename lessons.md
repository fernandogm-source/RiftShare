# Lecciones – RiftShare

## Estado actual
- Sesiones 1, 2 y 3 completadas.
- Sesión 2 (pintar cartas): micro-pasos 1 a 4 completados. Cada carta es un `div` con `id`, `div.imgDiv` con la `img`, y dos `p` con clases `nombre` y `tipo`.
- Sesión 3 (paginación): completada. Botones «anterior» y «siguiente» con `pagina` como estado, URL con `page` y `limit`, vaciado de `#cartas` antes de repintar, y ocultación de los botones con `hidden` según `totalPages`.
- Trabajo extra completado: los campos de batalla (`card_type === "Battlefield"`) tienen que verse con el mismo tamaño que el resto de cartas. Se usa `position: relative` en `.imgDiv`, `aspect-ratio: 5 / 7`, y `.battlefieldImg` girada 90 grados con `position: absolute`. Comprobado en el navegador.
- Sesión 4 en curso (casi completada): detalle de carta (`/api/cards/:id`) en un modal dentro de `index.html`. Ver registro abajo.
- Autenticación con JWT (backend): completada. Login devuelve `{ token, user }`, tabla `sessions` y ruta de logout eliminadas.
- Validación del backend con Zod: completada. Esquemas en `src/validation/`, middleware `validate` y errores 400 en español.
- Login/registro (frontend): completado, sesión 5 (07/11/2026). Registro y login muestran errores por campo y error general; el login guarda el token en `localStorage`. Comprobado en el navegador: el token se guarda en `localStorage` tras el login. Ver sección Registro.
- Errores de validación por campo: backend devuelve `{ error, details: [{ field, message }] }` (completado). Frontend completado.
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
- Resuelto: frontend de login y registro (sesión 5) y middleware que protege las rutas de colección (ver entrada de middleware más abajo).

### Login y registro – frontend (en curso, 04/11/2026)
- Decisiones tomadas:
  - El token se guarda en `localStorage`.
  - No hay auto-login: tras registrarse, redirigir a `loginForm.html`.
  - Reparto en tres archivos: `auth.js` (solo llamadas a la API, sin DOM), `register.js` y `login.js` (lógica de cada formulario, importan de `auth.js`).
  - `users.js` eliminado. Su clase mezclaba datos guardados sin uso con métodos vacíos.
- HTML hecho: `lang="es"` en las dos páginas; enlaces entre `loginForm.html` y `registerForm.html`; `id="username"` en el registro (antes `nombre`); `id="login"` y `id="register"` en los formularios; `<script type="module">` en cada página.
- `index.html`: el botón «Login» tiene `id="toLogin"`. En `app.js` hay un listener que redirige a `loginForm.html`.
- Hecho:
  - `auth.js` con `register` y `login` exportados. Envían `username`, `email` y `contraseña`, y lanzan un `Error` con `details` si la API los devuelve.
  - `register.js` importa `register`. La variable del formulario se llama `registerForm` para no tapar la función.
  - Limpieza de errores con `limpiarErrores()`: `querySelectorAll(".err")` + `forEach` (`textContent = ""`, `hidden = true`), llamada al principio del `submit`.
  - Backend: los errores de validación devuelven `details` con `field` y `message`.
  - Backend: el controlador de auth lee `contraseña`, igual que el esquema.
- Completado (07/11/2026):
  - `register.js`: el `catch` recorre `error.details` con la tabla `field → <p>`; si no hay `details`, muestra `error.message` en el `<p>` general (`err-register`). Comprobado con formulario vacío (400) y email duplicado (409).
  - `registerForm.html`: `<p id="err-register" class="err" hidden>` antes de `#enviar`.
  - `loginForm.html`: `for` e `id` coinciden (`email`, `contraseña`), y `<p id="err-login" class="err" hidden>` para el error general.
  - `login.js`: `submit` con `login(email, contraseña)`, guarda `datos.token` en `localStorage` con la clave `"token"` y redirige a `index.html`. Errores por campo y general, igual que en el registro.
  - `console.log(datos.token)` de depuración eliminado. Comprobado en el navegador que `localStorage.getItem("token")` devuelve un JWT.

### Middleware de autenticación – backend (07/11/2026)
- `src/middleware/auth.middleware.js` con `requireAuth`: lee `Authorization: Bearer <token>`, verifica con `jwt.verify` y deja `req.user = { id, username, role }`. Sin token o con token no válido/caducado responde 401.
- Aplicado a todas las rutas de `collection.routes.js` con `router.use(requireAuth)`. Las rutas de cartas siguen públicas.
- Comprobado con `curl`: sin token 401, token inválido 401, token válido 200.
- Pendiente de diseño resuelto en el paso siguiente (colección por usuario).

### Colección por usuario – backend (07/11/2026)
- `collection_items` pasa a tener `user_id` (FK a `users`, con `ON DELETE CASCADE`) y clave primaria `(user_id, card_id)`.
- `collection.sql` incluye una migración para tablas ya creadas: `ADD COLUMN IF NOT EXISTS`, borrado de filas sin dueño, `SET NOT NULL` y cambio de clave primaria. Es idempotente.
- `seed.js` ejecuta `users.sql` antes que `collection.sql`, porque la FK necesita la tabla `users`.
- El controlador filtra por `req.user.id` en listado, resumen, alta (`ON CONFLICT (user_id, card_id)`), edición y borrado.
- Comprobado con un script: dos usuarios con la misma carta tienen copias independientes; el borrado y la edición de uno no afectan al otro; sin token 401.
- Nuevo endpoint `GET /api/collection/quantities`: devuelve `{ card_id: cantidad }` del usuario en una sola petición, para pintar las cantidades en el catálogo. Comprobado: devuelve las cantidades, 401 sin token y `{}` tras borrar.
  - `AGENTS.md`: ya no menciona `users.js`.

### Módulos compartidos y paginación (09/11/2026)
- Cabecera en `header.js`: `actualizarCabecera()` lee `token` y `user` dentro de la función (no al importar), muestra u oculta los botones y registra los listeners de `#toLogin`, `#logo` y `#toLogout`. `app.js` la importa y la llama. Pendiente: el listener de `#coleccion`.
- Paginación en `pagination.js` (opción 3): el módulo guarda `pagina` y `totalPaginas`, y expone `iniciarPaginacion(alCambiarPagina)`, `pintarPaginacion(total)` y `paginaActual()`. `app.js` pasa un callback que vacía las cartas y llama a `cargarCartas(nuevaPagina)`.
- Conceptos practicados: `export`/`import` entre archivos, función como parámetro (callback), `hidden` con valores booleanos (`hidden = pagina === 1`).
- Errores encontrados y corregidos: importar `Paginacion` después de renombrar la función a `pintarPaginacion`; dos `import` del mismo nombre en `app.js` (error de identificador duplicado); usar `page` sin recibirlo; llamar a la firma antigua `pintarPaginacion(page, totalPages)`; `iniciarPaginacion` sin llamar, que deja los botones sin efecto.
- Pendiente de decidir: qué hacer si falla la carga después de cambiar de página, y bloquear los clics mientras se carga.
- Comprobado en el navegador: la paginación funciona con el módulo `pagination.js`.
- Pendiente de implementar: `collectionDOM.js` (vacío) y `collection.html`, que todavía carga `app.js` en lugar de su propio script.
- Pendientes menores: `cargarDetails` con `catch` vacío, constante `CARTAS_POR_PAGINA` en lugar de `limit = 12`, y el mismo `hidden` en `pintarPaginacion` para todas las líneas.

### Decisión de frontend – colección en un solo archivo (09/11/2026)
- Se descarta la separación `collectionAPI.js` / `collectionDOM.js`. La colección usa un único `collection.js`, que hace las llamadas a la API y pinta el DOM.
- `collectionAPI.js` y `collectionDOM.js` eliminados. `collection.html` carga `collection.js`.
- `AGENTS.md` actualizado con la nueva convención.
- Pendiente en `collection.js`: `cargarDetails` (ya importado), `añadirCarta` sin usar, redirección a `loginForm.html` si no hay token, y `limit = 12` pendiente de constante.

### Reorganización de carpetas del frontend (09/11/2026)
- Estructura: `index.html`, `app.js`, `cards.js` y `style.css` en la raíz; `Auth/` (login y registro), `Collection/` (colección), `utils/` (`header.js`, `pagination.js`, `details.js`) e `img/` (logo y favicon).
- Imports corregidos a `./utils/...` en `app.js` y `cards.js`, y a `../utils/...` en `Collection/collection.js`. `collection.js` ahora importa y llama a `iniciarDetails()` y `cargarDetails`.
- Rutas absolutas desde la raíz de `frontend/` (`/style.css`, `/img/RiftShare-cropped.svg`, `/Auth/loginForm.html`, `/index.html`), para que funcionen desde cualquier carpeta. `AGENTS.md` actualizado.
- Conceptos practicados: rutas relativas frente a absolutas y cómo cambian al mover archivos entre carpetas.
- Pendiente: comprobar en el navegador las cuatro páginas tras el cambio.

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
- `e.preventDefault()` en un `submit` evita que el navegador recargue la página con el envío normal del formulario.
- `window.location.href = "pagina.html";` navega a otra página. Es una propiedad: se asigna con `=`, sin paréntesis.
- Las rutas relativas (`loginForm.html`) se resuelven desde la página actual; las dos páginas de auth están en `frontend/`, así que funcionan sin `/`.
- `localStorage.setItem(clave, valor)` guarda texto que persiste entre recargas. Solo guarda cadenas.
- `import { funcion } from "./archivo.js";` solo funciona en scripts con `type="module"`.
- Un objeto puede tener propiedades nuevas en cualquier momento: `error.details = datos.details;` añade `details` a un `Error` ya creado.
- Un objeto puede servir de tabla de correspondencia: `errores[detalle.field]` busca el `<p>` según el nombre que manda el backend. Con corchetes, porque la clave está en una variable.
- `querySelectorAll(".err")` usa selectores CSS (con punto para clases) y devuelve una lista con `forEach`.
- Zod define esquemas (`z.object`, `z.string().min(...)`, `z.coerce.number()`) y valida con `parse` (lanza `ZodError`) o `safeParse` (devuelve `{ success, data/error }`).
- `z.coerce.number()` convierte los strings de la query (`"2"` → `2`); `.int()` y `.min()`/`.max()` validan el resultado.
- En Express 5 `req.query` es un getter de solo lectura: no se puede reasignar. El middleware guarda la query validada en `req.validatedQuery`.

## Errores frecuentes
- Llamar a `pintarCartas()` antes de que llegue la respuesta: `cartas` es `undefined`.
- Concatenar texto en una variable en lugar de crear elementos.
- Usar `datos` cuando lo que necesitas es `datos.data`.
- Pasar un objeto `{ ... }` a `addEventListener` en lugar de una función.
- Escribir `getElementByClassName` en lugar de `getElementsByClassName`.
- Llamar `querySelectorAll("err")` en vez de `".err"`: busca etiquetas `<err>`, no la clase.
- Dar a una variable el mismo nombre que una función importada (`const register = document.getElementById(...)` con `import { register }`): la función queda tapada y da `register is not a function`.
- Escribir `error.details.forEach` sin comprobar antes que `details` existe: un 409 o un fallo de red no lo traen.
- Usar `setAttribute("disabled", "false")` para reactivar un botón: el atributo sigue presente.
- Mezclar columnas fijas con `auto-fill` en `grid-template-columns`: las cartas quedan de anchos distintos.
- Asignar `className` cuando quieres añadir una clase: reemplaza las anteriores; usa `classList.add`.
- Esperar que `object-fit` o `transform` cambien el hueco que ocupa un elemento: no lo hacen.
- Dejar valores de prueba en el código (`let pagina = 26;`).
- Llamar a un método como si fuera una función suelta (`register(...)` en lugar de `user.register(...)` o una función exportada). Da `ReferenceError`.
- Escribir `window.location.href(...)` con paréntesis, o `href = (loginForm.html)` sin comillas: la variable no existe y la redirección falla.
- Escribir una clase en JavaScript con un nombre distinto al de la hoja de estilos (`battlefield_img` frente a `battlefieldImg`): la regla no se aplica y no hay error visible.
- Quitar `await` de `fetch`: `respuesta.json` no existe porque `respuesta` es una promesa.
- Poner `display` en `dialog` sin restringirlo a `[open]`: el modal se ve al cargar la página.
- No vaciar el contenido del modal antes de pintar otra carta: se ven datos de la anterior o se acumulan.
- Registrar un listener dentro de un clic (por ejemplo, el de «Cerrar» dentro del clic de cada carta): cada clic añade otro listener y la acción se repite.
- Limpiar el modal solo en el botón «Cerrar»: al cerrar con Escape no se ejecuta esa limpieza. Usa el evento `close`.
- Intentar reasignar `req.query` en Express 5: es un getter de solo lectura; usa `req.validatedQuery` o el valor devuelto por `parse`.
- Validar con Zod pero seguir usando el dato original: hay que usar el resultado de `parse` (ya convertido y transformado), no `req.body`/`req.query` sin validar.

### Documentación – AGENTS.md actualizado (07/11/2026)
- Se corrigieron las secciones desactualizadas: auth con JWT en lugar de cookie de sesión, token en `localStorage`, `app.js` ya no está vacío, SVG movido a `frontend/`, campo `username` en el registro y sesiones eliminadas en cada reseed.
- Se añadió `JWT_SECRET` como variable requerida en `backend/.env` y se documentó el reparto previsto de `auth.js`, `login.js` y `register.js`.

### Validación con Zod – backend (07/11/2026)
- Se instaló `zod` y se creó `src/validation/` con esquemas para auth, cartas y colección, más el middleware `validate`.
- El middleware guarda la query validada en `req.validatedQuery` porque en Express 5 `req.query` es un getter de solo lectura.
- Los controladores ya no validan a mano: auth, cartas y colección usan datos validados.
- `cards.query.js` dejó de validar y convertir números; ahora solo construye filtros y calcula el offset con datos ya validados.
- Comprobado con `curl`: registro/login, filtros, paginación, detalle de carta y colección; los errores devuelven 400 con mensajes en español.

### Decisiones de frontend – colección (07/11/2026)
- Se descartó el refactor de la app (`auth.js` → `authApi.js`, `app.js` dividido en módulos) y se volvió al commit `3569646` con `git reset --hard`. No había trabajo sin commitear fuera del refactor.
- Nombres para la colección: `collection.html`, `collectionAPI.js` (solo API) y `collectionDOM.js` (página, sin `fetch` directo).
- Pendiente, en un paso aparte: decidir si los archivos existentes (`auth.js`, `login.js`, `register.js`) se renombran al mismo patrón.
- Pendiente: decidir cómo se pinta la cabecera en `collection.html` (copia o módulo común).

### Sesión 5 – Login y registro en el frontend (completada, 07/11/2026)
- Registro y login con el mismo patrón: `try`/`catch`, mapa `field → <p>` para los errores de `details` y `<p>` general para el resto.
- El usuario escribió `catch` y `submit` de `register.js` y `login.js` a partir de pistas, y detectó errores de ids y de estado (`errGeneral` antes de existir en el HTML).
- Token guardado en `localStorage` tras el login.
- Cerrado: `console.log` de depuración eliminado y token comprobado en el navegador.
