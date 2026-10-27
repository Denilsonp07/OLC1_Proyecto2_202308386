"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tipo_1 = require("../simbolo/tipo");
// int x = 5;     string[] p = ["a"];     int y;   (sin valor -> valor por defecto, sección 5.1)
class Declaracion extends instruccion_1.Instruccion {
    id;
    valor;
    constructor(tipo, linea, columna, id, valor) {
        super(tipo, linea, columna);
        this.id = id;
        this.valor = valor;
    }
    interpretar(arbol, tabla) {
        let valor;
        if (this.valor === null) {
            valor = (0, tipo_1.valorPorDefecto)(this.tipoDato);
        }
        else {
            valor = this.valor.interpretar(arbol, tabla);
            if (valor instanceof errores_1.default)
                return valor;
            // tipo DECLARADO vs tipo de la EXPRESIÓN (int -> float permitido)
            if (!(0, tipo_1.compatible)(this.tipoDato, this.valor.tipoDato)) {
                return new errores_1.default("Semántico", `No se puede asignar ${(0, tipo_1.nombreTipo)(this.valor.tipoDato)} a '${this.id}' de tipo ${(0, tipo_1.nombreTipo)(this.tipoDato)}`, this.linea, this.columna, "SEM-001");
            }
        }
        if (!tabla.setVariable(new simbolo_1.default(this.tipoDato, this.id, valor))) {
            return new errores_1.default("Semántico", `El identificador '${this.id}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002");
        }
        return undefined;
    }
}
exports.default = Declaracion;
