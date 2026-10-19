

//var id1 entero = 10
//id = expresion   | hola

import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, compatible, nombreTipo } from "../simbolo/tipo"
import { Funcion } from "./declaracionFuncion"

// x = expresion
export default class AsignacionVar extends Instruccion {
    constructor(private id: string, private expresion: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const variable = tabla.getVariable(this.id)
        if (variable == null) {
            return new Errores("Semántico", `La variable '${this.id}' no ha sido declarada`, this.linea, this.columna, "SEM-003")
        }
        if (variable.getValor() instanceof Funcion) {
            return new Errores("Semántico", `'${this.id}' es una función, no una variable`, this.linea, this.columna, "SEM-008")
        }
        const nuevo = this.expresion.interpretar(arbol, tabla)
        if (nuevo instanceof Errores) return nuevo
        if (!compatible(variable.getTipo(), this.expresion.tipoDato)) {
            return new Errores("Semántico",
                `No se puede asignar ${nombreTipo(this.expresion.tipoDato)} a '${this.id}' de tipo ${nombreTipo(variable.getTipo())}`,
                this.linea, this.columna, "SEM-001")
        }
        variable.setValor(nuevo)
        return undefined
    }
}