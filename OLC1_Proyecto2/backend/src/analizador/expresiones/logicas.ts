


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, nombreTipo } from "../simbolo/tipo"

export enum OperadoresLogicos { AND, OR }

export default class Logicas extends Instruccion {
    constructor(private operador: OperadoresLogicos, private op1: Instruccion, private op2: Instruccion,
                linea: number, columna: number) {
        super(new Tipo(tipoDato.BOOLEAN), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const sim = this.operador === OperadoresLogicos.AND ? "&&" : "||"
        const izq = this.op1.interpretar(arbol, tabla)
        if (izq instanceof Errores) return izq
        if (this.op1.tipoDato.getTipo() !== tipoDato.BOOLEAN) {
            return new Errores("Semántico", `'${sim}' requiere bool, recibió ${nombreTipo(this.op1.tipoDato)}`, this.linea, this.columna, "SEM-008")
        }
        // CORTO CIRCUITO (sección 6.3): si el izquierdo ya decide, el derecho NO se evalúa
        if (this.operador === OperadoresLogicos.AND && izq === false) return false
        if (this.operador === OperadoresLogicos.OR && izq === true) return true

        const der = this.op2.interpretar(arbol, tabla)
        if (der instanceof Errores) return der
        if (this.op2.tipoDato.getTipo() !== tipoDato.BOOLEAN) {
            return new Errores("Semántico", `'${sim}' requiere bool, recibió ${nombreTipo(this.op2.tipoDato)}`, this.linea, this.columna, "SEM-008")
        }
        return der
    }
}