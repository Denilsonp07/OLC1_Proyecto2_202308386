


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, nombreTipo } from "../simbolo/tipo"

// packages[0]
export default class AccesoIndice extends Instruccion {
    constructor(private base: Instruccion, private indice: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const arr = this.base.interpretar(arbol, tabla)
        if (arr instanceof Errores) return arr
        if (arr === null || arr === undefined) {
            return new Errores("Ejecución", "No se puede indexar un valor null", this.linea, this.columna, "EXE-004")
        }
        const tBase = this.base.tipoDato.clonar()
        if (tBase.getTipo() !== tipoDato.ARREGLO) {
            return new Errores("Semántico", `Solo se puede indexar un arreglo, recibió ${nombreTipo(tBase)}`, this.linea, this.columna, "SEM-008")
        }
        const i = this.indice.interpretar(arbol, tabla)
        if (i instanceof Errores) return i
        if (this.indice.tipoDato.getTipo() !== tipoDato.ENTERO) {
            return new Errores("Semántico", "El índice de un arreglo debe ser int", this.linea, this.columna, "SEM-001")
        }
        if (i < 0 || i >= arr.length) {
            return new Errores("Ejecución", `Índice ${i} fuera de rango (tamaño ${arr.length})`, this.linea, this.columna, "EXE-005")
        }
        const e = tBase.getElemento()
        this.tipoDato = new Tipo(e === undefined ? tipoDato.VOID : e)
        return arr[i]
    }
}