export function iniciarDetails(){
    document.getElementById("cerrarDetails").addEventListener("click", () =>{
        document.getElementById("details").close();
    });

    document.getElementById("details").addEventListener("close",borrarDetails);
}

export async function cargarDetails(cardId) {
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