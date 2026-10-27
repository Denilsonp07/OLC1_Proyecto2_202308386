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
exports.OperadoresUnarios = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
var OperadoresUnarios;
(function (OperadoresUnarios) {
    OperadoresUnarios[OperadoresUnarios["NEGATIVO"] = 0] = "NEGATIVO";
    OperadoresUnarios[OperadoresUnarios["NOT"] = 1] = "NOT";
})(OperadoresUnarios || (exports.OperadoresUnarios = OperadoresUnarios = {}));
class Unarias extends instruccion_1.Instruccion {
    operador;
    operando;
    constructor(operador, operando, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.operador = operador;
        this.operando = operando;
    }
    interpretar(arbol, tabla) {
        const v = this.operando.interpretar(arbol, tabla);
        if (v instanceof errores_1.default)
            return v;
        const t = this.operando.tipoDato.clonar();
        if (this.operador === OperadoresUnarios.NEGATIVO) {
            if (!(0, tipo_1.esNumerico)(t.getTipo())) {
                return new errores_1.default("Semántico", `'-' unario requiere int o float, recibió ${(0, tipo_1.nombreTipo)(t)}`, this.linea, this.columna, "SEM-008");
            }
            this.tipoDato = t;
            return -v;
        }
        if (t.getTipo() !== tipo_1.tipoDato.BOOLEAN) {
            return new errores_1.default("Semántico", `'!' requiere bool, recibió ${(0, tipo_1.nombreTipo)(t)}`, this.linea, this.columna, "SEM-008");
        }
        this.tipoDato = new tipo_1.default(tipo_1.tipoDato.BOOLEAN);
        return !v;
    }
}
exports.default = Unarias;
