export function iniciarRangos() {
    document.querySelectorAll(".slider-doble").forEach((contenedor) => {
        const [minimo, maximo] = contenedor.querySelectorAll("input");
        const salida = contenedor.parentElement.querySelector("output");
        const inicio = Number(minimo.min);
        const fin = Number(minimo.max);

        const actualizar = () => {
            const valorMin = Number(minimo.value);
            const valorMax = Number(maximo.value);
            const porcentaje = (valor) => ((valor - inicio) / (fin - inicio)) * 100 + "%";

            minimo.style.zIndex = valorMin > (inicio + fin) / 2 ? 2 : 1;
            maximo.style.zIndex = valorMin > (inicio + fin) / 2 ? 1 : 2;

            salida.textContent = valorMin + " – " + valorMax;
            contenedor.style.setProperty("--desde", porcentaje(valorMin));
            contenedor.style.setProperty("--hasta", porcentaje(valorMax));
        };

        minimo.addEventListener("input", () => {
            if (Number(minimo.value) > Number(maximo.value)) {
                minimo.value = maximo.value;
            }
            actualizar();
        });

        maximo.addEventListener("input", () => {
            if (Number(maximo.value) < Number(minimo.value)) {
                maximo.value = minimo.value;
            }
            actualizar();
        });
        actualizar();
    });
}
