let cartas;

async function cargarCartas() {
    const respuesta = await fetch("/api/cards");
    const datos = await respuesta.json();
    cartas = datos.data;
    pintarCartas();
    console.log(cartas);
}

cargarCartas();

function pintarCartas(){
    cartas.forEach(element => {

        const contenedor = document.createElement("div");
        contenedor.id = element.id;
        contenedor.className = "contenedor";

        const imagen = document.createElement("img");
        imagen.src = element.image_url;
        imagen.alt = element.name;
        imagen.className = "imagenCarta";
        contenedor.appendChild(imagen);

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
}