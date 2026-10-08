"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruccion = void 0;
class Instruccion {
    tipoDato;
    linea;
    columna;
    constructor(tipo, linea, columna) {
        this.tipoDato = tipo;
        this.linea = linea;
        this.columna = columna;
    }
}
exports.Instruccion = Instruccion;
