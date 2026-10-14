"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TablaSimbolo {
    tablaActual;
    nombreDato;
    padre; // null = ámbito global
    constructor(padre = null) {
        this.tablaActual = new Map();
        this.nombreDato = "";
        this.padre = padre;
    }
    crearHijo() {
        return new TablaSimbolo(this);
    }
    getTabla() {
        return this.tablaActual;
    }
    setTabla(tabla) {
        this.tablaActual = tabla;
    }
    getNombreDato() {
        return this.nombreDato;
    }
    setNombreDato(nombreDato) {
        this.nombreDato = nombreDato;
    }
    setVariable(simbolo) {
        if (this.tablaActual.has(simbolo.getId())) {
            return false;
        }
        this.tablaActual.set(simbolo.getId(), simbolo);
        return true;
    }
    getVariable(id) {
        const local = this.tablaActual.get(id);
        if (local !== undefined)
            return local;
        return this.padre ? this.padre.getVariable(id) : undefined;
    }
}
exports.default = TablaSimbolo;
