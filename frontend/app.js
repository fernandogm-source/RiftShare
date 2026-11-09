import { actualizarCabecera } from "./header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual } from "./pagination.js";

let cartas;

actualizarCabecera();
iniciarPaginacion((nuevaPagina) => {
    vaciarCartas();
    cargarCartas(nuevaPagina);
});
cargarCartas(paginaActual());

async function cargarCartas(page,limit = 12) {
    try {
        const respuesta = await fetch("/api/cards?page="+page+"&limit="+limit);
        if(!respuesta.ok){throw new Error("Error al cargar las cartas");
        }
        document.getElementById("err-cartas").setAttribute("hidden","");
        const datos = await respuesta.json();
        cartas = datos.data;
        let totalPages = datos.pagination.totalPages;
        
        pintarPaginacion(totalPages);

        pintarCartas();
    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").hidden = false;
        document.getElementById("paginacion").hidden = true;
    }
    
};

async function cargarDetails(cardId) {
    try {
        const respuesta = await fetch("/api/cards/"+cardId);
        if(!respuesta.ok){throw new Error("Error al cargar los detalles");};
        let carta = await respuesta.json();
        pintarDetails(carta);
    } catch (error) {
        
    }
    
};

function pintarDetails(card){
    borrarDetails();
    const img = document.createElement("img");
    img.src = card.image_url;
    img.alt = card.name;

    document.getElementById("detailsCarta").textContent = card.name;
    document.getElementById("detailsTipo").textContent = card.card_type;
    document.getElementById("detailsDominio").textContent = card.domains.join(", ");
    document.getElementById("detailsRareza").textContent = card.rarity;
    document.getElementById("detailsTexto").textContent = card.accessibility_text;

    document.getElementById("imgDetails").appendChild(img);
};

function borrarDetails(){
    const img = document.getElementById("imgDetails");
    while(img.hasChildNodes()){
        img.removeChild(img.firstChild);
    }
    document.getElementById("detailsCarta").textContent = "";
    document.getElementById("detailsTipo").textContent = "";
    document.getElementById("detailsDominio").textContent = "";
    document.getElementById("detailsRareza").textContent = "";
    document.getElementById("detailsTexto").textContent = "";
}

function pintarCartas(){
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

document.getElementById("cerrarDetails").addEventListener("click", () =>{
    document.getElementById("details").close();
});

document.getElementById("details").addEventListener("close",borrarDetails);