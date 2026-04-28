import { Cultivo }  from "../ClasesJs/Cultivo.js";
import { Parcela }  from "../ClasesJs/Parcela.js";
import { Granjero } from "../ClasesJs/Granjero.js";
import { saveParcela, loadParcela, saveGranjero, loadGranjero } from "../GestorAlmacenamiento.js";
import { cargarXML, obtenerCatalogo, obtenerNivelHerramienta } from "../gestorXML.js";

//Constantes visuales
const ICONOS = { Tomate:"🍅", Calabaza:"🎃", Berenjena:"🍆", Limon:"🍋", brote:"🌱" };
const ENERGIA_POR_SIEMBRA  = 10;
const RECUPERACION_ENERGIA = { facil:3, normal:5, dificil:10 };

//localStorage helpers
const leerHerramientas = () => JSON.parse(localStorage.getItem("herramientas")) || { azada:1, regadera:1, hoz:1 };
const leerCosecha      = () => JSON.parse(localStorage.getItem("cosecha"))      || { Tomate:0, Calabaza:0, Berenjena:0, Limon:0 };
const guardarCosecha   = c  => localStorage.setItem("cosecha", JSON.stringify(c));

//Efectos de herramientas (datos desde XML)
const nivelDatos  = (id) => obtenerNivelHerramienta(id, leerHerramientas()[id]);
const conRegadera = (t)  => Math.round(t * (nivelDatos("regadera")?.multiplicadorTiempo ?? 1));
const conAzada    = (p)  => Math.round(p * (nivelDatos("azada")?.multiplicadorPrecio    ?? 1));
const conHoz      = ()   => nivelDatos("hoz")?.unidadesCosecha ?? 1;

//Estado inicial
const config       = JSON.parse(localStorage.getItem("config"));
const NUM_PARCELAS = config?.numParcelas ?? 9;
document.getElementById("terreno").style.gridTemplateColumns = `repeat(${Math.sqrt(NUM_PARCELAS)}, 120px)`;

let granjero = loadGranjero();
if (!granjero?.dinero) granjero = new Granjero();
if (!granjero.energiaMax) granjero.energiaMax = granjero.energia;

let parcelas = loadParcela();
if (!parcelas?.length) parcelas = Array.from({ length: NUM_PARCELAS }, (_, i) => new Parcela(i));

let CATALOGO = {};
const get = id => document.getElementById(id);

//Recuperación de energía
setInterval(() => {
    if (granjero.energia >= granjero.energiaMax) return;
    granjero.energia = Math.min(granjero.energia + 1, granjero.energiaMax);
    saveGranjero(granjero);
    if (get("energia"))      get("energia").innerText = granjero.energia;
    if (get("barraEnergia")) get("barraEnergia").style.width = (granjero.energia / granjero.energiaMax * 100) + "%";
}, ((RECUPERACION_ENERGIA[granjero.dificultad] ?? 5)) * 1000);

//Arranque
cargarXML().then(() => {
    CATALOGO = obtenerCatalogo();
    renderizar();
    setInterval(renderizar, 1000);

    get("botonRecargar").onclick = () => {
        ["Tomate","Calabaza","Berenjena","Limon"].forEach(k => granjero.semillas[k] += 10);
        renderizar();
    };
    get("botonTienda").onclick = () => { saveParcela(parcelas); saveGranjero(granjero); location.href = "tienda.html"; };
    get("botonMenu").onclick   = () => { saveParcela(parcelas); saveGranjero(granjero); location.href = "menu.html"; };
}).catch(err => console.error("Error cargando datos.xml:", err));

//Renderizar
function renderizar() {
    // Terreno
    get("terreno").innerHTML = "";
    parcelas.forEach(p => {
        const div = document.createElement("div");
        div.className = "parcela";
        if (p.cultivoActual) {
            div.classList.add(p.cultivoActual.nombre, p.cultivoActual.obtenerFase(p.fechaPlantado));
            div.classList.add(p.estaListo() ? "madura" : "en-crecimiento");
            div.innerHTML = `
                <div>${p.estaListo() ? ICONOS[p.cultivoActual.nombre] : ICONOS.brote}</div>
                <div class="tiempo">${p.estaListo() ? "" : p.tiempoRestante() + "s"}</div>
                <div class="barra"><div class="progreso" style="width:${p.progreso()*100}%"></div></div>`;
        }
        div.onclick = () => gestionarClick(p);
        get("terreno").appendChild(div);
    });

    //Stats
    get("dinero").innerText     = granjero.dinero;
    get("energia").innerText    = granjero.energia;
    get("energiaMax").innerText = granjero.energiaMax;
    get("barraEnergia").style.width = (granjero.energia / granjero.energiaMax * 100) + "%";

    //Info granjero
    const dif = granjero.dificultad || "normal";
    if (get("nombreGranjero"))  get("nombreGranjero").textContent  = granjero.nombre      || "Granjero";
    if (get("nombreGranja"))    get("nombreGranja").textContent    = granjero.nombreGranja || "Mi Granja";
    if (get("badgeDificultad")) {
        get("badgeDificultad").textContent = { facil:"Fácil", normal:"Normal", dificil:"Difícil" }[dif];
        get("badgeDificultad").className   = "badge-dificultad " + dif;
    }

    //Selector e inventario semillas
    const nombres = ["Tomate","Calabaza","Berenjena","Limon"];
    const sel = get("selectorSemillas");
    nombres.forEach((n, i) => sel.options[i].text = `${n} (${granjero.semillas[n]})`);
    nombres.forEach(n => {
        if (get("inv"+n))  get("inv"+n).textContent  = granjero.semillas[n];
        if (get("cose"+n)) get("cose"+n).textContent = leerCosecha()[n];
    });

    //Herramientas: niveles y tooltips
    const herr = leerHerramientas();
    [["Azada","azada"],["Regadera","regadera"],["Hoz","hoz"]].forEach(([label, id]) => {
        if (get("nivel"+label)) get("nivel"+label).textContent = "Nv." + herr[id];
        const el = get("her"+label);
        if (el) el.title = obtenerNivelHerramienta(id, herr[id])?.efecto ?? "";
    });
}

//Click en parcela
function gestionarClick(parcela) {
    const tipo  = get("selectorSemillas").value;
    const aviso = get("mensaje-sistema");
    const msg   = (txt, ms=2000) => { aviso.innerText = txt; setTimeout(() => aviso.innerText = "", ms); };

    if (!parcela.cultivoActual) {
        if (granjero.energia < ENERGIA_POR_SIEMBRA) {
            msg(`Sin energía. Recuperas 1 cada ${RECUPERACION_ENERGIA[granjero.dificultad]??5}s.`, 3000);
        } else if (granjero.semillas[tipo] > 0) {
            granjero.semillas[tipo]--;
            granjero.energia -= ENERGIA_POR_SIEMBRA;
            parcela.plantar(new Cultivo(tipo, conRegadera(CATALOGO[tipo]?.tiempo ?? 10)));
        } else {
            msg(`¡No tienes semillas de ${tipo}!`);
        }
    } else if (parcela.estaListo()) {
        const { nombre } = parcela.cultivoActual;
        const unidades = conHoz();
        const precio   = conAzada(CATALOGO[nombre]?.precioBase ?? 0);

        const cosecha = leerCosecha();
        cosecha[nombre] = (cosecha[nombre] || 0) + unidades;
        guardarCosecha(cosecha);

        const ajustados = JSON.parse(localStorage.getItem("preciosAjustados")) || {};
        ajustados[nombre] = precio;
        localStorage.setItem("preciosAjustados", JSON.stringify(ajustados));

        parcela.cultivoActual = null;
        const extras = [
            unidades > 1 ? ` (x${unidades} gracias a la Hoz)` : "",
            precio > (CATALOGO[nombre]?.precioBase ?? 0) ? ` · ${precio}💰/ud. (Azada activa)` : ""
        ].join("");
        msg(`¡${nombre} cosechado${extras}!`, 3000);
    } else {
        const { nombre } = parcela.cultivoActual;
        const restante = parcela.tiempoRestante();
        parcela.cultivoActual = null;
        msg(`¡${nombre} arrancado antes de madurar! Cultivo perdido. (${restante}s restantes)`, 4000);
    }

    renderizar();
    saveParcela(parcelas);
    saveGranjero(granjero);
}