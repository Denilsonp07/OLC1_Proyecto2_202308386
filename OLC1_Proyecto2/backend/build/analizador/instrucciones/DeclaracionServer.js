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
const Server_1 = require("../../infraestructura/Server");
class DeclaracionServer extends instruccion_1.Instruccion {
    id;
    propiedades;
    constructor(id, propiedades, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.id = id;
        this.propiedades = propiedades;
    }
    interpretar(arbol, entorno) {
        // Valores por defecto o variables temporales
        let cpu = null;
        let memory = null;
        let disk = null;
        let os = null;
        // 1. Recorrer y evaluar cada propiedad
        for (const prop of this.propiedades) {
            // Evaluamos la expresión hija (Ej: 2 + 2)
            const valorEvaluado = prop.valor.interpretar(arbol, entorno);
            if (valorEvaluado instanceof errores_1.default) {
                return valorEvaluado;
            }
            const linea = prop.linea ?? this.linea;
            const columna = prop.columna ?? prop.col ?? this.columna;
            // 2. Validación semántica de nombres y tipos
            switch (prop.id) {
                case "cpu":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new errores_1.default("Semántico", "CPU debe ser un entero > 0", linea, columna);
                    }
                    cpu = valorEvaluado;
                    break;
                case "memory":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new errores_1.default("Semántico", "Memory debe ser un entero > 0", linea, columna);
                    }
                    memory = valorEvaluado;
                    break;
                case "disk":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new errores_1.default("Semántico", "Disk debe ser un entero > 0", linea, columna);
                    }
                    disk = valorEvaluado;
                    break;
                case "os":
                    if (typeof valorEvaluado !== "string" || valorEvaluado === "") {
                        return new errores_1.default("Semántico", "OS no puede estar vacío", linea, columna);
                    }
                    os = valorEvaluado;
                    break;
                default:
                    // Si viene una propiedad inventada (ej. `cores = 4;`)
                    return new errores_1.default("Semántico", `La propiedad '${prop.id}' no existe en server`, linea, columna);
            }
        }
        // 3. Validar que no falten propiedades obligatorias
        if (cpu === null || memory === null || disk === null || os === null) {
            return new errores_1.default("Semántico", `Faltan propiedades obligatorias en el servidor '${this.id}'`, this.linea, this.columna);
        }
        // 4. Instanciar la clase de infraestructura y guardarla en la tabla de símbolos
        const nuevoServidor = new Server_1.Server(cpu, memory, disk, os);
        // Verifica que el ID no exista previamente en este ámbito[cite: 15]
        const guardado = entorno.setVariable(new simbolo_1.default(new tipo_1.default(tipo_1.tipoDato.SERVER), this.id, nuevoServidor));
        if (!guardado) {
            return new errores_1.default("Semántico", `El identificador '${this.id}' ya fue declarado`, this.linea, this.columna);
        }
        return null;
    }
}
exports.default = DeclaracionServer;
