import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual } from "../utils/pagination.js";
import { iniciarDetails } from "../utils/details.js";
import { vaciarCartas, añadirCarta, quitarCarta } from "../cards.js";
import { cabeceraAutorizacion,usuarioLogueado } from "../Auth/auth.js";

let cartas;

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
                    
                }
            });

            quitarCartaBtn.addEventListener("click", async () =>{
                try {
                    await quitarCarta(element.id,element.quantity);
                    vaciarCartas()
                    cargarColeccion(paginaActual());
                } catch (error) {
                    
                }
            });

            if(element.quantity === undefined){
                cartasAñadidas.textContent = 0;
            }else{
                cartasAñadidas.textContent = element.quantity;
            }
            

            funcionesColeccion.appendChild(quitarCartaBtn);
            funcionesColeccion.appendChild(cartasAñadidas);
            funcionesColeccion.appendChild(añadirCartaBtn);
        
            contenedor.appendChild(funcionesColeccion)
        }

        document.getElementById("cartas").appendChild(contenedor);
    });
};