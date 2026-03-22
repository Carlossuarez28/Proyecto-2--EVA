import { Parcela } from "./ClasesJs/Parcela.js";
import { Granjero } from "./ClasesJs/Granjero.js";
import { Cultivo } from "./ClasesJs/Cultivo.js";

export const saveParcela = function (item) {
    localStorage.setItem("parcela", JSON.stringify(item));
}

export const loadParcela = function () {
  let array = JSON.parse(localStorage.getItem("parcela")) || [];

  return array.map(p => {
    const parcela = Object.assign(new Parcela(), p);

    //reconstruir cultivoActual
    if (p.cultivoActual) {
      parcela.cultivoActual = Object.assign(
        new Cultivo(
          p.cultivoActual.nombre,
          p.cultivoActual.tiempoMaduracion
        ),
        p.cultivoActual
      );
    }

    return parcela;
  });
};


export const saveGranjero = function (item) {
    localStorage.setItem("granjero", JSON.stringify(item));
}

export const loadGranjero = function () {
    return Object.assign(new Granjero, JSON.parse(localStorage.getItem("granjero")));
}