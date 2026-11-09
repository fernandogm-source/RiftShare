let pagina = 1;
let totalPaginas = 1;

export function iniciarPaginacion(alCambiarPagina) {
    document.getElementById("anterior").addEventListener("click", () => {
        if (pagina > 1) {
            pagina--;
            alCambiarPagina(pagina);
        }
    });

    document.getElementById("siguiente").addEventListener("click", () => {
        if (pagina < totalPaginas) {
            pagina++;
            alCambiarPagina(pagina);
        }
    });
}

export function pintarPaginacion(total) {
    totalPaginas = total;

    document.getElementById("anterior").hidden = pagina === 1;
    document.getElementById("siguiente").hidden = pagina >= totalPaginas;
    document.getElementById("paginacion").hidden = totalPaginas <= 1;
}

export function paginaActual() {
    return pagina;
}