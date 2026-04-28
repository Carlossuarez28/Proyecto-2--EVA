export class Granjero {
    constructor() {
        //Lee la configuración guardada por controladorConfiguracion.js
        const config = JSON.parse(localStorage.getItem("config"));

        if (config) {
            this.nombre          = config.nombreGranjero;
            this.nombreGranja    = config.nombreGranja;
            this.dificultad      = config.dificultad;
            this.cultivoFavorito = config.cultivoFavorito;
            this.dinero          = config.dinero;
            this.energia         = config.energia;
            this.semillas        = { ...config.semillas };
        } else {
            //Valores por defecto si no hay config (acceso directo al juego)
            this.nombre          = "Granjero";
            this.nombreGranja    = "Mi Granja";
            this.dificultad      = "normal";
            this.cultivoFavorito = "Tomate";
            this.dinero          = 100;
            this.energia         = 100;
            this.semillas        = { Tomate: 5, Calabaza: 5, Berenjena: 5 };
        }
    }
}