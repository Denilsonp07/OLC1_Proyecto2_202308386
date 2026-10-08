"use strict";
//if <condicion>{
//Instruccion
//}
//else{  Instruccion}
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
class CondicionalIf extends instruccion_1.Instruccion {
    condicion;
    instruccionesIf;
    instruccionesElse;
    constructor(condicion, instruccionesIf, instruccionesElse, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.condicion = condicion;
        this.instruccionesIf = instruccionesIf;
        this.instruccionesElse = instruccionesElse;
    }
    interpretar(arbol, tabla) {
        let cond = this.condicion.interpretar(arbol, tabla);
        if (cond instanceof errores_1.default)
            return cond;
        if (this.condicion.tipoDato.getTipo() != tipo_1.tipoDato.BOOLEAN) {
            return new errores_1.default("Semantico", "La condicion debe ser un booleano", this.linea, this.columna);
        }
        if (cond) {
            for (let i of this.instruccionesIf) {
                if (i instanceof instruccion_1.Instruccion) {
                    let resultado = i.interpretar(arbol, tabla);
                    if (resultado instanceof errores_1.default)
                        return resultado;
                }
            }
        }
        else {
            if (this.instruccionesElse != undefined) {
                for (let i of this.instruccionesElse) {
                    if (i instanceof instruccion_1.Instruccion) {
                        let resultado = i.interpretar(arbol, tabla);
                        if (resultado instanceof errores_1.default)
                            return resultado;
                    }
                }
            }
        }
    }
}
exports.default = CondicionalIf;
