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
exports.Funcion = exports.Parametro = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
const nativas_1 = require("../../infraestructura/nativas");
class Parametro {
    tipo;
    id;
    constructor(tipo, id) {
        this.tipo = tipo;
        this.id = id;
    }
}
exports.Parametro = Parametro;
/** Valor que se guarda en la tabla de símbolos para una función declarada. */
class Funcion {
    nombre;
    params;
    tipoRetorno;
    cuerpo;
    entorno;
    constructor(nombre, params, tipoRetorno, cuerpo, entorno) {
        this.nombre = nombre;
        this.params = params;
        this.tipoRetorno = tipoRetorno;
        this.cuerpo = cuerpo;
        this.entorno = entorno;
    }
}
exports.Funcion = Funcion;
// function canDeploy(server s, int minMemory) bool { ... }
class DeclaracionFuncion extends instruccion_1.Instruccion {
    nombre;
    params;
    tipoRetorno;
    cuerpo;
    constructor(nombre, params, tipoRetorno, cuerpo, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.nombre = nombre;
        this.params = params;
        this.tipoRetorno = tipoRetorno;
        this.cuerpo = cuerpo;
    }
    interpretar(arbol, tabla) {
        if (Object.prototype.hasOwnProperty.call(nativas_1.NATIVAS, this.nombre)) {
            return new errores_1.default("Semántico", `'${this.nombre}' es una función nativa y no puede redefinirse`, this.linea, this.columna, "SEM-002");
        }
        const vistos = new Set();
        for (const p of this.params) {
            if (vistos.has(p.id))
                return new errores_1.default("Semántico", `Parámetro duplicado '${p.id}' en '${this.nombre}'`, this.linea, this.columna, "SEM-002");
            vistos.add(p.id);
        }
        // 'tabla' es el entorno donde se declara: las llamadas enlazarán su entorno local a este
        const f = new Funcion(this.nombre, this.params, this.tipoRetorno, this.cuerpo, tabla);
        if (!tabla.setVariable(new simbolo_1.default(new tipo_1.default(tipo_1.tipoDato.VOID), this.nombre, f, "funcion"))) {
            return new errores_1.default("Semántico", `El identificador '${this.nombre}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002");
        }
        return undefined;
    }
}
exports.default = DeclaracionFuncion;
