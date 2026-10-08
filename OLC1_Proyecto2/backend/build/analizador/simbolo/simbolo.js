"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Simbolo {
    tipo;
    id;
    valor;
    constructor(tipo, id, valor) {
        this.tipo = tipo;
        this.id = id;
        this.valor = valor;
    }
    getTipo() {
        return this.tipo;
    }
    getId() {
        return this.id;
    }
    getValor() {
        return this.valor;
    }
    setTipo(tipo) {
        this.tipo = tipo;
    }
    setId(id) {
        this.id = id;
    }
    setValor(valor) {
        this.valor = valor;
    }
}
exports.default = Simbolo;
