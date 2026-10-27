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
exports.Op_relacionales = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
var Op_relacionales;
(function (Op_relacionales) {
    Op_relacionales[Op_relacionales["IGUALDAD"] = 0] = "IGUALDAD";
    Op_relacionales[Op_relacionales["DESIGUALDAD"] = 1] = "DESIGUALDAD";
    Op_relacionales[Op_relacionales["MENOR"] = 2] = "MENOR";
    Op_relacionales[Op_relacionales["MENOR_IGUAL"] = 3] = "MENOR_IGUAL";
    Op_relacionales[Op_relacionales["MAYOR"] = 4] = "MAYOR";
    Op_relacionales[Op_relacionales["MAYOR_IGUAL"] = 5] = "MAYOR_IGUAL";
})(Op_relacionales || (exports.Op_relacionales = Op_relacionales = {}));
const SIMBOLO = ["==", "!=", "<", "<=", ">", ">="];
// Secciones 26.2 y 26.3
class Relacionales extends instruccion_1.Instruccion {
    Operacion;
    operador1;
    operador2;
    constructor(Operacion, linea, columna, operador1, operador2) {
        super(new tipo_1.default(tipo_1.tipoDato.BOOLEAN), linea, columna);
        this.Operacion = Operacion;
        this.operador1 = operador1;
        this.operador2 = operador2;
    }
    interpretar(arbol, tabla) {
        const a = this.operador1.interpretar(arbol, tabla);
        if (a instanceof errores_1.default)
            return a;
        const t1 = this.operador1.tipoDato.clonar();
        const b = this.operador2.interpretar(arbol, tabla);
        if (b instanceof errores_1.default)
            return b;
        const t2 = this.operador2.tipoDato.clonar();
        const n1 = t1.getTipo(), n2 = t2.getTipo();
        this.tipoDato = new tipo_1.default(tipo_1.tipoDato.BOOLEAN);
        const invalida = () => new errores_1.default("Semántico", `Operación '${SIMBOLO[this.Operacion]}' no válida entre ${(0, tipo_1.nombreTipo)(t1)} y ${(0, tipo_1.nombreTipo)(t2)}`, this.linea, this.columna, "SEM-008");
        switch (this.Operacion) {
            case Op_relacionales.MENOR:
            case Op_relacionales.MENOR_IGUAL:
            case Op_relacionales.MAYOR:
            case Op_relacionales.MAYOR_IGUAL:
                if (!(0, tipo_1.esNumerico)(n1) || !(0, tipo_1.esNumerico)(n2))
                    return invalida();
                if (this.Operacion === Op_relacionales.MENOR)
                    return a < b;
                if (this.Operacion === Op_relacionales.MENOR_IGUAL)
                    return a <= b;
                if (this.Operacion === Op_relacionales.MAYOR)
                    return a > b;
                return a >= b;
            default: { // == y !=
                let iguales;
                if ((0, tipo_1.esNumerico)(n1) && (0, tipo_1.esNumerico)(n2))
                    iguales = a === b;
                else if (n1 === n2 && (n1 === tipo_1.tipoDato.CADENA || n1 === tipo_1.tipoDato.BOOLEAN))
                    iguales = a === b;
                // recursos del mismo tipo: igualdad de REFERENCIA (sección 5.2)
                else if ((0, tipo_1.esRecurso)(n1) && (0, tipo_1.esRecurso)(n2) && (n1 === n2 || n1 === tipo_1.tipoDato.RECURSO || n2 === tipo_1.tipoDato.RECURSO))
                    iguales = a === b;
                else
                    return invalida();
                return this.Operacion === Op_relacionales.IGUALDAD ? iguales : !iguales;
            }
        }
    }
}
exports.default = Relacionales;
