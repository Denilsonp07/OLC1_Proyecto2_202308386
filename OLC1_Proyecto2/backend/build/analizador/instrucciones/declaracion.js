"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tipo_1 = require("../simbolo/tipo");
//id 
//valor
//tipoDato
class Declaracion extends instruccion_1.Instruccion {
    id;
    valor;
    constructor(tipo, linea, columna, id, valor) {
        super(tipo, linea, columna);
        this.id = id;
        this.valor = valor;
    }
    interpretar(arbol, tabla) {
        if (this.valor == null) {
            if (!tabla.setVariable(new simbolo_1.default(this.tipoDato, this.id, null))) {
                return new errores_1.default('Semantico', "no se pude declarar la variable", this.linea, this.columna);
            }
            return;
        }
        let resValor = this.valor.interpretar(arbol, tabla);
        if (resValor instanceof errores_1.default)
            return resValor;
        if (this.tipoDato.getTipo() != this.tipoDato.getTipo()) {
            const declarado = this.tipoDato.getTipo();
            const delValor = this.valor.tipoDato.getTipo();
            const promocion = declarado === tipo_1.tipoDato.DECIMAL && delValor === tipo_1.tipoDato.ENTERO;
            if (declarado !== delValor && !promocion) {
                return new errores_1.default("Semántico", "el tipo de dato no coincide con el declarado", this.linea, this.columna);
            }
            if (!tabla.setVariable(new simbolo_1.default(this.tipoDato, this.id, resValor))) {
                return new errores_1.default("semantico", "La variable ya existe", this.linea, this.columna);
            }
            return null;
        }
    }
}
exports.default = Declaracion;
