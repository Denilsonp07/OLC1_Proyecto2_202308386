


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Senal, { TipoSenal } from "../abstracto/senal"
import { ejecutarBloque } from "../abstracto/bloque"


import Arbol from "../simbolo/arbol"
import Simbolo from "../simbolo/simbolo"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"

export class Tarea { constructor(public nombre: string, public cuerpo: Instruccion[], public entorno: TablaSimbolo) {} }

/** Un break/continue/return que llega hasta aquí no tenía ciclo/función que lo absorba: error semántico. */
function senalHuerfana(s: Senal): Errores {
    const msg = s.tipo === TipoSenal.RETURN ? "'return' utilizado fuera de una función"
              : s.tipo === TipoSenal.BREAK ? "'break' utilizado fuera de un ciclo"
              : "'continue' utilizado fuera de un ciclo"
    return new Errores("Semántico", msg, s.linea, s.columna, "SEM-006")
}

// task produccion { ... }     (sin parámetros, sección 11)
export class DeclaracionTask extends Instruccion {
    constructor(private nombre: string, private cuerpo: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        if (!tabla.setVariable(new Simbolo(new Tipo(tipoDato.VOID), this.nombre, new Tarea(this.nombre, this.cuerpo, tabla)))) {
            return new Errores("Semántico", `El identificador '${this.nombre}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002")
        }
        return undefined
    }
}

// run produccion;
export class RunTask extends Instruccion {
    constructor(private nombre: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const t = tabla.getVariable(this.nombre)?.getValor()
        if (!(t instanceof Tarea)) {
            return new Errores("Semántico", `La tarea '${this.nombre}' no existe`, this.linea, this.columna, "SEM-003")
        }
        const limite = arbol.entrarLlamada(this.linea, this.columna)
        if (limite) return limite
        const r = ejecutarBloque(t.cuerpo, arbol, new TablaSimbolo(t.entorno))
        arbol.salirLlamada()
        if (r instanceof Errores) return r
        if (r instanceof Senal) return senalHuerfana(r)
        return undefined
    }
}

// main { ... }     (punto de entrada único, sección 15)
export class Main extends Instruccion {
    constructor(private cuerpo: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const r = ejecutarBloque(this.cuerpo, arbol, tabla.crearHijo())
        if (r instanceof Errores) return r
        if (r instanceof Senal) return senalHuerfana(r)
        return undefined
    }
}
