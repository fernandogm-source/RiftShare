import { actualizarCabecera } from "../utils/header.js";
import { iniciarPaginacion, pintarPaginacion, paginaActual, reiniciarPaginacion } from "../utils/pagination.js";
import { cabeceraAutorizacion, sesionCaducada } from "../Auth/auth.js";

if (localStorage.getItem("role") !== "Admin") {
    window.location.href = "/index.html";
}

const formulario = document.getElementById("busqueda");
const tabla = document.getElementById("tablaCartas");
const errAdmin = document.getElementById("err-admin");

actualizarCabecera();

iniciarPaginacion((nuevaPagina) => {
    cargarCartas(nuevaPagina);
});

formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    reiniciarPaginacion();
    cargarCartas(paginaActual());
});

cargarCartas(paginaActual());

async function cargarCartas(page) {
    const params = new URLSearchParams({ page, limit: 20 });
    const nombre = document.getElementById("buscarNombre").value.trim();

    if (nombre !== "") {
        params.set("name", nombre);
    }

    try {
        const respuesta = await fetch("/api/admin/cards?" + params, {
            headers: cabeceraAutorizacion()
        });

        if (sesionCaducada(respuesta)) {
            window.location.href = "/Auth/loginForm.html";
            return;
        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.error);
        }

        errAdmin.hidden = true;
        pintarTabla(datos.data);
        pintarPaginacion(datos.pagination.totalPages);
    } catch (error) {
        tabla.textContent = "";
        errAdmin.textContent = error.message;
        errAdmin.hidden = false;
    }
}

function pintarTabla(cartas) {
    tabla.textContent = "";

    const encabezados = [...document.querySelectorAll(".tabla-admin th")].map((th) => th.textContent);

    for (const carta of cartas) {
        const fila = tabla.insertRow();

        fila.insertCell().textContent = carta.name;
        fila.insertCell().textContent = carta.set_id;
        fila.insertCell().textContent = carta.card_type;
        fila.insertCell().textContent = carta.rarity;
        fila.insertCell().textContent = carta.is_active ? "Activa" : "Inactiva";

        const campoPrecio = document.createElement("input");
        campoPrecio.type = "number";
        campoPrecio.step = "0.01";
        campoPrecio.min = "0";
        campoPrecio.value = Number(carta.price).toFixed(2);

        const botonPrecio = document.createElement("button");
        botonPrecio.textContent = "Guardar";
        botonPrecio.addEventListener("click", async () => {
            try {
                await actualizarCarta(carta.id, { price: Number(campoPrecio.value) });
                cargarCartas(paginaActual());
            } catch (error) {
                errAdmin.textContent = error.message;
                errAdmin.hidden = false;
            }
        });

        const celdaPrecio = fila.insertCell();
        celdaPrecio.append(campoPrecio, botonPrecio);

        const boton = document.createElement("button");
        boton.textContent = carta.is_active ? "Desactivar" : "Activar";
        boton.addEventListener("click", async () => {
            try {
                await actualizarCarta(carta.id, { is_active: !carta.is_active });
                cargarCartas(paginaActual());
            } catch (error) {
                errAdmin.textContent = error.message;
                errAdmin.hidden = false;
            }
        });

        fila.insertCell().appendChild(boton);

        [...fila.cells].forEach((celda, indice) => {
            celda.dataset.label = encabezados[indice];
        });
    }
}

async function actualizarCarta(id, cambios) {
    const respuesta = await fetch("/api/admin/cards/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...cabeceraAutorizacion()
        },
        body: JSON.stringify(cambios)
    });

    if (sesionCaducada(respuesta)) {
        window.location.href = "/Auth/loginForm.html";
        return;
    }

    if (!respuesta.ok) {
        const datos = await respuesta.json();
        throw new Error(datos.error);
    }
}
