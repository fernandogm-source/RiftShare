import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual, reiniciarPaginacion } from "../utils/pagination.js";
import { iniciarDetails, cargarDetails } from "../utils/details.js";
import { vaciarCartas, añadirCarta, quitarCarta } from "../cards.js";
import { cabeceraAutorizacion,usuarioLogueado, sesionCaducada } from "../Auth/auth.js";
import { iniciarRangos } from "../utils/rangos.js";
import { iniciarFiltros, filtrosActuales } from "../utils/filters.js";
import { formatearPrecio } from "../utils/precio.js";

let cartas;

actualizarCabecera();

iniciarDetails();

iniciarRangos();

iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarColeccion(nuevaPagina);
});

iniciarFiltros(() => {
    reiniciarPaginacion();
    vaciarCartas();
    cargarColeccion(paginaActual());
});

cargarColeccion(paginaActual());

async function cargarColeccion(page = 1,limit = 12) {
    
    const cabecera = cabeceraAutorizacion();
    
    if(cabecera === null){
        return
    };

    try{
        const params = filtrosActuales();
        params.set("page", page);
        params.set("limit", limit);

        const respuesta = await fetch("/api/collection?" + params, {
            method: "GET",
            headers: {
                ...cabecera
            }
        });
        const datos = await respuesta.json();

        if (sesionCaducada(respuesta)) {
            window.location.href = "/Auth/loginForm.html";
            return;
        }

        if(!respuesta.ok){
            const error = new Error(datos.error);
            error.details = datos.details;
            throw error;
        }

        const errCartas = document.getElementById("err-cartas");
        errCartas.textContent = datos.pagination.total === 0 ? "No hay cartas con esos filtros" : "";
        errCartas.hidden = datos.pagination.total !== 0;

        let totalPages = datos.pagination.totalPages;
        
        cartas = datos.data;

        pintarPaginacion(totalPages);
        pintarColeccion(usuarioLogueado());

    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
}

export function pintarColeccion( logued ){
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
                    cargarColeccion(paginaActual());
                } catch (error) {
                    document.getElementById("err-cartas").textContent = error.message;
                    document.getElementById("err-cartas").hidden = false;
                    document.getElementById("paginacion").hidden = true;
                }
            });

            quitarCartaBtn.addEventListener("click", async () =>{
                try {
                    await quitarCarta(element.id,element.quantity);
                    vaciarCartas()
                    cargarColeccion(paginaActual());
                } catch (error) {
                    document.getElementById("err-cartas").textContent = error.message;
                    document.getElementById("err-cartas").hidden = false;
                    document.getElementById("paginacion").hidden = true;
                }
            });

            if(element.quantity === undefined){
                cartasAñadidas.textContent = 0;
            }else{
                cartasAñadidas.textContent = element.quantity;
            }

            añadirCartaBtn.disabled = element.quantity === 99;
            

            funcionesColeccion.appendChild(quitarCartaBtn);
            funcionesColeccion.appendChild(cartasAñadidas);
            funcionesColeccion.appendChild(añadirCartaBtn);
        
            contenedor.appendChild(funcionesColeccion)
        }

        document.getElementById("cartas").appendChild(contenedor);
    });
};