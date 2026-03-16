import { Cultivo } from "./Cultivo";
import { Parcela } from "./Parcela";
import { Granjero } from "./Granjero";

const CATALOGO = {
    "Tomate": { tiempo: 10, valor: 20 },
    "Calabaza": { tiempo: 20, valor: 40 }
};
const ICONOS = {
    "Tomate": "🍅",
    "Calabaza": "🎃"
};


this.granjero = new Granjero();
this.parcelas = Array.from({ length: 9 }, (_, i) => new Parcela(i));
this.renderizar(); setInterval(() => this.renderizar(), 1000);

function renderizar() {
    const contenedor = document.getElementById("terreno");
    contenedor.innerHTML = "";
    const selector = document.getElementById("selectorSemillas");
    selector.options[0].text = `Tomate (Stock: ${this.granjero.semillas["Tomate"]})`;
    selector.options[1].text = `Calabaza (Stock: ${this.granjero.semillas["Calabaza"]})`;

    this.parcelas.forEach(p => {
        const div = document.createElement("div");
        div.className = "parcela";
        if (p.cultivoActual) {
            div.classList.add(p.cultivoActual.nombre, p.cultivoActual.obtenerFase(p.fechaPlantado));
            if (p.estaListo()) div.classList.add("madura");
            div.innerHTML = `<div>${p.estaListo() ? "🌾" : ICONOS[p.cultivoActual.nombre]}</div>
                                 <div class="tiempo">${!p.estaListo() ? p.tiempoRestante() + "s" : ""}</div>
                                 <div class="barra"><div class="progreso" style="width:${p.progreso() * 100}%"></div></div>`;
        }
        div.onclick = () => this.gestionarClick(p);
        contenedor.appendChild(div);
    });
    document.getElementById("dinero").innerText = this.granjero.dinero;
}

function gestionarClick(parcela) {
    const tipo = document.getElementById("selectorSemillas").value;
    const aviso = document.getElementById("mensaje-sistema");

    if (!parcela.cultivoActual) {
        if (this.granjero.semillas[tipo] > 0) {
            this.granjero.semillas[tipo]--;
            parcela.plantar(new Cultivo(tipo, CATALOGO[tipo].tiempo));
            aviso.innerText = "";
        } else {
            aviso.innerText = `¡No tienes semillas de ${tipo}!`;
            setTimeout(() => aviso.innerText = "", 2000);
        }
    } else if (parcela.estaListo()) {
        this.granjero.dinero += CATALOGO[parcela.cultivoActual.nombre].valor;
        parcela.cultivoActual = null;
    }
    this.renderizar();
}

function recargarRecursos() {
    this.granjero.semillas["Tomate"] += 10;
    this.granjero.semillas["Calabaza"] += 10; this.renderizar();
}
