
import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";


//E<E  TRUE | FALSE
export default class Relacionales extends Instruccion{

    private operador1:Instruccion
    private operador2:Instruccion
    private Operacion:Op_relacionales

    private esNumerico(t:tipoDato){
        return t===tipoDato.ENTERO || t===tipoDato.DECIMAL
    }

    constructor(operacion:Op_relacionales,linea:number, columna:number,op1:Instruccion,op2:Instruccion){
        super(new Tipo(tipoDato.BOOLEAN), linea,columna)
        this.Operacion=operacion
        this.operador1=op1
        this.operador2=op2
    }
    interpretar(arbol: Arbol, tabla: TablaSimbolo) {

        let opIzq, opDer=null

        opIzq=this.operador1.interpretar(arbol,tabla)
        if(opIzq instanceof Errores) return opIzq

        opDer= this.operador2.interpretar(arbol,tabla)
        if(opDer instanceof Errores ) return opDer

        switch(this.Operacion){
            case Op_relacionales.IGUALDAD:
                return this.igualdad(opIzq, opDer)
            case Op_relacionales.MENOR:
                return this.menor(opIzq,opDer)
                
        }

        

    }

    igualdad(op1:any, op2:any){
        let tipo1= this.operador1.tipoDato.getTipo()
        let tipo2= this.operador2.tipoDato.getTipo()
        this.tipoDato.setTipo(tipoDato.BOOLEAN)

        if(this.esNumerico(tipo1) && this.esNumerico(tipo2)) return Number(op1) === Number(op2)
        if(tipo1===tipoDato.CADENA  && tipo2===tipoDato.CADENA)  return op1 === op2
        if(tipo1===tipoDato.BOOLEAN && tipo2===tipoDato.BOOLEAN) return op1 === op2
        return new Errores("Semántico", "Los operandos de == no son compatibles", this.linea, this.columna)
    }


    menor(op1:any, op2:any){
        let tipo1= this.operador1.tipoDato.getTipo()
        let tipo2= this.operador2.tipoDato.getTipo()
        this.tipoDato.setTipo(tipoDato.BOOLEAN)

        if(this.esNumerico(tipo1) && this.esNumerico(tipo2)) return Number(op1) < Number(op2)
        return new Errores("Semántico", "El operador < requiere int o float en ambos lados", this.linea, this.columna)
    }


    
}
export enum Op_relacionales{
    IGUALDAD,
    MENOR
}