"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperadoresLogicos = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
var OperadoresLogicos;
(function (OperadoresLogicos) {
    OperadoresLogicos[OperadoresLogicos["AND"] = 0] = "AND";
    OperadoresLogicos[OperadoresLogicos["OR"] = 1] = "OR";
})(OperadoresLogicos || (exports.OperadoresLogicos = OperadoresLogicos = {}));
class Logicas extends instruccion_1.Instruccion {
    operador;
    op1;
    op2;
    constructor(operador, op1, op2, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.BOOLEAN), linea, columna);
        this.operador = operador;
        this.op1 = op1;
        this.op2 = op2;
    }
    interpretar(arbol, tabla) {
        const sim = this.operador === OperadoresLogicos.AND ? "&&" : "||";
        const izq = this.op1.interpretar(arbol, tabla);
        if (izq instanceof errores_1.default)
            return izq;
        if (this.op1.tipoDato.getTipo() !== tipo_1.tipoDato.BOOLEAN) {
            return new errores_1.default("Semántico", `'${sim}' requiere bool, recibió ${(0, tipo_1.nombreTipo)(this.op1.tipoDato)}`, this.linea, this.columna, "SEM-008");
        }
        // CORTO CIRCUITO (sección 6.3): si el izquierdo ya decide, el derecho NO se evalúa
        if (this.operador === OperadoresLogicos.AND && izq === false)
            return false;
        if (this.operador === OperadoresLogicos.OR && izq === true)
            return true;
        const der = this.op2.interpretar(arbol, tabla);
        if (der instanceof errores_1.default)
            return der;
        if (this.op2.tipoDato.getTipo() !== tipo_1.tipoDato.BOOLEAN) {
            return new errores_1.default("Semántico", `'${sim}' requiere bool, recibió ${(0, tipo_1.nombreTipo)(this.op2.tipoDato)}`, this.linea, this.columna, "SEM-008");
        }
        return der;
    }
}
exports.default = Logicas;
