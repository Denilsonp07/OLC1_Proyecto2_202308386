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
//E+E
//E-E
//E*E
class Aritmeticas extends instruccion_1.Instruccion {
    operando1;
    operando2;
    operador;
    constructor(operador, operando1, operando2, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.ENTERO), linea, columna);
        this.operador = operador;
        this.operando1 = operando1;
        this.operando2 = operando2;
    }
    interpretar(arbol, tabla) {
        let opIzq, opDer = null;
        opIzq = this.operando1.interpretar(arbol, tabla);
        if (opIzq instanceof errores_1.default)
            return opIzq;
        opDer = this.operando2.interpretar(arbol, tabla);
        if (opDer instanceof errores_1.default)
            return opDer;
        switch (this.operador) {
            case OperadoresAritmeticos.SUMA:
                return this.suma(opIzq, opDer);
        }
    }
    //entero + entero
    //entero + decimal
    suma(op1, op2) {
        let tipo1 = this.operando1?.tipoDato.getTipo();
        let tipo2 = this.operando2?.tipoDato.getTipo();
        switch (tipo1) {
            case tipo_1.tipoDato.ENTERO:
                switch (tipo2) {
                    case tipo_1.tipoDato.ENTERO:
                        this.tipoDato.setTipo(tipo_1.tipoDato.ENTERO);
                        return parseInt(op1) + parseInt(op2);
                    case tipo_1.tipoDato.DECIMAL:
                        this.tipoDato.setTipo(tipo_1.tipoDato.DECIMAL);
                        return parseFloat(op1) + parseFloat(op2);
                    default:
                        return new errores_1.default("Semantico", "suma entre operadores no existe", this.linea, this.columna);
                }
            case tipo_1.tipoDato.DECIMAL:
                switch (tipo2) {
                    case tipo_1.tipoDato.ENTERO:
                        this.tipoDato.setTipo(tipo_1.tipoDato.DECIMAL);
                        return parseFloat(op1) + parseFloat(op2);
                    case tipo_1.tipoDato.DECIMAL:
                        this.tipoDato.setTipo(tipo_1.tipoDato.DECIMAL);
                        return parseFloat(op1) + parseFloat(op2);
                    default:
                        return new errores_1.default("Semantico", "suma entre operadores no existe", this.linea, this.columna);
                }
        }
    }
}
exports.default = Aritmeticas;
var OperadoresAritmeticos;
(function (OperadoresAritmeticos) {
    OperadoresAritmeticos[OperadoresAritmeticos["SUMA"] = 0] = "SUMA";
    OperadoresAritmeticos[OperadoresAritmeticos["RESTA"] = 1] = "RESTA";
    OperadoresAritmeticos[OperadoresAritmeticos["MULT"] = 2] = "MULT";
})(OperadoresAritmeticos || (exports.OperadoresAritmeticos = OperadoresAritmeticos = {}));
