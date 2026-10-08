

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import Simbolo from "../simbolo/simbolo";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo from "../simbolo/tipo";


//id 
//valor
//tipoDato

export default class Declaracion extends Instruccion{
    private id:string
    private valor:Instruccion|null

    constructor(tipo:Tipo, linea:number, columna:number, id:string, valor:Instruccion){
        super(tipo,linea,columna)
        this.id=id
        this.valor=valor
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        if(this.valor==null){
            if(!tabla.setVariable(new Simbolo(this.tipoDato,this.id,null))){
                return new Errores('Semantico', "no se pude declarar la variable", this.linea, this.columna)
            }
            return
        }

        let resValor=this.valor.interpretar(arbol,tabla)
        if(resValor instanceof Errores) return resValor

        if(this.tipoDato.getTipo() != this.tipoDato.getTipo()){
            return new Errores("Semantico", "el tipo de dato no coincide", this.linea,this.columna)
        }

        if(!tabla.setVariable(new Simbolo(this.tipoDato,this.id,resValor))){
            return new Errores("semantico", "La variable ya existe", this.linea,this.columna)
        }
        return null
    }
}