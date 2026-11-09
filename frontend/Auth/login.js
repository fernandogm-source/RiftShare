import { login } from "./auth.js";

const loginForm = document.getElementById("login");
const errGeneral = document.getElementById("err-login");

document.getElementById("logo").addEventListener("click", () =>{
    window.location.href = "/index.html" ;
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    limpiarErrores();

    const email = document.getElementById("email").value;
    const contraseña = document.getElementById("contraseña").value;

    try {
        const datos = await login(email, contraseña);
        localStorage.setItem("token",datos.token);
        localStorage.setItem("user",datos.user.username);
        window.location.href = "/index.html";
    } catch (error) {
        if (error.details) {
            const errores = {
                email: document.getElementById("err-login-email"),
                contraseña: document.getElementById("err-login-password"),
            };

            error.details.forEach((detalle) => {
                const elemento = errores[detalle.field];
                elemento.textContent = detalle.message;
                elemento.hidden = false;
            });
        }else{
            errGeneral.textContent = error.message;
            errGeneral.hidden = false;
        }
    }
});

function limpiarErrores(){
    const errores = document.querySelectorAll(".err");

    errGeneral.hidden = true;

    errores.forEach(element => {
        element.textContent = "";
        element.hidden = true;
    });
}