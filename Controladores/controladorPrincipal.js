import { Cultivo } from "../ClasesJs/Cultivo.js";
import { Parcela } from "../ClasesJs/Parcela.js";
import { Granjero } from "../ClasesJs/Granjero.js";

import { saveParcela } from "../GestorAlmacenamiento.js";
import { loadParcela } from "../GestorAlmacenamiento.js";

import { saveGranjero } from "../GestorAlmacenamiento.js";
import { loadGranjero } from "../GestorAlmacenamiento.js";

// Evento para el botón de recargar las semillas
document.querySelector("#botonRecargar").addEventListener("click", recargarRecursos);


const CATALOGO = {
    "Tomate": { tiempo: 10, valor: 20 },
    "Calabaza": { tiempo: 20, valor: 40 },
    "Berenjena": { tiempo: 30, valor: 60 }
};
const ICONOS = {
    "Tomate": "🍅",
    "Calabaza": "🎃",
    "Berenjena": "🍆",
    "brote": "🌱"
};

//Intenta cargar al granjero. Si no existe, crea uno nuevo con new Granjero().
let granjero = loadGranjero();
if(granjero === null){
    granjero = new Granjero()
}

//Si no hay parcelas guardadas, crea un array de 9 parcelas nuevas usando Array.from.
let parcelas = loadParcela();
if(parcelas === null || parcelas.length == 0){
    parcelas = Array.from({ length: 9 }, (_, i) => new Parcela(i));
}
//Ejecuta renderizar() y luego cada 1 segundo (setInterval) para que el tiempo restante y las barras de progreso se actualicen solas.
renderizar(); setInterval(() => renderizar(), 1000);

function renderizar() {
    const contenedor = document.getElementById("terreno");
    contenedor.innerHTML = ""; //vaciar completamente todo el contenido que haya dentro de ese contenedor.

    //Actualizamos el texto del selector de semillas para mostrar el stock actual
    const selector = document.getElementById("selectorSemillas");
    selector.options[0].text = `Tomate (Stock: ${granjero.semillas["Tomate"]})`;
    selector.options[1].text = `Calabaza (Stock: ${granjero.semillas["Calabaza"]})`
    selector.options[2].text = `Berenjena (Stock: ${granjero.semillas["Berenjena"]})`;

    //Se crea cada una de las 9 parcelas
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
    document.getElementById("dinero").innerText = granjero.dinero; // Actualizamos el marcador de dinero
}

function gestionarClick(parcela) {
    const tipo = document.getElementById("selectorSemillas").value;
    const aviso = document.getElementById("mensaje-sistema");
    const PROBABILIDAD_FALLO = 0.5; 

if (!parcela.cultivoActual) {
    if (granjero.semillas[tipo] > 0) {
        granjero.semillas[tipo]--; 

        if (Math.random() > PROBABILIDAD_FALLO) {
            parcela.plantar(new Cultivo(tipo, CATALOGO[tipo].tiempo));
            aviso.innerText = "";
        } else {
            aviso.innerText = "Error";
        }
        
        setTimeout(() => aviso.innerText = "", 2000);
    } else {
        aviso.innerText = `¡No tienes semillas de ${tipo}!`;
        setTimeout(() => aviso.innerText = "", 2000);
    }
} else if (parcela.estaListo()) {
    granjero.dinero += CATALOGO[parcela.cultivoActual.nombre].valor;
    parcela.cultivoActual = null;
}
    // Actualizamos visualmente y guardamos los cambios en el localStorage
    renderizar();
    saveParcela(parcelas);
    saveGranjero(granjero);
}

function recargarRecursos() {
    granjero.semillas["Tomate"] += 10;
    granjero.semillas["Calabaza"] += 10; 
    granjero.semillas["Berenjena"] += 10;
    renderizar(); //Actualizamos para ver el nuevo stock
}

