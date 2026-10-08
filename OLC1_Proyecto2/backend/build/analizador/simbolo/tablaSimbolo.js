"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TablaSimbolo {
    tablaActual;
    nombreDato;
    constructor() {
        this.tablaActual = new Map();
        this.nombreDato = "";
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
        return this.getTabla().get(id);
    }
}
exports.default = TablaSimbolo;
