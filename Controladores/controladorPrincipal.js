import { Cultivo } from "../ClasesJs/Cultivo.js";
import { Parcela } from "../ClasesJs/Parcela.js";
import { Granjero } from "../ClasesJs/Granjero.js";

import { saveParcela } from "../GestorAlmacenamiento.js";
import { loadParcela } from "../GestorAlmacenamiento.js";

import { saveGranjero } from "../GestorAlmacenamiento.js";
import { loadGranjero } from "../GestorAlmacenamiento.js";

document.querySelector("#botonRecargar").addEventListener("click", recargarRecursos);


const CATALOGO = {
    "Tomate": { tiempo: 10, valor: 20 },
    "Calabaza": { tiempo: 20, valor: 40 }
};
const ICONOS = {
    "Tomate": "🍅",
    "Calabaza": "🎃",
    "brote": "🌱"
};



let granjero = loadGranjero();
if(granjero === null){
    granjero = new granjero
}

let parcelas = loadParcela();
if(parcelas === null || parcelas.length == 0){
    parcelas = Array.from({ length: 9 }, (_, i) => new Parcela(i));
}
renderizar(); setInterval(() => renderizar(), 1000);

function renderizar() {
    const contenedor = document.getElementById("terreno");
    contenedor.innerHTML = "";
    const selector = document.getElementById("selectorSemillas");
    selector.options[0].text = `Tomate (Stock: ${granjero.semillas["Tomate"]})`;
    selector.options[1].text = `Calabaza (Stock: ${granjero.semillas["Calabaza"]})`;

    parcelas.forEach(p => {
        const div = document.createElement("div");
        div.className = "parcela";
        if (p.cultivoActual) {
            div.classList.add(p.cultivoActual.nombre, p.cultivoActual.obtenerFase(p.fechaPlantado));
            if (p.estaListo()) div.classList.add("madura");
            div.innerHTML = `<div>${p.estaListo() ? ICONOS[p.cultivoActual.nombre] : ICONOS["brote"]}</div>
                                 <div class="tiempo">${!p.estaListo() ? p.tiempoRestante() + "s" : ""}</div>
                                 <div class="barra"><div class="progreso" style="width:${p.progreso() * 100}%"></div></div>`;
        }
        div.onclick = () => gestionarClick(p);
        contenedor.appendChild(div);
    });
    document.getElementById("dinero").innerText = granjero.dinero;
}

function gestionarClick(parcela) {
    const tipo = document.getElementById("selectorSemillas").value;
    const aviso = document.getElementById("mensaje-sistema");

    if (!parcela.cultivoActual) {
        if (granjero.semillas[tipo] > 0) {
            granjero.semillas[tipo]--;
            parcela.plantar(new Cultivo(tipo, CATALOGO[tipo].tiempo));
            aviso.innerText = "";
        } else {
            aviso.innerText = `¡No tienes semillas de ${tipo}!`;
            setTimeout(() => aviso.innerText = "", 2000);
        }
    } else if (parcela.estaListo()) {
        granjero.dinero += CATALOGO[parcela.cultivoActual.nombre].valor;
        parcela.cultivoActual = null;
    }
    renderizar();
    saveParcela(parcelas);
    saveGranjero(granjero);
}

function recargarRecursos() {
    granjero.semillas["Tomate"] += 10;
    granjero.semillas["Calabaza"] += 10; renderizar();
}

