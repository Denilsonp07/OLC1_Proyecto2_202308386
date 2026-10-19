


import { Instruccion } from "../abstracto/instruccion"
import Senal, { TipoSenal } from "../abstracto/senal"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"




export class Romper extends Instruccion {
    constructor(linea: number, columna: number) { super(new Tipo(tipoDato.VOID), linea, columna) }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) { return new Senal(TipoSenal.BREAK, undefined, undefined, this.linea, this.columna) }
}

export class Continuar extends Instruccion {
    constructor(linea: number, columna: number) { super(new Tipo(tipoDato.VOID), linea, columna) }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) { return new Senal(TipoSenal.CONTINUE, undefined, undefined, this.linea, this.columna) }
}