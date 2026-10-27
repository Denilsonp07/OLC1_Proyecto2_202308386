"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TablaSimbolo {
    tablaActual;
    nombreDato;
    padre; // ámbito que contiene a este (null = global)
    ruta; // nombre del ámbito para el reporte: global, main, canDeploy, main > for > cuerpo...
    // Registro de TODOS los símbolos declarados, de todos los ámbitos. Lo comparten padre e hijos para que,
    // al terminar un ámbito local, sus símbolos sigan apareciendo en el reporte (sección 17.3).
    registro;
    constructor(padre = null, nombre = "global") {
        this.tablaActual = new Map();
        this.nombreDato = "";
        this.padre = padre;
        this.ruta = padre === null || padre.padre === null ? nombre : `${padre.ruta} > ${nombre}`;
        this.registro = padre ? padre.registro : new Map();
    }
    crearHijo(nombre = "bloque") {
        return new TablaSimbolo(this, nombre);
    }
    getTabla() { return this.tablaActual; }
    setTabla(tabla) { this.tablaActual = tabla; }
    getNombreDato() { return this.nombreDato; }
    setNombreDato(nombreDato) { this.nombreDato = nombreDato; }
    getRuta() { return this.ruta; }
    getRegistro() { return [...this.registro.values()]; }
    setVariable(simbolo) {
        if (this.tablaActual.has(simbolo.getId())) {
            return false;
        }
        this.tablaActual.set(simbolo.getId(), simbolo);
        // Una misma línea ejecutada muchas veces (ciclo, función llamada n veces) comparte la clave:
        // queda UNA entrada por ámbito+nombre, con el último valor.
        if (this.registro.size < 5000)
            this.registro.set(`${this.ruta}|${simbolo.getId()}`, { ambito: this.ruta, simbolo });
        return true;
    }
    // sube por la cadena de ámbitos: local -> ... -> global
    getVariable(id) {
        const local = this.tablaActual.get(id);
        if (local !== undefined)
            return local;
        return this.padre ? this.padre.getVariable(id) : undefined;
    }
}
exports.default = TablaSimbolo;
