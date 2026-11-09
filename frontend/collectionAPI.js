function cabeceraAutorizacion() {
    const token = localStorage.getItem("token");

    if (token === null) {
        throw new Error("No hay sesión iniciada");
    }

    return { Authorization: "Bearer " + token };
}
export async function añadirCarta(cardId) {
    const respuesta = await fetch("/api/collection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...cabeceraAutorizacion()
        },
        body: JSON.stringify({ card_id: cardId })
    });
    
    const datos = await respuesta.json();
    
    if(!respuesta.ok){
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }
    
    return datos;
    
}
export async function listarColeccion(page = 1,limit = 12) {
    
    const respuesta = await fetch("/api/collection"+"?page="+page+"&limit="+limit, {
        method: "GET",
        headers: {
            ...cabeceraAutorizacion()
        }
    });
    
    const datos = await respuesta.json();
    
    if(!respuesta.ok){
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }

    return datos;
}