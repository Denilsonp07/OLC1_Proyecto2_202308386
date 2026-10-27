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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Continuar = exports.Romper = void 0;
const instruccion_1 = require("../abstracto/instruccion");
const senal_1 = __importStar(require("../abstracto/senal"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
class Romper extends instruccion_1.Instruccion {
    constructor(linea, columna) { super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna); }
    interpretar(arbol, tabla) { return new senal_1.default(senal_1.TipoSenal.BREAK, undefined, undefined, this.linea, this.columna); }
}
exports.Romper = Romper;
class Continuar extends instruccion_1.Instruccion {
    constructor(linea, columna) { super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna); }
    interpretar(arbol, tabla) { return new senal_1.default(senal_1.TipoSenal.CONTINUE, undefined, undefined, this.linea, this.columna); }
}
exports.Continuar = Continuar;
