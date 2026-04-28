// gestorXML.js
// Carga datos.xml, lo parsea y expone todos los datos del juego.
// Ningun controlador tiene datos hardcodeados: todos leen desde aqui.

let xmlDoc = null;

// ── Carga del XML ──────────────────────────────────────────────
export async function cargarXML() {
    if (xmlDoc) return xmlDoc;
    const respuesta = await fetch("datos.xml");
    const texto     = await respuesta.text();
    const parser    = new DOMParser();
    xmlDoc = parser.parseFromString(texto, "application/xml");
    return xmlDoc;
}

// ── Helpers internos ───────────────────────────────────────────
function texto(nodo, tag) {
    return nodo.querySelector(tag)?.textContent.trim() ?? "";
}
function numero(nodo, tag) {
    return parseFloat(texto(nodo, tag)) || 0;
}

// ── XPath ──────────────────────────────────────────────────────
// Evalua una expresion XPath sobre xmlDoc y devuelve array de nodos
export function xpath(expresion) {
    const resultado = xmlDoc.evaluate(
        expresion,
        xmlDoc,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    const nodos = [];
    for (let i = 0; i < resultado.snapshotLength; i++) {
        nodos.push(resultado.snapshotItem(i));
    }
    return nodos;
}

// ── Semillas ───────────────────────────────────────────────────
// filtro: "", "precio_asc", "precio_desc", "tiempo_asc", "tiempo_desc",
//         "rentabilidad", "id:Tomate"
export function obtenerSemillas(filtro = "") {
    let nodos;

    // XPath con filtro por id especifico
    if (filtro.startsWith("id:")) {
        const id = filtro.slice(3);
        nodos = xpath(`//semilla[@id='${id}']`);
    } else {
        nodos = xpath("//semilla");
    }

    let semillas = nodos.map(n => ({
        id:               n.getAttribute("id"),
        nombre:           texto(n, "nombre"),
        icono:            texto(n, "icono"),
        tiempoMaduracion: numero(n, "tiempoMaduracion"),
        precioCompra:     numero(n, "precioCompra"),
        cantidadPaquete:  numero(n, "cantidadPaquete"),
        precioVentaBase:  numero(n, "precioVentaBase"),
        descripcion:      texto(n, "descripcion")
    }));

    switch (filtro) {
        case "precio_asc":      semillas.sort((a,b) => a.precioCompra     - b.precioCompra);     break;
        case "precio_desc":     semillas.sort((a,b) => b.precioCompra     - a.precioCompra);     break;
        case "tiempo_asc":      semillas.sort((a,b) => a.tiempoMaduracion - b.tiempoMaduracion); break;
        case "tiempo_desc":     semillas.sort((a,b) => b.tiempoMaduracion - a.tiempoMaduracion); break;
        case "rentabilidad":    semillas.sort((a,b) => b.precioVentaBase  - a.precioVentaBase);  break;
    }

    return semillas;
}

// Catalogo plano { id: { tiempo, precioBase } } para controladorPrincipal
export function obtenerCatalogo() {
    const catalogo = {};
    obtenerSemillas().forEach(s => {
        catalogo[s.id] = { tiempo: s.tiempoMaduracion, precioBase: s.precioVentaBase };
    });
    return catalogo;
}

// ── Herramientas ───────────────────────────────────────────────
export function obtenerHerramientas() {
    const nodos = xpath("//herramienta");
    return nodos.map(h => ({
        id:              h.getAttribute("id"),
        nombre:          texto(h, "nombre"),
        icono:           texto(h, "icono"),
        descripcionBase: texto(h, "descripcionBase"),
        niveles: Array.from(h.querySelectorAll("nivel")).map(n => ({
            numero:              parseInt(n.getAttribute("numero")),
            efecto:              texto(n, "efecto"),
            costeMejora:         numero(n, "costeMejora"),
            multiplicadorPrecio: numero(n, "multiplicadorPrecio") || null,
            multiplicadorTiempo: numero(n, "multiplicadorTiempo") || null,
            unidadesCosecha:     numero(n, "unidadesCosecha")     || null
        }))
    }));
}

// Nivel concreto de una herramienta
export function obtenerNivelHerramienta(herramientaId, numNivel) {
    const herramientas = obtenerHerramientas();
    const herr = herramientas.find(h => h.id === herramientaId);
    return herr?.niveles.find(n => n.numero === numNivel) ?? null;
}
