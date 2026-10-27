


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import Simbolo from "../simbolo/simbolo"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"
import { NATIVAS } from "../../infraestructura/nativas"

export class Parametro { constructor(public tipo: Tipo, public id: string) {} }

/** Valor que se guarda en la tabla de símbolos para una función declarada. */
export class Funcion {
    constructor(public nombre: string, public params: Parametro[], public tipoRetorno: Tipo | null,
                public cuerpo: Instruccion[], public entorno: TablaSimbolo) {}
}

// function canDeploy(server s, int minMemory) bool { ... }
export default class DeclaracionFuncion extends Instruccion {
    constructor(private nombre: string, private params: Parametro[], private tipoRetorno: Tipo | null,
                private cuerpo: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        if (Object.prototype.hasOwnProperty.call(NATIVAS, this.nombre)) {
            return new Errores("Semántico", `'${this.nombre}' es una función nativa y no puede redefinirse`, this.linea, this.columna, "SEM-002")
        }
        const vistos = new Set<string>()
        for (const p of this.params) {
            if (vistos.has(p.id)) return new Errores("Semántico", `Parámetro duplicado '${p.id}' en '${this.nombre}'`, this.linea, this.columna, "SEM-002")
            vistos.add(p.id)
        }
        // 'tabla' es el entorno donde se declara: las llamadas enlazarán su entorno local a este
        const f = new Funcion(this.nombre, this.params, this.tipoRetorno, this.cuerpo, tabla)
        if (!tabla.setVariable(new Simbolo(new Tipo(tipoDato.VOID), this.nombre, f, "funcion"))) {
            return new Errores("Semántico", `El identificador '${this.nombre}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002")
        }
        return undefined
    }
}