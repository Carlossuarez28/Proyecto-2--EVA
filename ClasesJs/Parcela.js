export class Parcela {
    constructor(id){ 
        this.id = id; 
        this.cultivoActual = null; 
        this.fechaPlantado = null; 
    }
    plantar(cultivo){ 
        this.cultivoActual = cultivo; 
        this.fechaPlantado = Date.now(); 
    }
    estaListo(){ 
        if (!this.cultivoActual) return false; 
        return (Date.now() - this.fechaPlantado) / 1000 >= this.cultivoActual.tiempoMaduracion; 
    }
    tiempoRestante(){ 
        if (!this.cultivoActual) return 0; 
        return Math.max(0, Math.ceil(this.cultivoActual.tiempoMaduracion - ((Date.now() - this.fechaPlantado) / 1000))); 
    }
    progreso(){ 
        if (!this.cultivoActual) return 0; 
        return Math.min(1, ((Date.now() - this.fechaPlantado) / 1000) / this.cultivoActual.tiempoMaduracion); 
    }
}