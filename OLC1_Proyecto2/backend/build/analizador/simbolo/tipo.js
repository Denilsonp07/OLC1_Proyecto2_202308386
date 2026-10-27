"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esRecurso = exports.esNumerico = exports.tipoDato = void 0;
exports.nombreTipo = nombreTipo;
exports.compatible = compatible;
exports.aTexto = aTexto;
exports.valorPorDefecto = valorPorDefecto;
var tipoDato;
(function (tipoDato) {
    tipoDato[tipoDato["ENTERO"] = 0] = "ENTERO";
    tipoDato[tipoDato["DECIMAL"] = 1] = "DECIMAL";
    tipoDato[tipoDato["BOOLEAN"] = 2] = "BOOLEAN";
    tipoDato[tipoDato["CHAR"] = 3] = "CHAR";
    tipoDato[tipoDato["CADENA"] = 4] = "CADENA";
    tipoDato[tipoDato["VOID"] = 5] = "VOID";
    tipoDato[tipoDato["SERVER"] = 6] = "SERVER";
    tipoDato[tipoDato["SERVICE"] = 7] = "SERVICE";
    tipoDato[tipoDato["DATABASE"] = 8] = "DATABASE";
    tipoDato[tipoDato["RECURSO"] = 9] = "RECURSO";
    tipoDato[tipoDato["ARREGLO"] = 10] = "ARREGLO";
})(tipoDato || (exports.tipoDato = tipoDato = {}));
class Tipo {
    tipo;
    elemento; // solo para ARREGLO: tipo de sus elementos
    constructor(tipo, elemento) {
        this.tipo = tipo;
        this.elemento = elemento;
    }
    getTipo() { return this.tipo; }
    setTipo(tipo) { this.tipo = tipo; }
    getElemento() { return this.elemento; }
    setElemento(e) { this.elemento = e; }
    clonar() { return new Tipo(this.tipo, this.elemento); }
}
exports.default = Tipo;
const NOMBRES = {
    [tipoDato.ENTERO]: "int", [tipoDato.DECIMAL]: "float", [tipoDato.BOOLEAN]: "bool",
    [tipoDato.CHAR]: "char", [tipoDato.CADENA]: "string", [tipoDato.VOID]: "void",
    [tipoDato.SERVER]: "server", [tipoDato.SERVICE]: "service", [tipoDato.DATABASE]: "database",
    [tipoDato.RECURSO]: "resource", [tipoDato.ARREGLO]: "array"
};
function nombreTipo(t) {
    if (t.getTipo() === tipoDato.ARREGLO) {
        const e = t.getElemento();
        return `${e === undefined ? "?" : NOMBRES[e]}[]`;
    }
    return NOMBRES[t.getTipo()];
}
const esNumerico = (t) => t === tipoDato.ENTERO || t === tipoDato.DECIMAL;
exports.esNumerico = esNumerico;
const esRecurso = (t) => t === tipoDato.SERVER || t === tipoDato.SERVICE || t === tipoDato.DATABASE || t === tipoDato.RECURSO;
exports.esRecurso = esRecurso;
function elementoCompatible(d, o) {
    return d === o || (d === tipoDato.RECURSO && (0, exports.esRecurso)(o));
}
/** ¿Se puede asignar un valor de tipo 'origen' a algo declarado como 'destino'? */
function compatible(destino, origen) {
    const d = destino.getTipo(), o = origen.getTipo();
    if (d === tipoDato.ARREGLO && o === tipoDato.ARREGLO) {
        const eo = origen.getElemento(), ed = destino.getElemento();
        return eo === undefined || (ed !== undefined && elementoCompatible(ed, eo)); // [] vacío sirve para cualquier T[]
    }
    if (d === o)
        return true;
    if (d === tipoDato.DECIMAL && o === tipoDato.ENTERO)
        return true; // int -> float
    if (d === tipoDato.RECURSO && (0, exports.esRecurso)(o))
        return true;
    return false;
}
/** Texto de un valor para print y concatenación (float entero se muestra como 2.0) */
function aTexto(valor, tipo) {
    if (valor === null || valor === undefined)
        return "null";
    if (Array.isArray(valor)) {
        const e = tipo?.getElemento();
        return "[" + valor.map(v => aTexto(v, e !== undefined ? new Tipo(e) : undefined)).join(", ") + "]";
    }
    if (typeof valor === "object" && typeof valor.nombre === "string")
        return valor.nombre; // recurso
    if (tipo?.getTipo() === tipoDato.DECIMAL && typeof valor === "number" && Number.isInteger(valor))
        return valor.toFixed(1);
    return String(valor);
}
function valorPorDefecto(t) {
    switch (t.getTipo()) {
        case tipoDato.ENTERO: return 0;
        case tipoDato.DECIMAL: return 0.0;
        case tipoDato.CADENA: return "";
        case tipoDato.BOOLEAN: return false;
        case tipoDato.ARREGLO: return [];
        default: return null; // referencias: null lógico 
    }
}
