export function actualizarCabecera(){
    const jwtStorage = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if(jwtStorage !== null && userStorage !== null){
        document.getElementById("menu").hidden = false;
        document.getElementById("headerUsername").hidden = false;
        document.getElementById("toLogout").hidden = false;
        document.getElementById("toLogin").hidden = true;
        
        document.getElementById("headerUsername").textContent = userStorage;
        document.getElementById("menuToggle").hidden = false;
        document.getElementById("perfil").hidden = false;
    }

    document.getElementById("perfil").addEventListener("click", () =>{
        window.location.href = "/Profile/profile.html" ;
    });

    document.getElementById("menuToggle").addEventListener("click", () =>{
        document.getElementById("menu").classList.toggle("abierto");
    });

    document.getElementById("admin").hidden = localStorage.getItem("role") !== "Admin";

    document.getElementById("toLogin").addEventListener("click", () =>{
    window.location.href = "/Auth/loginForm.html" ;
    });
    document.getElementById("logo").addEventListener("click", () =>{
        window.location.href = "/index.html" ;
    });
    document.getElementById("admin").addEventListener("click", () =>{
        window.location.href = "/Admin/admin.html" ;
    });
    document.getElementById("toLogout").addEventListener("click",() =>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "/index.html" ;
    });
    document.getElementById("coleccion").addEventListener("click", () =>{
        window.location.href = "/Collection/collection.html" ;
    });
}