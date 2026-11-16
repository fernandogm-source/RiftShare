export function formatearPrecio(valor) {
    return Number(valor).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
