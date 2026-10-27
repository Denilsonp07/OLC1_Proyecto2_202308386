"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarBloque = ejecutarBloque;
const errores_1 = __importDefault(require("../excepciones/errores"));
const senal_1 = __importDefault(require("./senal"));
/**
 * Ejecuta una lista de instrucciones EN ORDEN dentro de la tabla dada.
 * Se detiene en cuanto una devuelve un Errores o una Senal y la propaga hacia arriba.
 * Aquí se cuenta cada instrucción ejecutada para el límite de 100,000 (sección 7.5).
 */
function ejecutarBloque(instrucciones, arbol, tabla) {
    for (const i of instrucciones) {
        const limite = arbol.tick(i.linea, i.columna);
        if (limite)
            return limite;
        const r = i.interpretar(arbol, tabla);
        if (r instanceof errores_1.default || r instanceof senal_1.default)
            return r;
    }
    return undefined;
}
