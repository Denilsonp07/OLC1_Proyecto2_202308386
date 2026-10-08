"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tablaSimbolo_1 = __importDefault(require("./tablaSimbolo"));
class Arbol {
    instrucciones;
    consola;
    tablaGlobal;
    errores;
    constructor(instrucciones) {
        this.instrucciones = instrucciones;
        this.consola = "";
        this.tablaGlobal = new tablaSimbolo_1.default();
        this.errores = new Array();
    }
    getInstrucciones() {
        return this.instrucciones;
    }
    getConsola() {
        return this.consola;
    }
    getTablaGlobal() {
        return this.tablaGlobal;
    }
    getErrores() {
        return this.errores;
    }
    setInstrucciones(instrucciones) {
        this.instrucciones = instrucciones;
    }
    setConsola(consola) {
        this.consola = consola;
    }
    setTablaGlobal(tablaGlobal) {
        this.tablaGlobal = tablaGlobal;
    }
    setErrores(errores) {
        this.errores = errores;
    }
    Print(entrada) {
        this.consola = `${this.consola}${entrada}\n`;
    }
}
exports.default = Arbol;
