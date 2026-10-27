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
// ["docker", "git"]   ->   string[]      ([] vacío es compatible con cualquier T[])
class Arreglo extends instruccion_1.Instruccion {
    elementos;
    constructor(elementos, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.ARREGLO), linea, columna);
        this.elementos = elementos;
    }
    interpretar(arbol, tabla) {
        const valores = [];
        const tipos = [];
        for (const e of this.elementos) {
            const v = e.interpretar(arbol, tabla);
            if (v instanceof errores_1.default)
                return v;
            valores.push(v);
            tipos.push(e.tipoDato.getTipo());
        }
        if (valores.length === 0) {
            this.tipoDato = new tipo_1.default(tipo_1.tipoDato.ARREGLO, undefined);
            return valores;
        }
        let elem = tipos[0];
        for (const t of tipos) {
            if (t === elem)
                continue;
            if ((0, tipo_1.esRecurso)(t) && (0, tipo_1.esRecurso)(elem)) {
                elem = tipo_1.tipoDato.RECURSO;
                continue;
            } // recursos mezclados: resource[]
            return new errores_1.default("Semántico", "Los arreglos deben contener elementos de un mismo tipo", this.linea, this.columna, "SEM-001");
        }
        if (elem === tipo_1.tipoDato.ARREGLO) {
            return new errores_1.default("Semántico", "No se admiten arreglos anidados", this.linea, this.columna, "SEM-001");
        }
        this.tipoDato = new tipo_1.default(tipo_1.tipoDato.ARREGLO, elem);
        return valores;
    }
}
exports.default = Arreglo;
