

export enum tipoDato {
    ENTERO,
    DECIMAL,
    BOOLEAN,
    CHAR,
    CADENA,
    VOID,
    SERVER,
    SERVICE,
    DATABASE,
    RECURSO,   // "cualquier recurso" (elementos de dependsOn, parámetros genéricos)
    ARREGLO
}

export default class Tipo {
    private tipo: tipoDato
    private elemento?: tipoDato   // solo para ARREGLO: tipo de sus elementos

    constructor(tipo: tipoDato, elemento?: tipoDato) {
        this.tipo = tipo
        this.elemento = elemento
    }
    public getTipo(): tipoDato { return this.tipo }
    public setTipo(tipo: tipoDato): void { this.tipo = tipo }
    public getElemento(): tipoDato | undefined { return this.elemento }
    public setElemento(e: tipoDato | undefined): void { this.elemento = e }
    public clonar(): Tipo { return new Tipo(this.tipo, this.elemento) }
}

const NOMBRES: Record<number, string> = {
    [tipoDato.ENTERO]: "int", [tipoDato.DECIMAL]: "float", [tipoDato.BOOLEAN]: "bool",
    [tipoDato.CHAR]: "char", [tipoDato.CADENA]: "string", [tipoDato.VOID]: "void",
    [tipoDato.SERVER]: "server", [tipoDato.SERVICE]: "service", [tipoDato.DATABASE]: "database",
    [tipoDato.RECURSO]: "resource", [tipoDato.ARREGLO]: "array"
}

export function nombreTipo(t: Tipo): string {
    if (t.getTipo() === tipoDato.ARREGLO) {
        const e = t.getElemento()
        return `${e === undefined ? "?" : NOMBRES[e]}[]`
    }
    return NOMBRES[t.getTipo()]
}

export const esNumerico = (t: tipoDato) => t === tipoDato.ENTERO || t === tipoDato.DECIMAL
export const esRecurso = (t: tipoDato) =>
    t === tipoDato.SERVER || t === tipoDato.SERVICE || t === tipoDato.DATABASE || t === tipoDato.RECURSO

function elementoCompatible(d: tipoDato, o: tipoDato): boolean {
    return d === o || (d === tipoDato.RECURSO && esRecurso(o))
}

/** ¿Se puede asignar un valor de tipo 'origen' a algo declarado como 'destino'? */
export function compatible(destino: Tipo, origen: Tipo): boolean {
    const d = destino.getTipo(), o = origen.getTipo()
    if (d === tipoDato.ARREGLO && o === tipoDato.ARREGLO) {
        const eo = origen.getElemento(), ed = destino.getElemento()
        return eo === undefined || (ed !== undefined && elementoCompatible(ed, eo))   // [] vacío sirve para cualquier T[]
    }
    if (d === o) return true
    if (d === tipoDato.DECIMAL && o === tipoDato.ENTERO) return true      // int -> float
    if (d === tipoDato.RECURSO && esRecurso(o)) return true
    return false
}

/** Texto de un valor para print y concatenación (float entero se muestra como 2.0) */
export function aTexto(valor: any, tipo?: Tipo): string {
    if (valor === null || valor === undefined) return "null"
    if (Array.isArray(valor)) {
        const e = tipo?.getElemento()
        return "[" + valor.map(v => aTexto(v, e !== undefined ? new Tipo(e) : undefined)).join(", ") + "]"
    }
    if (typeof valor === "object" && typeof valor.nombre === "string") return valor.nombre   // recurso
    if (tipo?.getTipo() === tipoDato.DECIMAL && typeof valor === "number" && Number.isInteger(valor)) return valor.toFixed(1)
    return String(valor)
}

export function valorPorDefecto(t: Tipo): any {
    switch (t.getTipo()) {
        case tipoDato.ENTERO: return 0
        case tipoDato.DECIMAL: return 0.0
        case tipoDato.CADENA: return ""
        case tipoDato.BOOLEAN: return false
        case tipoDato.ARREGLO: return []
        default: return null     // referencias: null lógico 
    }
}