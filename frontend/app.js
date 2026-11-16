import { actualizarCabecera } from "./utils/header.js";
import { iniciarPaginacion, paginaActual } from "./utils/pagination.js";
import { cargarCartas, vaciarCartas } from "./cards.js";
import { iniciarDetails } from "./utils/details.js";
import { iniciarRangos } from "./utils/rangos.js";
import { iniciarFiltros } from "./utils/filters.js";
import { reiniciarPaginacion } from "./utils/pagination.js";


actualizarCabecera();

iniciarDetails();

iniciarRangos();

iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarCartas(nuevaPagina);
});

iniciarFiltros(() => {
    reiniciarPaginacion();
    vaciarCartas();
    cargarCartas(paginaActual());
});

cargarCartas(paginaActual());