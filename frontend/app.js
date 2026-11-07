let cartas;
let pagina = 1;

const jwtStorage = localStorage.getItem("token");
const userStorage = localStorage.getItem("user");

if(jwtStorage !== null && userStorage !== null){
    document.getElementById("menu").hidden = false;
    document.getElementById("headerUsername").hidden = false;
    document.getElementById("toLogout").hidden = false;
    document.getElementById("toLogin").hidden = true;
    
    document.getElementById("headerUsername").textContent = userStorage;
}

async function cargarCartas(page,limit = 12) {
    try {
        const respuesta = await fetch("/api/cards?page="+page+"&limit="+limit);
        if(!respuesta.ok){throw new Error("Error al cargar las cartas");
        }
        document.getElementById("err-cartas").setAttribute("hidden","");
        document.getElementById("paginacion").removeAttribute("hidden");
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
    } catch (error) {
        vaciarCartas();
        document.getElementById("err-cartas").textContent = error.message;
        document.getElementById("err-cartas").removeAttribute("hidden");
        document.getElementById("paginacion").setAttribute("hidden","");
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
    document.getElementById("detailsDominio").textContent = card.domains.join(" , ");
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
document.getElementById("details").addEventListener("close",borrarDetails);
document.getElementById("toLogin").addEventListener("click", () =>{
    window.location.href = "loginForm.html" ;
});
document.getElementById("logo").addEventListener("click", () =>{
    window.location.href = "index.html" ;
});
document.getElementById("toLogout").addEventListener("click",() =>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html" ;
})