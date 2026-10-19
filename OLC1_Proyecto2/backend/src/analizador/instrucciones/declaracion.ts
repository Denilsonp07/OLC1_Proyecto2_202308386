

import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import Simbolo from "../simbolo/simbolo"


import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { compatible, nombreTipo, valorPorDefecto } from "../simbolo/tipo"

// int x = 5;     string[] p = ["a"];     int y;   (sin valor -> valor por defecto, sección 5.1)
export default class Declaracion extends Instruccion {
    constructor(tipo: Tipo, linea: number, columna: number, private id: string, private valor: Instruccion | null) {
        super(tipo, linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        let valor: any
        if (this.valor === null) {
            valor = valorPorDefecto(this.tipoDato)
        } else {
            valor = this.valor.interpretar(arbol, tabla)
            if (valor instanceof Errores) return valor
            // tipo DECLARADO vs tipo de la EXPRESIÓN (int -> float permitido)
            if (!compatible(this.tipoDato, this.valor.tipoDato)) {
                return new Errores("Semántico",
                    `No se puede asignar ${nombreTipo(this.valor.tipoDato)} a '${this.id}' de tipo ${nombreTipo(this.tipoDato)}`,
                    this.linea, this.columna, "SEM-001")
            }
        }
        if (!tabla.setVariable(new Simbolo(this.tipoDato, this.id, valor))) {
            return new Errores("Semántico", `El identificador '${this.id}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002")
        }
        return undefined
    }
}