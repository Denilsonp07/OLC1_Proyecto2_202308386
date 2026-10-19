



import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, esRecurso } from "../simbolo/tipo"

// ["docker", "git"]   ->   string[]      ([] vacío es compatible con cualquier T[])
export default class Arreglo extends Instruccion {
    constructor(private elementos: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.ARREGLO), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const valores: any[] = []
        const tipos: tipoDato[] = []
        for (const e of this.elementos) {
            const v = e.interpretar(arbol, tabla)
            if (v instanceof Errores) return v
            valores.push(v)
            tipos.push(e.tipoDato.getTipo())
        }
        if (valores.length === 0) { this.tipoDato = new Tipo(tipoDato.ARREGLO, undefined); return valores }

        let elem = tipos[0]
        for (const t of tipos) {
            if (t === elem) continue
            if (esRecurso(t) && esRecurso(elem)) { elem = tipoDato.RECURSO; continue }   // recursos mezclados: resource[]
            return new Errores("Semántico", "Los arreglos deben contener elementos de un mismo tipo", this.linea, this.columna, "SEM-001")
        }
        if (elem === tipoDato.ARREGLO) {
            return new Errores("Semántico", "No se admiten arreglos anidados", this.linea, this.columna, "SEM-001")
        }
        this.tipoDato = new Tipo(tipoDato.ARREGLO, elem)
        return valores
    }
}