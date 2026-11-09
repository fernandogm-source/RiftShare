import { actualizarCabecera } from "./utils/header.js";
import { iniciarPaginacion, paginaActual } from "./utils/pagination.js";
import { cargarCartas, vaciarCartas } from "./cards.js";
import { iniciarDetails } from "./utils/details.js";


actualizarCabecera();

iniciarDetails();

iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarCartas(nuevaPagina);
});

cargarCartas(paginaActual());