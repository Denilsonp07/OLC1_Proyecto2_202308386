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
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
const recursos_1 = require("../../infraestructura/recursos");
const validacion_1 = require("../../infraestructura/validacion");
// server backend { cpu = 4; ... }     service api { ... }     database db { ... }
class DeclaracionRecurso extends instruccion_1.Instruccion {
    id;
    propiedades;
    constructor(tipo, id, propiedades, linea, columna) {
        super(tipo, linea, columna);
        this.id = id;
        this.propiedades = propiedades;
    }
    interpretar(arbol, tabla) {
        const kind = this.tipoDato.getTipo() === tipo_1.tipoDato.SERVER ? "server" :
            this.tipoDato.getTipo() === tipo_1.tipoDato.SERVICE ? "service" :
                this.tipoDato.getTipo() === tipo_1.tipoDato.DATABASE ? "database" : undefined;
        if (!kind) {
            return new errores_1.default("Semántico", `'${this.id}': solo server, service y database admiten un bloque de propiedades`, this.linea, this.columna, "SEM-008");
        }
        const v = {};
        for (const p of this.propiedades) {
            const def = (0, validacion_1.getDef)(kind, p.nombre);
            if (!def)
                return new errores_1.default("Semántico", `La propiedad '${p.nombre}' no existe en un recurso ${kind}`, p.linea, p.columna, "SEM-004");
            if (def.soloLectura)
                return new errores_1.default("Semántico", `La propiedad '${p.nombre}' es de solo lectura`, p.linea, p.columna, "SEM-005");
            if (p.nombre in v)
                return new errores_1.default("Semántico", `La propiedad '${p.nombre}' está duplicada`, p.linea, p.columna, "SEM-002");
            const valor = p.expresion.interpretar(arbol, tabla);
            if (valor instanceof errores_1.default)
                return valor;
            const err = (0, validacion_1.validarValor)(p.nombre, def, valor, p.expresion.tipoDato, p.linea, p.columna);
            if (err)
                return err;
            v[p.nombre] = valor;
        }
        for (const [nombre, def] of Object.entries(validacion_1.CATALOGO[kind])) {
            if (def.requerida && !(nombre in v)) {
                return new errores_1.default("Semántico", `Falta la propiedad obligatoria '${nombre}' en ${kind} '${this.id}'`, this.linea, this.columna, "SEM-010");
            }
        }
        let recurso;
        if (kind === "server")
            recurso = new recursos_1.Server(this.id, v.cpu, v.memory, v.disk, v.os);
        else if (kind === "service")
            recurso = new recursos_1.Service(this.id, v.port, v.replicas ?? 1, v.dependsOn ?? []);
        else
            recurso = new recursos_1.Database(this.id, v.engine, v.version, v.port, v.dependsOn ?? []);
        if (!tabla.setVariable(new simbolo_1.default(new tipo_1.default(this.tipoDato.getTipo()), this.id, recurso, "recurso"))) {
            return new errores_1.default("Semántico", `El identificador '${this.id}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002");
        }
        arbol.log("OK", `Resource '${this.id}' registered`);
        return undefined;
    }
}
exports.default = DeclaracionRecurso;
