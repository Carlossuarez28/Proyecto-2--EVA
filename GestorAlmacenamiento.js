//Importamos las clases parcela, granjero y cultivo.
import { Parcela } from "./ClasesJs/Parcela.js";
import { Granjero } from "./ClasesJs/Granjero.js";
import { Cultivo } from "./ClasesJs/Cultivo.js";

// Convertimos el objeto/array a un string JSON porque localStorage solo guarda texto
export const saveParcela = function (item) {
    localStorage.setItem("parcela", JSON.stringify(item));
}

/*Recupera las parcelas del localStorage y las convierte de nuevo en instancias de la clase Parcela (con sus métodos).*/
export const loadParcela = function () {
    // Leemos el string de la memoria y lo convertimos a objeto. 
    // Si no hay nada guardado, usamos un array vacío [].
    let array = JSON.parse(localStorage.getItem("parcela")) || [];

    return array.map(p => { // Usamos .map para transformar cada objeto "plano" en un objeto con clase
        const parcela = Object.assign(new Parcela(), p); // Creamos una instancia vacía de Parcela y le copiamos los datos de 'p'

        /*El JSON.parse no sabe que 'cultivoActual' debería ser de la clase Cultivo por lo que hacemos este metodo y 
          Creamos un nuevo Cultivo usando los datos básicos guardados*/
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

/*Guarda los datos del granjero en el almacenamiento local.*/
export const saveGranjero = function (item) {
    localStorage.setItem("granjero", JSON.stringify(item));
}

/*Recupera al granjero y lo convierte en una instancia de la clase Granjero.*/
// 1. JSON.parse recupera los datos (monedas, nivel, etc.)
// 2. new Granjero crea un objeto con los métodos (caminar, comprar, etc.)
// 3. Object.assign combina ambos para tener un Granjero funcional con los datos guardados
export const loadGranjero = function () {
  return Object.assign(new Granjero(), JSON.parse(localStorage.getItem("granjero")));
}