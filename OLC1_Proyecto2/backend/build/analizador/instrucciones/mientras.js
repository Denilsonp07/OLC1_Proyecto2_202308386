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
const senal_1 = __importStar(require("../abstracto/senal"));
const bloque_1 = require("../abstracto/bloque");
const tipo_1 = __importStar(require("../simbolo/tipo"));
// while cond { ... }
class Mientras extends instruccion_1.Instruccion {
    condicion;
    cuerpo;
    constructor(condicion, cuerpo, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.condicion = condicion;
        this.cuerpo = cuerpo;
    }
    interpretar(arbol, tabla) {
        while (true) {
            const cond = this.condicion.interpretar(arbol, tabla);
            if (cond instanceof errores_1.default)
                return cond;
            if (this.condicion.tipoDato.getTipo() !== tipo_1.tipoDato.BOOLEAN) {
                return new errores_1.default("Semántico", `La condición del while debe producir bool, produjo ${(0, tipo_1.nombreTipo)(this.condicion.tipoDato)}`, this.linea, this.columna, "SEM-001");
            }
            if (!cond)
                break;
            const limite = arbol.tick(this.linea, this.columna); // un while con cuerpo vacío también debe poder cortarse
            if (limite)
                return limite;
            const r = (0, bloque_1.ejecutarBloque)(this.cuerpo, arbol, tabla.crearHijo("while")); // ámbito nuevo por iteración
            if (r instanceof errores_1.default)
                return r;
            if (r instanceof senal_1.default) {
                if (r.tipo === senal_1.TipoSenal.BREAK)
                    break;
                if (r.tipo === senal_1.TipoSenal.CONTINUE)
                    continue;
                return r; // RETURN: no es de este ciclo, sigue subiendo
            }
        }
        return undefined;
    }
}
exports.default = Mientras;
