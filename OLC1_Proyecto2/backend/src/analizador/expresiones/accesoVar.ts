//var a entero= 10
//var total entero= a+15
//print(total)

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";


export default class AccesoVar extends Instruccion{
    private id:string 

    constructor(id:string, linea:number, columna:number){
        super(new Tipo(tipoDato.VOID), linea, columna)
        this.id=id
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        let valor=tabla.getVariable(this.id)

        if(valor==null){
            return new Errores("Semantico","No se puede acceder al valor de esta variable",this.linea,this.columna)
        }

        this.tipoDato=valor.getTipo()

        return valor.getValor()
    }
}