
import { Instruccion } from "../abstracto/instruccion";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo from "../simbolo/tipo";


export default class Nativo extends Instruccion{
    valor: any

    constructor(tipo:Tipo, valor:any, linea:number, columna:number){
        super(tipo,linea,columna)
        this.valor=valor
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        return this.valor;
    }
}