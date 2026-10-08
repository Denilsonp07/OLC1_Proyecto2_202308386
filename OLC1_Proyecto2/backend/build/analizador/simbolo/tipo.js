"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tipoDato = void 0;
class Tipo {
    tipo;
    constructor(tipo) {
        this.tipo = tipo;
    }
    getTipo() {
        return this.tipo;
    }
    setTipo(tipo) {
        this.tipo = tipo;
    }
}
exports.default = Tipo;
var tipoDato;
(function (tipoDato) {
    tipoDato[tipoDato["ENTERO"] = 0] = "ENTERO";
    tipoDato[tipoDato["DECIMAL"] = 1] = "DECIMAL";
    tipoDato[tipoDato["BOOLEAN"] = 2] = "BOOLEAN";
    tipoDato[tipoDato["CHAR"] = 3] = "CHAR";
    tipoDato[tipoDato["CADENA"] = 4] = "CADENA";
    tipoDato[tipoDato["VOID"] = 5] = "VOID";
})(tipoDato || (exports.tipoDato = tipoDato = {}));
