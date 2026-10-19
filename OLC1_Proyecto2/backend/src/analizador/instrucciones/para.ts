import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Senal, { TipoSenal } from "../abstracto/senal"
import { ejecutarBloque } from "../abstracto/bloque"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, nombreTipo } from "../simbolo/tipo"

// for (int i = 0; i < 3; i = i + 1) { ... }
export default class Para extends Instruccion {
    constructor(private inicio: Instruccion, private condicion: Instruccion, private incremento: Instruccion,
                private cuerpo: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tablaPadre: TablaSimbolo) {
        const tablaFor = tablaPadre.crearHijo()      // 'i' vive aquí y no se filtra al exterior
        const ini = this.inicio.interpretar(arbol, tablaFor)
        if (ini instanceof Errores) return ini

        while (true) {
            const cond = this.condicion.interpretar(arbol, tablaFor)
            if (cond instanceof Errores) return cond
            if (this.condicion.tipoDato.getTipo() !== tipoDato.BOOLEAN) {
                return new Errores("Semántico", `La condición del for debe producir bool, produjo ${nombreTipo(this.condicion.tipoDato)}`, this.linea, this.columna, "SEM-001")
            }
            if (!cond) break

            const limite = arbol.tick(this.linea, this.columna)
            if (limite) return limite

            const r = ejecutarBloque(this.cuerpo, arbol, tablaFor.crearHijo())
            if (r instanceof Errores) return r
            if (r instanceof Senal) {
                if (r.tipo === TipoSenal.BREAK) break
                if (r.tipo === TipoSenal.RETURN) return r
                // CONTINUE: no hace nada aquí, así se salta el resto del cuerpo PERO igual corre el incremento
            }

            const inc = this.incremento.interpretar(arbol, tablaFor)
            if (inc instanceof Errores) return inc
        }
        return undefined
    }
}