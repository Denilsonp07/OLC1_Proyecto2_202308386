

//import { execPath } from "process";
import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import Simbolo from "../simbolo/simbolo";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, {tipoDato}  from "../simbolo/tipo";

export default class Imprimir extends Instruccion{

    private expresion:Instruccion

    constructor( expresion:Instruccion,linea:number, columna:number){
        super(new Tipo(tipoDato.VOID),linea, columna)
        this.expresion=expresion
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        let resValor=this.expresion.interpretar(arbol,tabla)

        if (resValor instanceof Errores) return resValor

        arbol.Print(resValor)
    }

}