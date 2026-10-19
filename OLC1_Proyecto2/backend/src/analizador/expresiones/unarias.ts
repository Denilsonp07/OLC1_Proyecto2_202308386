


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, esNumerico, nombreTipo } from "../simbolo/tipo"

export enum OperadoresUnarios { NEGATIVO, NOT }

export default class Unarias extends Instruccion {
    constructor(private operador: OperadoresUnarios, private operando: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const v = this.operando.interpretar(arbol, tabla)
        if (v instanceof Errores) return v
        const t = this.operando.tipoDato.clonar()

        if (this.operador === OperadoresUnarios.NEGATIVO) {
            if (!esNumerico(t.getTipo())) {
                return new Errores("Semántico", `'-' unario requiere int o float, recibió ${nombreTipo(t)}`, this.linea, this.columna, "SEM-008")
            }
            this.tipoDato = t
            return -v
        }
        if (t.getTipo() !== tipoDato.BOOLEAN) {
            return new Errores("Semántico", `'!' requiere bool, recibió ${nombreTipo(t)}`, this.linea, this.columna, "SEM-008")
        }
        this.tipoDato = new Tipo(tipoDato.BOOLEAN)
        return !v
    }
}