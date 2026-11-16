import { actualizarCabecera } from "../utils/header.js";
import { cabeceraAutorizacion, sesionCaducada } from "../Auth/auth.js";
import { formatearPrecio } from "../utils/precio.js";

actualizarCabecera();

const formNombre = document.getElementById("formNombre");
const formPassword = document.getElementById("formPassword");

cargarPerfil();

formNombre.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensajes(["err-nombre", "ok-nombre"]);

    try {
        const datos = await peticion("/api/users/me", "PUT", {
            username: document.getElementById("nombre").value
        });
        guardarSesion(datos);
        mostrar("ok-nombre", "Nombre actualizado");
    } catch (error) {
        mostrarErrores(error, { username: "err-nombre" }, "err-nombre");
    }
});

formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    limpiarMensajes(["err-password", "ok-password"]);

    const nueva = document.getElementById("contraseñaNueva").value;

    if (nueva !== document.getElementById("contraseñaRepetir").value) {
        mostrar("err-password", "Las contraseñas nuevas no coinciden");
        return;
    }

    try {
        const datos = await peticion("/api/users/me/password", "PUT", {
            contraseña_actual: document.getElementById("contraseñaActual").value,
            contraseña_nueva: nueva
        });
        guardarSesion(datos);
        formPassword.reset();
        mostrar("ok-password", "Contraseña actualizada");
    } catch (error) {
        mostrarErrores(error, {}, "err-password");
    }
});

async function cargarPerfil() {
    try {
        const usuario = await peticion("/api/users/me", "GET");

        document.getElementById("nombre").value = usuario.username;
        document.getElementById("perfilEmail").textContent = usuario.email;
        document.getElementById("perfilRol").textContent = usuario.role;
        document.getElementById("perfilPassword").textContent = "********";
        document.getElementById("perfilCartas").textContent = usuario.total_copies;
        document.getElementById("perfilValor").textContent = formatearPrecio(usuario.valor_coleccion);
    } catch (error) {
        mostrar("err-perfil", error.message);
    }
}

async function peticion(url, metodo, cuerpo) {
    const respuesta = await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...cabeceraAutorizacion()
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });

    if (sesionCaducada(respuesta)) {
        window.location.href = "/Auth/loginForm.html";
        throw new Error("Tu sesión ha caducado");
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }

    return datos;
}

function guardarSesion(datos) {
    localStorage.setItem("token", datos.token);
    localStorage.setItem("user", datos.user.username);
    document.getElementById("headerUsername").textContent = datos.user.username;
}

function mostrarErrores(error, mapa, general) {
    if (!error.details) {
        mostrar(general, error.message);
        return;
    }

    for (const detalle of error.details) {
        mostrar(mapa[detalle.field] ?? general, detalle.message);
    }
}

function mostrar(id, texto) {
    const elemento = document.getElementById(id);
    elemento.textContent = texto;
    elemento.hidden = false;
}

function limpiarMensajes(ids) {
    for (const id of ids) {
        const elemento = document.getElementById(id);
        elemento.textContent = "";
        elemento.hidden = true;
    }
}
