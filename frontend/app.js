let cartas;
let pagina = 1;

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
};

async function cargarDetails(cardId) {
    const respuesta = await fetch("/api/cards/"+cardId);
    let carta = await respuesta.json();
    pintarDetails(carta);
};

function pintarDetails(card){
    const img = document.createElement("img");
    img.src = card.image_url;
    img.alt = card.name;

    document.getElementById("detailsCarta").textContent = card.name;
    document.getElementById("detailsTipo").textContent = card.card_type;
    document.getElementById("detailsDominio").textContent = card.domains;
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

cargarCartas(pagina);

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
document.getElementById("cerrarDetails").addEventListener("click", () =>{
    document.getElementById("details").close();
});
document.getElementById("toLogin").addEventListener("click", () =>{
    window.location.href = "loginForm.html" ;
});