import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual } from "../utils/pagination.js";
import { iniciarDetails, cargarDetails } from "../utils/details.js";

let cartas;

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
async function añadirCarta(cardId) {
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
        
        cartas = datos.data;

        pintarPaginacion(totalPages);
        pintarColeccion();

    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
}

function pintarColeccion(){
    cartas.forEach(element => {

        const contenedor = document.createElement("div");
        contenedor.id = element.id;
        contenedor.className = "contenedor";
            contenedor.addEventListener("click", () =>{
                document.getElementById("details").showModal();
                cargarDetails(element.id);
            });

        const imagen = document.createElement("img");
        const imgDiv = document.createElement("div");
        imgDiv.className = "imgDiv";
        if(element.card_type === "Battlefield"){
            imagen.classList.add("battlefieldImg");
        }
        imagen.src = element.image_url;
        imagen.alt = element.name;
        imagen.classList.add("imagenCarta");
        imgDiv.appendChild(imagen);
        contenedor.appendChild(imgDiv);

        const nombre = document.createElement("p");
        nombre.textContent = "Nombre: "+element.name;
        nombre.className = "nombre";
        contenedor.appendChild(nombre);

        const tipo = document.createElement("p");
        tipo.textContent = "Tipo: "+element.card_type;
        tipo.className = "tipo";
        contenedor.appendChild(tipo);

        document.getElementById("cartas").appendChild(contenedor);
    });
};

function vaciarCartas(){
    const lista = document.getElementById("cartas");
    while(lista.hasChildNodes()){
        lista.removeChild(lista.firstChild);
    }
};