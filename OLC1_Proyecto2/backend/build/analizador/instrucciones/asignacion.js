"use strict";
//var id1 entero = 10
//id = expresion   | hola
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
const declaracionFuncion_1 = require("./declaracionFuncion");
// x = expresion
class AsignacionVar extends instruccion_1.Instruccion {
    id;
    expresion;
    constructor(id, expresion, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.id = id;
        this.expresion = expresion;
    }
    interpretar(arbol, tabla) {
        const variable = tabla.getVariable(this.id);
        if (variable == null) {
            return new errores_1.default("Semántico", `La variable '${this.id}' no ha sido declarada`, this.linea, this.columna, "SEM-003");
        }
        if (variable.getValor() instanceof declaracionFuncion_1.Funcion) {
            return new errores_1.default("Semántico", `'${this.id}' es una función, no una variable`, this.linea, this.columna, "SEM-008");
        }
        const nuevo = this.expresion.interpretar(arbol, tabla);
        if (nuevo instanceof errores_1.default)
            return nuevo;
        if (!(0, tipo_1.compatible)(variable.getTipo(), this.expresion.tipoDato)) {
            return new errores_1.default("Semántico", `No se puede asignar ${(0, tipo_1.nombreTipo)(this.expresion.tipoDato)} a '${this.id}' de tipo ${(0, tipo_1.nombreTipo)(variable.getTipo())}`, this.linea, this.columna, "SEM-001");
        }
        variable.setValor(nuevo);
        return undefined;
    }
}
exports.default = AsignacionVar;
