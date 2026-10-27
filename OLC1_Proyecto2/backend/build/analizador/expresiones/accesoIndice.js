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
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
// packages[0]
class AccesoIndice extends instruccion_1.Instruccion {
    base;
    indice;
    constructor(base, indice, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.base = base;
        this.indice = indice;
    }
    interpretar(arbol, tabla) {
        const arr = this.base.interpretar(arbol, tabla);
        if (arr instanceof errores_1.default)
            return arr;
        if (arr === null || arr === undefined) {
            return new errores_1.default("Ejecución", "No se puede indexar un valor null", this.linea, this.columna, "EXE-004");
        }
        const tBase = this.base.tipoDato.clonar();
        if (tBase.getTipo() !== tipo_1.tipoDato.ARREGLO) {
            return new errores_1.default("Semántico", `Solo se puede indexar un arreglo, recibió ${(0, tipo_1.nombreTipo)(tBase)}`, this.linea, this.columna, "SEM-008");
        }
        const i = this.indice.interpretar(arbol, tabla);
        if (i instanceof errores_1.default)
            return i;
        if (this.indice.tipoDato.getTipo() !== tipo_1.tipoDato.ENTERO) {
            return new errores_1.default("Semántico", "El índice de un arreglo debe ser int", this.linea, this.columna, "SEM-001");
        }
        if (i < 0 || i >= arr.length) {
            return new errores_1.default("Ejecución", `Índice ${i} fuera de rango (tamaño ${arr.length})`, this.linea, this.columna, "EXE-005");
        }
        const e = tBase.getElemento();
        this.tipoDato = new tipo_1.default(e === undefined ? tipo_1.tipoDato.VOID : e);
        return arr[i];
    }
}
exports.default = AccesoIndice;
