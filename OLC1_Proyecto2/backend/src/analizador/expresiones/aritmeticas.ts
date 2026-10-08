

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";



//E+E
//E-E
//E*E

export default class Aritmeticas extends Instruccion{
        private operando1: Instruccion
        private operando2: Instruccion

        private operador: OperadoresAritmeticos

        constructor(operador:OperadoresAritmeticos, operando1: Instruccion, operando2:Instruccion, linea:number, columna:number){
            super(new Tipo(tipoDato.ENTERO), linea, columna)
            this.operador=operador
            this.operando1=operando1
            this.operando2=operando2

        }
        interpretar(arbol: Arbol, tabla: TablaSimbolo) {

            let opIzq, opDer=null

            opIzq=this.operando1.interpretar(arbol,tabla)
            if(opIzq instanceof Errores) return opIzq
            opDer=this.operando2.interpretar(arbol,tabla)
            if(opDer instanceof Errores) return opDer

            switch (this.operador){
                case OperadoresAritmeticos.SUMA:
                    return this.suma(opIzq,opDer)
                
                
            }

            
        }
        //entero + entero
        //entero + decimal

        suma(op1:any, op2:any){
            let tipo1 = this.operando1?.tipoDato.getTipo()
            let tipo2 = this.operando2?.tipoDato.getTipo()

            switch (tipo1){
                case tipoDato.ENTERO:
                    switch(tipo2){
                        case tipoDato.ENTERO:
                            this.tipoDato.setTipo(tipoDato.ENTERO)
                            return parseInt(op1)+ parseInt(op2)

                        case tipoDato.DECIMAL:
                            this.tipoDato.setTipo(tipoDato.DECIMAL)
                            return parseFloat(op1)+ parseFloat(op2)

                        default:
                            return new Errores("Semantico","suma entre operadores no existe", this.linea, this.columna)

                    }
                case tipoDato.DECIMAL:
                    switch(tipo2){
                        case tipoDato.ENTERO:
                            this.tipoDato.setTipo(tipoDato.DECIMAL)
                            return parseFloat(op1)+ parseFloat(op2)

                        case tipoDato.DECIMAL:
                            this.tipoDato.setTipo(tipoDato.DECIMAL)
                            return parseFloat(op1)+ parseFloat(op2)

                        default:
                            return new Errores("Semantico","suma entre operadores no existe", this.linea, this.columna)

                    }
            }


        
        }
        



}

export enum OperadoresAritmeticos{
    SUMA,
    RESTA,
    MULT
}