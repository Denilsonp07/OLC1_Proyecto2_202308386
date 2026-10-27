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
exports.OperadoresAritmeticos = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
var OperadoresAritmeticos;
(function (OperadoresAritmeticos) {
    OperadoresAritmeticos[OperadoresAritmeticos["SUMA"] = 0] = "SUMA";
    OperadoresAritmeticos[OperadoresAritmeticos["RESTA"] = 1] = "RESTA";
    OperadoresAritmeticos[OperadoresAritmeticos["MULT"] = 2] = "MULT";
    OperadoresAritmeticos[OperadoresAritmeticos["DIV"] = 3] = "DIV";
    OperadoresAritmeticos[OperadoresAritmeticos["MOD"] = 4] = "MOD";
})(OperadoresAritmeticos || (exports.OperadoresAritmeticos = OperadoresAritmeticos = {}));
const SIMBOLO = ["+", "-", "*", "/", "%"];
// Tabla de la sección 26.1
class Aritmeticas extends instruccion_1.Instruccion {
    operador;
    operando1;
    operando2;
    constructor(operador, operando1, operando2, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.ENTERO), linea, columna);
        this.operador = operador;
        this.operando1 = operando1;
        this.operando2 = operando2;
    }
    invalida(t1, t2) {
        return new errores_1.default("Semántico", `Operación '${SIMBOLO[this.operador]}' no válida entre ${(0, tipo_1.nombreTipo)(t1)} y ${(0, tipo_1.nombreTipo)(t2)}`, this.linea, this.columna, "SEM-008");
    }
    interpretar(arbol, tabla) {
        const a = this.operando1.interpretar(arbol, tabla);
        if (a instanceof errores_1.default)
            return a;
        const t1 = this.operando1.tipoDato.clonar();
        const b = this.operando2.interpretar(arbol, tabla);
        if (b instanceof errores_1.default)
            return b;
        const t2 = this.operando2.tipoDato.clonar();
        const n1 = t1.getTipo(), n2 = t2.getTipo();
        // string + cualquier primitivo = concatenación
        if (this.operador === OperadoresAritmeticos.SUMA && n1 === tipo_1.tipoDato.CADENA) {
            if (!((0, tipo_1.esNumerico)(n2) || n2 === tipo_1.tipoDato.CADENA || n2 === tipo_1.tipoDato.BOOLEAN))
                return this.invalida(t1, t2);
            this.tipoDato = new tipo_1.default(tipo_1.tipoDato.CADENA);
            return (0, tipo_1.aTexto)(a, t1) + (0, tipo_1.aTexto)(b, t2);
        }
        if (!(0, tipo_1.esNumerico)(n1) || !(0, tipo_1.esNumerico)(n2))
            return this.invalida(t1, t2);
        const hayDecimal = n1 === tipo_1.tipoDato.DECIMAL || n2 === tipo_1.tipoDato.DECIMAL;
        switch (this.operador) {
            case OperadoresAritmeticos.SUMA:
                this.tipoDato = new tipo_1.default(hayDecimal ? tipo_1.tipoDato.DECIMAL : tipo_1.tipoDato.ENTERO);
                return a + b;
            case OperadoresAritmeticos.RESTA:
                this.tipoDato = new tipo_1.default(hayDecimal ? tipo_1.tipoDato.DECIMAL : tipo_1.tipoDato.ENTERO);
                return a - b;
            case OperadoresAritmeticos.MULT:
                this.tipoDato = new tipo_1.default(hayDecimal ? tipo_1.tipoDato.DECIMAL : tipo_1.tipoDato.ENTERO);
                return a * b;
            case OperadoresAritmeticos.DIV:
                if (b === 0)
                    return new errores_1.default("Ejecución", "División entre cero", this.linea, this.columna, "EXE-001");
                this.tipoDato = new tipo_1.default(tipo_1.tipoDato.DECIMAL);
                return a / b; // siempre float: 5/2 = 2.5
            case OperadoresAritmeticos.MOD:
                if (n1 !== tipo_1.tipoDato.ENTERO || n2 !== tipo_1.tipoDato.ENTERO)
                    return this.invalida(t1, t2); // % solo enteros
                if (b === 0)
                    return new errores_1.default("Ejecución", "Módulo entre cero", this.linea, this.columna, "EXE-001");
                this.tipoDato = new tipo_1.default(tipo_1.tipoDato.ENTERO);
                return a % b;
        }
    }
}
exports.default = Aritmeticas;
