"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instruccion_1 = require("../abstracto/instruccion");
class Nativo extends instruccion_1.Instruccion {
    valor;
    constructor(tipo, valor, linea, columna) {
        super(tipo, linea, columna);
        this.valor = valor;
    }
    interpretar(arbol, tabla) {
        return this.valor;
    }
}
exports.default = Nativo;
