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
exports.Main = exports.RunTask = exports.DeclaracionTask = exports.Tarea = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const errores_1 = __importDefault(require("../excepciones/errores"));
const senal_1 = __importStar(require("../abstracto/senal"));
const bloque_1 = require("../abstracto/bloque");
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tablaSimbolo_1 = __importDefault(require("../simbolo/tablaSimbolo"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
class Tarea {
    nombre;
    cuerpo;
    entorno;
    constructor(nombre, cuerpo, entorno) {
        this.nombre = nombre;
        this.cuerpo = cuerpo;
        this.entorno = entorno;
    }
}
exports.Tarea = Tarea;
/** Un break/continue/return que llega hasta aquí no tenía ciclo/función que lo absorba: error semántico. */
function senalHuerfana(s) {
    const msg = s.tipo === senal_1.TipoSenal.RETURN ? "'return' utilizado fuera de una función"
        : s.tipo === senal_1.TipoSenal.BREAK ? "'break' utilizado fuera de un ciclo"
            : "'continue' utilizado fuera de un ciclo";
    return new errores_1.default("Semántico", msg, s.linea, s.columna, "SEM-006");
}
// task produccion { ... }     (sin parámetros, sección 11)
class DeclaracionTask extends instruccion_1.Instruccion {
    nombre;
    cuerpo;
    constructor(nombre, cuerpo, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.nombre = nombre;
        this.cuerpo = cuerpo;
    }
    interpretar(arbol, tabla) {
        if (!tabla.setVariable(new simbolo_1.default(new tipo_1.default(tipo_1.tipoDato.VOID), this.nombre, new Tarea(this.nombre, this.cuerpo, tabla), "tarea"))) {
            return new errores_1.default("Semántico", `El identificador '${this.nombre}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002");
        }
        return undefined;
    }
}
exports.DeclaracionTask = DeclaracionTask;
// run produccion;
class RunTask extends instruccion_1.Instruccion {
    nombre;
    constructor(nombre, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.nombre = nombre;
    }
    interpretar(arbol, tabla) {
        const t = tabla.getVariable(this.nombre)?.getValor();
        if (!(t instanceof Tarea)) {
            return new errores_1.default("Semántico", `La tarea '${this.nombre}' no existe`, this.linea, this.columna, "SEM-003");
        }
        const limite = arbol.entrarLlamada(this.linea, this.columna);
        if (limite)
            return limite;
        const r = (0, bloque_1.ejecutarBloque)(t.cuerpo, arbol, new tablaSimbolo_1.default(t.entorno, t.nombre));
        arbol.salirLlamada();
        if (r instanceof errores_1.default)
            return r;
        if (r instanceof senal_1.default)
            return senalHuerfana(r);
        return undefined;
    }
}
exports.RunTask = RunTask;
// main { ... }     (punto de entrada único, sección 15)
class Main extends instruccion_1.Instruccion {
    cuerpo;
    constructor(cuerpo, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.cuerpo = cuerpo;
    }
    interpretar(arbol, tabla) {
        const r = (0, bloque_1.ejecutarBloque)(this.cuerpo, arbol, tabla.crearHijo("main"));
        if (r instanceof errores_1.default)
            return r;
        if (r instanceof senal_1.default)
            return senalHuerfana(r);
        return undefined;
    }
}
exports.Main = Main;
