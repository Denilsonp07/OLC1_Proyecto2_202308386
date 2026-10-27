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
exports.CATALOGO = void 0;
exports.validarValor = validarValor;
exports.getDef = getDef;
const tipo_1 = __importStar(require("../analizador/simbolo/tipo"));
const errores_1 = __importDefault(require("../analizador/excepciones/errores"));
const INT = new tipo_1.default(tipo_1.tipoDato.ENTERO), STR = new tipo_1.default(tipo_1.tipoDato.CADENA);
const mayorQueCero = (v) => (v > 0 ? null : "debe ser mayor que 0");
const puerto = (v) => (v >= 1 && v <= 65535 ? null : "debe estar entre 1 y 65535");
const noVacio = (v) => (v.length > 0 ? null : "no puede estar vacío");
const dependencias = new tipo_1.default(tipo_1.tipoDato.ARREGLO, tipo_1.tipoDato.RECURSO);
// Catálogo de propiedades por recurso (secciones 9 y 27). Lo que no esté aquí NO existe.
exports.CATALOGO = {
    server: {
        cpu: { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        memory: { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        disk: { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        os: { tipo: STR, soloLectura: false, requerida: true, validar: noVacio },
        status: { tipo: STR, soloLectura: true, requerida: false },
        packages: { tipo: new tipo_1.default(tipo_1.tipoDato.ARREGLO, tipo_1.tipoDato.CADENA), soloLectura: true, requerida: false },
    },
    service: {
        port: { tipo: INT, soloLectura: false, requerida: true, validar: puerto },
        replicas: { tipo: INT, soloLectura: false, requerida: false, validar: (v) => (v >= 1 ? null : "debe ser >= 1") },
        status: { tipo: STR, soloLectura: true, requerida: false },
        host: { tipo: new tipo_1.default(tipo_1.tipoDato.SERVER), soloLectura: true, requerida: false },
        dependsOn: { tipo: dependencias, soloLectura: false, requerida: false },
    },
    database: {
        engine: { tipo: STR, soloLectura: false, requerida: true,
            validar: (v) => (["postgresql", "mysql", "sqlite"].includes(v) ? null : "debe ser postgresql, mysql o sqlite") },
        version: { tipo: STR, soloLectura: false, requerida: true, validar: noVacio },
        port: { tipo: INT, soloLectura: false, requerida: true, validar: puerto },
        status: { tipo: STR, soloLectura: true, requerida: false },
        dependsOn: { tipo: dependencias, soloLectura: false, requerida: false },
    },
};
/** Valida tipo y restricción numérica/textual de un valor para una propiedad. */
function validarValor(nombre, def, valor, tipoValor, linea, columna) {
    if (!(0, tipo_1.compatible)(def.tipo, tipoValor)) {
        return new errores_1.default("Semántico", `La propiedad '${nombre}' espera ${(0, tipo_1.nombreTipo)(def.tipo)} y recibió ${(0, tipo_1.nombreTipo)(tipoValor)}`, linea, columna, "SEM-001");
    }
    if (def.validar) {
        const motivo = def.validar(valor);
        if (motivo)
            return new errores_1.default("Semántico", `La propiedad '${nombre}' ${motivo}`, linea, columna, "SEM-009");
    }
    return null;
}
/** Busca la definición de una propiedad SIN tropezar con 'constructor', 'toString', etc. del prototipo. */
function getDef(tipo, nombre) {
    return Object.prototype.hasOwnProperty.call(exports.CATALOGO[tipo], nombre) ? exports.CATALOGO[tipo][nombre] : undefined;
}
