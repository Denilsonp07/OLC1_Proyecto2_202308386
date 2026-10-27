"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errores_1 = __importDefault(require("../excepciones/errores"));
const tablaSimbolo_1 = __importDefault(require("./tablaSimbolo"));
class Arbol {
    maxInstrucciones;
    maxProfundidad;
    instrucciones;
    consola;
    tablaGlobal;
    errores;
    // Límites de segurida configurables
    ejecutadas = 0;
    profundidad = 0;
    constructor(instrucciones, maxInstrucciones = 100000, maxProfundidad = 1000) {
        this.maxInstrucciones = maxInstrucciones;
        this.maxProfundidad = maxProfundidad;
        this.instrucciones = instrucciones;
        this.consola = "";
        this.tablaGlobal = new tablaSimbolo_1.default();
        this.errores = new Array();
    }
    getInstrucciones() { return this.instrucciones; }
    getConsola() { return this.consola; }
    getTablaGlobal() { return this.tablaGlobal; }
    getErrores() { return this.errores; }
    agregarError(e) { this.errores.push(e); }
    /** Salida de print() */
    Print(entrada) { this.consola += `${entrada}\n`; }
    /** Bitácora de la infraestructura: [OK] / [WARN] */
    log(nivel, mensaje) { this.consola += `[${nivel}] ${mensaje}\n`; }
    /** Se llama por cada instrucción ejecutada. Devuelve un Errores al superar el límite. */
    tick(linea, columna) {
        if (++this.ejecutadas > this.maxInstrucciones) {
            return new errores_1.default("Ejecución", `Se superó el límite de ${this.maxInstrucciones} instrucciones ejecutadas (posible ciclo infinito)`, linea, columna, "EXE-002");
        }
        return null;
    }
    entrarLlamada(linea, columna) {
        if (this.profundidad + 1 > this.maxProfundidad) {
            return new errores_1.default("Ejecución", `Se superó la profundidad máxima de llamadas (${this.maxProfundidad})`, linea, columna, "EXE-003");
        }
        this.profundidad++;
        return null;
    }
    salirLlamada() { this.profundidad--; }
}
exports.default = Arbol;
