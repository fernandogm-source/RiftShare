import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual } from "../utils/pagination.js";
import { iniciarDetails, cargarDetails } from "../utils/details.js";
import { vaciarCartas, pintarCartas } from "../cards.js";

actualizarCabecera();

iniciarDetails();

iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarColeccion(nuevaPagina);
});

cargarColeccion(paginaActual());

function cabeceraAutorizacion() {
    const token = localStorage.getItem("token");

    if (token === null) {
        throw new Error("No hay sesión iniciada");
    }

    return { Authorization: "Bearer " + token };
}
export async function añadirCarta(cardId) {
    const respuesta = await fetch("/api/collection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...cabeceraAutorizacion()
        },
        body: JSON.stringify({ card_id: cardId })
    });
    
    const datos = await respuesta.json();
    
    if(!respuesta.ok){
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }
    
    return datos;
    
}
async function cargarColeccion(page = 1,limit = 12) {
    try{
        const respuesta = await fetch("/api/collection"+"?page="+page+"&limit="+limit, {
            method: "GET",
            headers: {
                ...cabeceraAutorizacion()
            }
        });
        const datos = await respuesta.json();

        if(!respuesta.ok){
            const error = new Error(datos.error);
            error.details = datos.details;
            throw error;
        }

        let totalPages = datos.pagination.totalPages;
        
        let cartas = datos.data;

        pintarPaginacion(totalPages);
        pintarCartas(cartas);

    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
}