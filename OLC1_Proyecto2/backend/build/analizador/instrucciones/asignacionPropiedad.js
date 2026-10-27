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
const recursos_1 = require("../../infraestructura/recursos");
const validacion_1 = require("../../infraestructura/validacion");
// recurso.propiedad = valor;     (las de solo lectura -> error semántico, sección 22.4)
class AsignacionPropiedad extends instruccion_1.Instruccion {
    base;
    propiedad;
    expresion;
    constructor(base, propiedad, expresion, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.base = base;
        this.propiedad = propiedad;
        this.expresion = expresion;
    }
    interpretar(arbol, tabla) {
        const r = this.base.interpretar(arbol, tabla);
        if (r instanceof errores_1.default)
            return r;
        if (r === null || r === undefined) {
            return new errores_1.default("Ejecución", `No se puede modificar '${this.propiedad}' de un valor null`, this.linea, this.columna, "EXE-004");
        }
        if (!(r instanceof recursos_1.Recurso)) {
            return new errores_1.default("Semántico", `Solo los recursos tienen propiedades; no se puede asignar '${this.propiedad}'`, this.linea, this.columna, "SEM-008");
        }
        const def = (0, validacion_1.getDef)(r.tipoRecurso, this.propiedad);
        if (!def) {
            return new errores_1.default("Semántico", `La propiedad '${this.propiedad}' no existe en ${r.tipoRecurso} '${r.nombre}'`, this.linea, this.columna, "SEM-004");
        }
        if (def.soloLectura) {
            return new errores_1.default("Semántico", `La propiedad '${this.propiedad}' es de solo lectura (solo cambia con funciones nativas como start/deploy)`, this.linea, this.columna, "SEM-005");
        }
        const valor = this.expresion.interpretar(arbol, tabla);
        if (valor instanceof errores_1.default)
            return valor;
        const err = (0, validacion_1.validarValor)(this.propiedad, def, valor, this.expresion.tipoDato, this.linea, this.columna);
        if (err)
            return err;
        r[this.propiedad] = valor;
        return undefined;
    }
}
exports.default = AsignacionPropiedad;
