export async function register(username,email,contraseña){
    const respuesta = await fetch("/api/auth/register",{
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify({username,email,contraseña}),
    });
    
    const datos = await respuesta.json();

    if(!respuesta.ok){
        const error = new Error(datos.error);
        error.details = datos.details;
        throw error;
    }
    return datos;
}
export async function login(email, contraseña) {
  const respuesta = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, contraseña }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    const error = new Error(datos.error);
    error.details = datos.details;
    throw error;
  }

  return datos;
}
export function cabeceraAutorizacion() {
    const token = localStorage.getItem("token");

    if (token === null) {
        window.location.href = "/Auth/loginForm.html" ;
        return null;
    }

    return { Authorization: "Bearer " + token };
}
export function usuarioLogueado(){
  const token = localStorage.getItem("token");

  if(token){
    return true;
  }else{
    return false;
  }
}