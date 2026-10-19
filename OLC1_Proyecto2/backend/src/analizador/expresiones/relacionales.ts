import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, esNumerico, esRecurso, nombreTipo } from "../simbolo/tipo"

export enum Op_relacionales { IGUALDAD, DESIGUALDAD, MENOR, MENOR_IGUAL, MAYOR, MAYOR_IGUAL }
const SIMBOLO = ["==", "!=", "<", "<=", ">", ">="]

// Secciones 26.2 y 26.3
export default class Relacionales extends Instruccion {
    constructor(private Operacion: Op_relacionales, linea: number, columna: number,
                private operador1: Instruccion, private operador2: Instruccion) {
        super(new Tipo(tipoDato.BOOLEAN), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const a = this.operador1.interpretar(arbol, tabla)
        if (a instanceof Errores) return a
        const t1 = this.operador1.tipoDato.clonar()
        const b = this.operador2.interpretar(arbol, tabla)
        if (b instanceof Errores) return b
        const t2 = this.operador2.tipoDato.clonar()
        const n1 = t1.getTipo(), n2 = t2.getTipo()
        this.tipoDato = new Tipo(tipoDato.BOOLEAN)

        const invalida = () => new Errores("Semántico",
            `Operación '${SIMBOLO[this.Operacion]}' no válida entre ${nombreTipo(t1)} y ${nombreTipo(t2)}`,
            this.linea, this.columna, "SEM-008")

        switch (this.Operacion) {
            case Op_relacionales.MENOR:
            case Op_relacionales.MENOR_IGUAL:
            case Op_relacionales.MAYOR:
            case Op_relacionales.MAYOR_IGUAL:
                if (!esNumerico(n1) || !esNumerico(n2)) return invalida()
                if (this.Operacion === Op_relacionales.MENOR) return a < b
                if (this.Operacion === Op_relacionales.MENOR_IGUAL) return a <= b
                if (this.Operacion === Op_relacionales.MAYOR) return a > b
                return a >= b

            default: {   // == y !=
                let iguales: boolean
                if (esNumerico(n1) && esNumerico(n2)) iguales = a === b
                else if (n1 === n2 && (n1 === tipoDato.CADENA || n1 === tipoDato.BOOLEAN)) iguales = a === b
                // recursos del mismo tipo: igualdad de REFERENCIA (sección 5.2)
                else if (esRecurso(n1) && esRecurso(n2) && (n1 === n2 || n1 === tipoDato.RECURSO || n2 === tipoDato.RECURSO)) iguales = a === b
                else return invalida()
                return this.Operacion === Op_relacionales.IGUALDAD ? iguales : !iguales
            }
        }
    }
}