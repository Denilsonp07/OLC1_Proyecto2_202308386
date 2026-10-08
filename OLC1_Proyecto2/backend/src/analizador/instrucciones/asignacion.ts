

//var id1 entero = 10
//id = expresion   | hola

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";

import Tipo, {tipoDato} from "../simbolo/tipo";

export default class AsignacionVar extends Instruccion{
    private id:string
    private expresion:Instruccion

    constructor(id:string, expresion:Instruccion, linea:number, columna:number){
        super(new Tipo(tipoDato.VOID),linea,columna)
        this.id=id
        this.expresion=expresion

    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        let variable=tabla.getVariable(this.id)

        if(variable ==null){
            return new Errores("Semantico", "La variable no existe", this.linea, this.columna)
        }

        let newValor=this.expresion.interpretar(arbol,tabla)

        if(newValor instanceof Errores) return newValor

        if(this.expresion.tipoDato.getTipo() != variable.getTipo().getTipo()){
            return new Errores("Semantico", "Los tipos deben de ser iguales", this.linea, this.columna)
        }

        this.tipoDato=variable.getTipo()

        variable.setValor(newValor)

    }
}