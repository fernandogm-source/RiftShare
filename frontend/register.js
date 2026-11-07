import { register } from "./auth.js";

const registerForm = document.getElementById("register");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    limpiarErrores();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const contraseña = document.getElementById("contraseña").value;

    try {
        await register(username, email, contraseña);
        window.location.href = "loginForm.html";
    } catch (error) {
        if (error.details) {
            const errores = {
                username: document.getElementById("err-register-username"),
                email: document.getElementById("err-register-email"),
                contraseña: document.getElementById("err-register-password"),
            };

            error.details.forEach((detalle) => {
                const elemento = errores[detalle.field];
                elemento.textContent = detalle.message;
                elemento.hidden = false;
            });
        }
    }
});

function limpiarErrores(){
    const errores = document.querySelectorAll(".err");

    errores.forEach(element => {
        element.textContent = "";
        element.hidden = true;
    });
}

document.getElementById("logo").addEventListener("click", () =>{
    window.location.href = "index.html" ;
});