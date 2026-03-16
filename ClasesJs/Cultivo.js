export class Cultivo {
    constructor(nombre, tiempoMaduracion){ 
        this.nombre = nombre; 
        this.tiempoMaduracion = tiempoMaduracion; 
    }
    obtenerFase(tiempoPlantado) {
        const progreso = (Date.now() - tiempoPlantado) / 1000 / this.tiempoMaduracion;
        if (progreso < 0.33) return "semilla";
        if (progreso < 0.66) return "brote";
        if (progreso < 1) return "creciendo";
        return "madura";
    }
}