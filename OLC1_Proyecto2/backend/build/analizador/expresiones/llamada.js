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
const senal_1 = __importStar(require("../abstracto/senal"));
const bloque_1 = require("../abstracto/bloque");
const simbolo_1 = __importDefault(require("../simbolo/simbolo"));
const tablaSimbolo_1 = __importDefault(require("../simbolo/tablaSimbolo"));
const tipo_1 = __importStar(require("../simbolo/tipo"));
const nativas_1 = require("../../infraestructura/nativas");
const declaracionFuncion_1 = require("../instrucciones/declaracionFuncion");
// nombre(arg1, arg2...)   -> función nativa o función del usuario
class Llamada extends instruccion_1.Instruccion {
    id;
    args;
    constructor(id, args, linea, columna) {
        super(new tipo_1.default(tipo_1.tipoDato.VOID), linea, columna);
        this.id = id;
        this.args = args;
    }
    interpretar(arbol, tabla) {
        const nativa = Object.prototype.hasOwnProperty.call(nativas_1.NATIVAS, this.id) ? nativas_1.NATIVAS[this.id] : undefined;
        const valorSim = nativa ? undefined : tabla.getVariable(this.id)?.getValor();
        const funcion = valorSim instanceof declaracionFuncion_1.Funcion ? valorSim : undefined;
        if (!nativa && !funcion) {
            return new errores_1.default("Semántico", `La función '${this.id}' no existe`, this.linea, this.columna, "SEM-003");
        }
        // argumentos evaluados de izquierda a derecha
        const valores = [];
        const tipos = [];
        for (const a of this.args) {
            const v = a.interpretar(arbol, tabla);
            if (v instanceof errores_1.default)
                return v;
            valores.push(v);
            tipos.push(a.tipoDato.clonar());
        }
        return nativa ? this.llamarNativa(nativa, valores, tipos, arbol) : this.llamarFuncion(funcion, valores, tipos, arbol);
    }
    firmaIncorrecta(firma, motivo) {
        return new errores_1.default("Semántico", `Firma incorrecta: ${firma} (${motivo})`, this.linea, this.columna, "SEM-007");
    }
    llamarNativa(n, valores, tipos, arbol) {
        const firma = `${this.id}(${n.params.join(", ")}${n.variadic ? "..." : ""})`;
        if (!n.variadic) {
            if (valores.length !== n.params.length)
                return this.firmaIncorrecta(firma, `recibió ${valores.length} argumento(s)`);
            for (let i = 0; i < n.params.length; i++) {
                if (!(0, nativas_1.cumple)(n.params[i], tipos[i]))
                    return this.firmaIncorrecta(firma, `el argumento ${i + 1} es ${(0, tipo_1.nombreTipo)(tipos[i])}`);
                if (n.params[i] !== "any" && n.params[i] !== "int" && n.params[i] !== "string" && valores[i] === null) {
                    return new errores_1.default("Ejecución", `El argumento ${i + 1} de '${this.id}' es null`, this.linea, this.columna, "EXE-004");
                }
            }
        }
        const r = n.ejecutar(valores, tipos, arbol, this.linea, this.columna);
        this.tipoDato = new tipo_1.default(n.retorno);
        return r;
    }
    llamarFuncion(f, valores, tipos, arbol) {
        const firma = `${f.nombre}(${f.params.map(p => (0, tipo_1.nombreTipo)(p.tipo)).join(", ")})`;
        if (valores.length !== f.params.length)
            return this.firmaIncorrecta(firma, `recibió ${valores.length} argumento(s)`);
        for (let i = 0; i < f.params.length; i++) {
            if (!(0, tipo_1.compatible)(f.params[i].tipo, tipos[i])) {
                return this.firmaIncorrecta(firma, `el argumento ${i + 1} es ${(0, tipo_1.nombreTipo)(tipos[i])} y se esperaba ${(0, tipo_1.nombreTipo)(f.params[i].tipo)}`);
            }
        }
        const limite = arbol.entrarLlamada(this.linea, this.columna);
        if (limite)
            return limite;
        // Entorno NUEVO por llamada, enlazado al entorno donde se DECLARÓ la función 
        const local = new tablaSimbolo_1.default(f.entorno, f.nombre);
        f.params.forEach((p, i) => local.setVariable(new simbolo_1.default(p.tipo, p.id, valores[i], "parametro")));
        const r = (0, bloque_1.ejecutarBloque)(f.cuerpo, arbol, local);
        arbol.salirLlamada();
        if (r instanceof errores_1.default)
            return r;
        if (r instanceof senal_1.default && r.tipo !== senal_1.TipoSenal.RETURN) {
            const que = r.tipo === senal_1.TipoSenal.BREAK ? "break" : "continue";
            return new errores_1.default("Semántico", `'${que}' utilizado fuera de un ciclo`, r.linea, r.columna, "SEM-006");
        }
        const esVoid = f.tipoRetorno === null;
        if (r instanceof senal_1.default) { // RETURN
            if (esVoid && r.tipoValor && r.tipoValor.getTipo() !== tipo_1.tipoDato.VOID) {
                return new errores_1.default("Semántico", `La función '${f.nombre}' no declara tipo de retorno pero retorna un valor`, this.linea, this.columna, "SEM-001");
            }
            if (!esVoid) {
                if (!r.tipoValor || !(0, tipo_1.compatible)(f.tipoRetorno, r.tipoValor)) {
                    return new errores_1.default("Semántico", `La función '${f.nombre}' debe retornar ${(0, tipo_1.nombreTipo)(f.tipoRetorno)}`, this.linea, this.columna, "SEM-001");
                }
                this.tipoDato = f.tipoRetorno.clonar();
                return r.valor;
            }
        }
        else if (!esVoid) {
            return new errores_1.default("Semántico", `La función '${f.nombre}' debe retornar un valor ${(0, tipo_1.nombreTipo)(f.tipoRetorno)}`, this.linea, this.columna, "SEM-001");
        }
        this.tipoDato = new tipo_1.default(tipo_1.tipoDato.VOID);
        return undefined;
    }
}
exports.default = Llamada;
