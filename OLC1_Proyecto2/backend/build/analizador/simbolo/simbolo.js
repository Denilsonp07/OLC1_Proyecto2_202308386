"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Simbolo {
    tipo;
    id;
    valor;
    categoria; // variable | parámetro | recurso | función | tarea 
    constructor(tipo, id, valor, categoria = "variable") {
        this.tipo = tipo;
        this.id = id;
        this.valor = valor;
        this.categoria = categoria;
    }
    getTipo() { return this.tipo; }
    getId() { return this.id; }
    getValor() { return this.valor; }
    getCategoria() { return this.categoria; }
    setTipo(tipo) { this.tipo = tipo; }
    setId(id) { this.id = id; }
    setValor(valor) { this.valor = valor; }
}
exports.default = Simbolo;
