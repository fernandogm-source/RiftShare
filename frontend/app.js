let cartas;
let pagina = 26;

async function cargarCartas(page,limit = 12) {
    const respuesta = await fetch("/api/cards?page="+page+"&limit="+limit);
    const datos = await respuesta.json();
    cartas = datos.data;
    let totalPages = datos.pagination.totalPages;
    if(page <= 1 || page === 0){
        document.getElementById("anterior").setAttribute("hidden","");
    }else{
        document.getElementById("anterior").removeAttribute("hidden");
    }
    if(page >= totalPages || page === 0){
        document.getElementById("siguiente").setAttribute("hidden","");
    }else{
        document.getElementById("siguiente").removeAttribute("hidden");
    }
    pintarCartas();
    console.log(cartas);
};

cargarCartas(pagina);

function pintarCartas(){
    cartas.forEach(element => {

        const contenedor = document.createElement("div");
        contenedor.id = element.id;
        contenedor.className = "contenedor";

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
}

document.getElementById("siguiente").addEventListener("click",() => {
    vaciarCartas();
    pagina = pagina + 1;
    cargarCartas(pagina);
});

document.getElementById("anterior").addEventListener("click",() => {
    if (pagina>1) {
        vaciarCartas();
        pagina = pagina - 1;
        cargarCartas(pagina);
    }
});