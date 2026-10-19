


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Senal, { TipoSenal } from "../abstracto/senal"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"



// return expr;     return;
export default class Retorno extends Instruccion {
    constructor(private expresion: Instruccion | null, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        if (this.expresion === null) return new Senal(TipoSenal.RETURN, undefined, new Tipo(tipoDato.VOID), this.linea, this.columna)
        const v = this.expresion.interpretar(arbol, tabla)
        if (v instanceof Errores) return v
        return new Senal(TipoSenal.RETURN, v, this.expresion.tipoDato.clonar(), this.linea, this.columna)
    }
}