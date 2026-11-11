import { pintarPaginacion } from "./utils/pagination.js";
import { cargarDetails } from "./utils/details.js";

export async function cargarCartas(page,limit = 12) {
    try {
        const respuesta = await fetch("/api/cards?page="+page+"&limit="+limit);
        if(!respuesta.ok){throw new Error("Error al cargar las cartas");
        }
        document.getElementById("err-cartas").setAttribute("hidden","");
        const datos = await respuesta.json();
        let cartas = datos.data;
        let totalPages = datos.pagination.totalPages;
        
        pintarPaginacion(totalPages);

        pintarCartas(cartas);
    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
    
};

export function pintarCartas(array){
    array.forEach(element => {

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

export function vaciarCartas(){
    const lista = document.getElementById("cartas");
    while(lista.hasChildNodes()){
        lista.removeChild(lista.firstChild);
    }
};