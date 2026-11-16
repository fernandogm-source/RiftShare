import { pintarPaginacion, paginaActual } from "./utils/pagination.js";
import { cargarDetails } from "./utils/details.js";
import { usuarioLogueado, cabeceraAutorizacion, sesionCaducada } from "./Auth/auth.js";
import { filtrosActuales } from "./utils/filters.js";
import { formatearPrecio } from "./utils/precio.js";

let cartas;
let cantidades= {};

async function cargarCantidades() {
    if (!usuarioLogueado()) {
        cantidades = {};
        return;
    }

    try {
        const respuesta = await fetch("/api/collection/quantities", {
            headers: cabeceraAutorizacion()
        });

        sesionCaducada(respuesta);

        if (!respuesta.ok) {
            throw new Error("Error al cargar las cantidades");
        }

        cantidades = await respuesta.json();
    } catch (error) {
        cantidades = {};
    }
}

export async function cargarCartas(page,limit = 12) {
    try {
        const params = filtrosActuales();
        params.set("page", page);
        params.set("limit", limit);

        const respuesta = await fetch("/api/cards?" + params);
        if(!respuesta.ok){throw new Error("Error al cargar las cartas");
        }
        const datos = await respuesta.json();
        const errCartas = document.getElementById("err-cartas");
        errCartas.textContent = datos.pagination.total === 0 ? "No hay cartas con esos filtros" : "";
        errCartas.hidden = datos.pagination.total !== 0;
        cartas = datos.data;
        let totalPages = datos.pagination.totalPages;
        
        await cargarCantidades();

        pintarPaginacion(totalPages);

        pintarCartas(usuarioLogueado());
    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
};

export function pintarCartas(logued){
    cartas.forEach(element => {

        const contenedor = document.createElement("div");
        contenedor.id = element.id;
        contenedor.className = "contenedor";

        const imagen = document.createElement("img");
        const imgDiv = document.createElement("div");
        imgDiv.className = "imgDiv";
        imgDiv.addEventListener("click", () =>{
                document.getElementById("details").showModal();
                cargarDetails(element.id);
            });
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

        const rareza = document.createElement("p");
        rareza.textContent = "Rareza: "+element.rarity;
        rareza.className = "rareza";
        contenedor.appendChild(rareza);

        const precio = document.createElement("p");
        precio.textContent = "Precio: "+formatearPrecio(element.price);
        precio.className = "precio";
        contenedor.appendChild(precio);

        if(logued === true){
            const funcionesColeccion = document.createElement("div");
            const quitarCartaBtn = document.createElement("button");
            const cartasAñadidas = document.createElement("span");
            const añadirCartaBtn = document.createElement("button");
           

            funcionesColeccion.classList.add("funcionesColeccion");
            añadirCartaBtn.classList.add("btn");
            quitarCartaBtn.classList.add("btn");
            cartasAñadidas.classList.add("numeroCartas");

            añadirCartaBtn.id = "funcionAñadirColeccion_"+ element.id;
            quitarCartaBtn.id = "funcionQuitarColeccion_"+ element.id;

            añadirCartaBtn.textContent = "+";
            quitarCartaBtn.textContent = "-";

            añadirCartaBtn.addEventListener("click", async () =>{
                try {
                    await añadirCarta(element.id);
                    vaciarCartas()
                    cargarCartas(paginaActual());
                } catch (error) {
                    document.getElementById("err-cartas").textContent = error.message;
                    document.getElementById("err-cartas").hidden = false;
                    document.getElementById("paginacion").hidden = true;
                }
            });

            quitarCartaBtn.addEventListener("click", async () =>{
                            try {
                                await quitarCarta(element.id,cantidades[element.id]);
                                vaciarCartas()
                                cargarCartas(paginaActual());
                            } catch (error) {
                                document.getElementById("err-cartas").textContent = error.message;
                                document.getElementById("err-cartas").hidden = false;
                                document.getElementById("paginacion").hidden = true;
                            }
                        });

            const cantidad = cantidades[element.id] ?? 0;
            cartasAñadidas.textContent = cantidad;
            quitarCartaBtn.disabled = cantidad === 0;
            añadirCartaBtn.disabled = cantidad === 99;

            funcionesColeccion.appendChild(quitarCartaBtn);
            funcionesColeccion.appendChild(cartasAñadidas);
            funcionesColeccion.appendChild(añadirCartaBtn);
        
            contenedor.appendChild(funcionesColeccion)
        }

        document.getElementById("cartas").appendChild(contenedor);
    });
};

export function vaciarCartas(){
    const lista = document.getElementById("cartas");
    while(lista.hasChildNodes()){
        lista.removeChild(lista.firstChild);
    }
};

export async function añadirCarta(cardId) {

    const cabecera = cabeceraAutorizacion();
    
    if(cabecera === null){
        return
    };

    const respuesta = await fetch("/api/collection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...cabecera
        },
        body: JSON.stringify({ card_id: cardId, quantity: 1 })
    });
    
    const datos = await respuesta.json();
    
    if(!respuesta.ok){
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }
    
    return datos;
    
};

export async function quitarCarta(cardId, cantidadActual) {

    const cabecera = cabeceraAutorizacion();

    if(cabecera === null){
        return
    };

    if(cantidadActual > 1){
        const respuesta = await fetch("/api/collection/" + cardId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...cabecera
            },
            body: JSON.stringify({ quantity: cantidadActual - 1 })
        });

        const datos = await respuesta.json();

        if(!respuesta.ok){
            const error = new Error(datos.error);
            error.details = datos.details;
            throw error;
        }

        return datos;
    }

    const respuesta = await fetch("/api/collection/" + cardId, {
        method: "DELETE",
        headers: {
            ...cabecera
        }
    });

    if(!respuesta.ok){
        throw new Error("No se pudo quitar la carta");
    }

    return null;
};