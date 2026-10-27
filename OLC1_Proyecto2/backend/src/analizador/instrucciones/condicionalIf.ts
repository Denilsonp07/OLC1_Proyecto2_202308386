

//if <condicion>{
//Instruccion
//}
//else{  Instruccion}

import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import { ejecutarBloque } from "../abstracto/bloque"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, nombreTipo } from "../simbolo/tipo"

// if cond { ... } else { ... }      (else if = un else que contiene otro if)
export default class CondicionalIf extends Instruccion {
    constructor(private condicion: Instruccion, private instruccionesIf: Instruccion[],
                private instruccionesElse: Instruccion[] | undefined, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const cond = this.condicion.interpretar(arbol, tabla)
        if (cond instanceof Errores) return cond
        if (this.condicion.tipoDato.getTipo() !== tipoDato.BOOLEAN) {
            return new Errores("Semántico", `La condición del if debe producir bool, produjo ${nombreTipo(this.condicion.tipoDato)}`, this.linea, this.columna, "SEM-001")
        }
        // Cada bloque tiene su propio ámbito. El resultado (Errores / Senal) sube tal cual:
        // el if NO absorbe break/continue/return.
        if (cond) return ejecutarBloque(this.instruccionesIf, arbol, tabla.crearHijo("if"))
        if (this.instruccionesElse !== undefined) return ejecutarBloque(this.instruccionesElse, arbol, tabla.crearHijo("else"))
        return undefined
    }
}