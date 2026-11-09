

export function actualizarCabecera(){
    const jwtStorage = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if(jwtStorage !== null && userStorage !== null){
        document.getElementById("menu").hidden = false;
        document.getElementById("headerUsername").hidden = false;
        document.getElementById("toLogout").hidden = false;
        document.getElementById("toLogin").hidden = true;
        
        document.getElementById("headerUsername").textContent = userStorage;
    }

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
}

