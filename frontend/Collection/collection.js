import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual } from "../utils/pagination.js";
import { iniciarDetails } from "../utils/details.js";
import { vaciarCartas, pintarCartas } from "../cards.js";
import { cabeceraAutorizacion,usuarioLogueado } from "../Auth/auth.js";

actualizarCabecera();

iniciarDetails();

iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarColeccion(nuevaPagina);
});

cargarColeccion(paginaActual());

async function cargarColeccion(page = 1,limit = 12) {
    
    const cabecera = cabeceraAutorizacion();
    
    if(cabecera === null){
        return
    };

    try{
        const respuesta = await fetch("/api/collection"+"?page="+page+"&limit="+limit, {
            method: "GET",
            headers: {
                ...cabecera
            }
        });
        const datos = await respuesta.json();

        if(!respuesta.ok){
            const error = new Error(datos.error);
            error.details = datos.details;
            throw error;
        }

        document.getElementById("err-cartas").textContent = "";
        document.getElementById("err-cartas").hidden = true;

        let totalPages = datos.pagination.totalPages;
        
        let cartas = datos.data;

        pintarPaginacion(totalPages);
        pintarCartas(cartas,usuarioLogueado());

    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
}