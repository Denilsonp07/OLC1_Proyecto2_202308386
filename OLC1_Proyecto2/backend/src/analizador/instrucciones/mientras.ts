


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Senal, { TipoSenal } from "../abstracto/senal"


import { ejecutarBloque } from "../abstracto/bloque"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, nombreTipo } from "../simbolo/tipo"

// while cond { ... }
export default class Mientras extends Instruccion {
    constructor(private condicion: Instruccion, private cuerpo: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        while (true) {
            const cond = this.condicion.interpretar(arbol, tabla)
            if (cond instanceof Errores) return cond
            if (this.condicion.tipoDato.getTipo() !== tipoDato.BOOLEAN) {
                return new Errores("Semántico", `La condición del while debe producir bool, produjo ${nombreTipo(this.condicion.tipoDato)}`, this.linea, this.columna, "SEM-001")
            }
            if (!cond) break

            const limite = arbol.tick(this.linea, this.columna)   // un while con cuerpo vacío también debe poder cortarse
            if (limite) return limite

            const r = ejecutarBloque(this.cuerpo, arbol, tabla.crearHijo())   // ámbito nuevo por iteración
            if (r instanceof Errores) return r
            if (r instanceof Senal) {
                if (r.tipo === TipoSenal.BREAK) break
                if (r.tipo === TipoSenal.CONTINUE) continue
                return r    // RETURN: no es de este ciclo, sigue subiendo
            }
        }
        return undefined
    }
}