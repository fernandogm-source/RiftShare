export async function iniciarFiltros(alAplicarFiltros) {
    const formulario = document.getElementById("filtros");

    await cargarOpciones();

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        alAplicarFiltros();
    });

    document.getElementById("limpiarFiltros").addEventListener("click", () => {
        formulario.reset();
        formulario.querySelectorAll('input[type="range"]').forEach((slider) => {
            slider.dispatchEvent(new Event("input"));
        });
        alAplicarFiltros();
    });
}

export function filtrosActuales() {
    const formulario = document.getElementById("filtros");
    const params = new URLSearchParams();

    for (const campo of formulario.elements) {
        if (!campo.name || campo.value === "") continue;
        if (campo.type === "range" && campo.value === campo.defaultValue) continue;

        params.set(campo.name, campo.value);
    }

    return params;
}

async function cargarOpciones() {
    const [filtros, sets, domains] = await Promise.all([
        fetch("/api/filters").then((respuesta) => respuesta.json()),
        fetch("/api/sets").then((respuesta) => respuesta.json()),
        fetch("/api/domains").then((respuesta) => respuesta.json()),
    ]);

    rellenarSelect("filtroSet", sets.map((set) => ({ valor: set.set_id, texto: set.label })));
    rellenarSelect("filtroDomain", domains.map((domain) => ({ valor: domain.name, texto: domain.name })));
    rellenarSelect("filtroRarity", filtros.rarities.map((rarity) => ({ valor: rarity, texto: rarity })));
    rellenarSelect("filtroType", filtros.types.map((type) => ({ valor: type, texto: type })));
}

function rellenarSelect(id, opciones) {
    const select = document.getElementById(id);

    for (const opcion of opciones) {
        const option = document.createElement("option");
        option.value = opcion.valor;
        option.textContent = opcion.texto;
        select.appendChild(option);
    }
}
