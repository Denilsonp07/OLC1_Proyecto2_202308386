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
const Server_1 = require("../../infraestructura/Server");
const PROPS_SERVER = {
    cpu: tipo_1.tipoDato.ENTERO,
    memory: tipo_1.tipoDato.ENTERO,
    disk: tipo_1.tipoDato.ENTERO,
    os: tipo_1.tipoDato.CADENA,
    status: tipo_1.tipoDato.CADENA,
};
// recurso.propiedad   (ej: backend.memory)
class AccesoPropiedad extends instruccion_1.Instruccion {
    id;
    propiedad;
    constructor(id, propiedad, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.id = id;
        this.propiedad = propiedad;
    }
    interpretar(arbol, tabla) {
        const simbolo = tabla.getVariable(this.id);
        if (simbolo == null) {
            return new errores_1.default("Semántico", `'${this.id}' no ha sido declarado`, this.linea, this.columna);
        }
        const recurso = simbolo.getValor();
        if (!(recurso instanceof Server_1.Server)) {
            return new errores_1.default("Semántico", `'${this.id}' no es un recurso`, this.linea, this.columna);
        }
        if (!(this.propiedad in PROPS_SERVER)) {
            return new errores_1.default("Semántico", `La propiedad '${this.propiedad}' no existe en server`, this.linea, this.columna);
        }
        this.tipoDato.setTipo(PROPS_SERVER[this.propiedad]);
        return recurso[this.propiedad];
    }
}
exports.default = AccesoPropiedad;
