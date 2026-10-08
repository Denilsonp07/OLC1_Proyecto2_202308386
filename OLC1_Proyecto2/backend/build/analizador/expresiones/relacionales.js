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
//E<E  TRUE | FALSE
class Relacionales extends instruccion_1.Instruccion {
    operador1;
    operador2;
    Operacion;
    constructor(operacion, linea, columna, op1, op2) {
        super(new tipo_1.default(tipo_1.tipoDato.BOOLEAN), linea, columna);
        this.Operacion = operacion;
        this.operador1 = op1;
        this.operador2 = op2;
    }
    interpretar(arbol, tabla) {
        let opIzq, opDer = null;
        opIzq = this.operador1.interpretar(arbol, tabla);
        if (opIzq instanceof errores_1.default)
            return opIzq;
        opDer = this.operador2.interpretar(arbol, tabla);
        if (opDer instanceof errores_1.default)
            return opDer;
        switch (this.Operacion) {
            case Op_relacionales.IGUALDAD:
                return this.igualdad(opIzq, opDer);
            case Op_relacionales.MENOR:
                return this.menor(opIzq, opDer);
        }
    }
    igualdad(op1, op2) {
        let tipo1 = this.operador1.tipoDato.getTipo();
        let tipo2 = this.operador2.tipoDato.getTipo();
        switch (tipo1) {
            case tipo_1.tipoDato.ENTERO:
                switch (tipo2) {
                    case tipo_1.tipoDato.ENTERO:
                        this.tipoDato.setTipo(tipo_1.tipoDato.BOOLEAN);
                        return parseInt(op1) == parseInt(op2);
                    default:
                        return new errores_1.default("semnatico", "Este caso no se reconoce", this.linea, this.columna);
                }
            case tipo_1.tipoDato.CADENA:
                switch (tipo2) {
                    case tipo_1.tipoDato.CADENA:
                        this.tipoDato.setTipo(tipo_1.tipoDato.BOOLEAN);
                        return op1 == op2;
                    default:
                        return new errores_1.default("semnatico", "Este caso no se reconoce", this.linea, this.columna);
                }
        }
    }
    menor(op1, op2) {
        let tipo1 = this.operador1.tipoDato.getTipo();
        let tipo2 = this.operador2.tipoDato.getTipo();
        switch (tipo1) {
            case tipo_1.tipoDato.ENTERO:
                switch (tipo2) {
                    case tipo_1.tipoDato.ENTERO:
                        this.tipoDato.setTipo(tipo_1.tipoDato.BOOLEAN);
                        return parseInt(op1) < parseInt(op2);
                    default:
                        return new errores_1.default("semnatico", "Este caso no se reconoce", this.linea, this.columna);
                }
            case tipo_1.tipoDato.DECIMAL:
                switch (tipo2) {
                    case tipo_1.tipoDato.ENTERO:
                        this.tipoDato.setTipo(tipo_1.tipoDato.BOOLEAN);
                        return parseFloat(op1) < parseFloat(op2);
                    default:
                        return new errores_1.default("semnatico", "Este caso no se reconoce", this.linea, this.columna);
                }
        }
    }
}
exports.default = Relacionales;
var Op_relacionales;
(function (Op_relacionales) {
    Op_relacionales[Op_relacionales["IGUALDAD"] = 0] = "IGUALDAD";
    Op_relacionales[Op_relacionales["MENOR"] = 1] = "MENOR";
})(Op_relacionales || (exports.Op_relacionales = Op_relacionales = {}));
