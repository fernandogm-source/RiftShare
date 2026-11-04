const form = document.getElementById("register");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const contraseña = document.getElementById("contraseña").value;
    
    register(username,email,contraseña);
});