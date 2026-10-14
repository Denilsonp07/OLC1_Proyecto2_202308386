

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
                case OperadoresAritmeticos.RESTA:
                    return this.numerica(opIzq,opDer,(a,b)=>a-b,"resta")
                case OperadoresAritmeticos.MULT:
                    return this.numerica(opIzq,opDer,(a,b)=>a*b,"multiplicación")
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

                        
                        case tipoDato.CADENA:
                            // sección 26.1: string + cualquier primitivo = concatenación
                            this.tipoDato.setTipo(tipoDato.CADENA)
                            return `${op1}${op2}`
                        default:
                        return new Errores("Semántico","suma entre operadores no existe", this.linea, this.columna)


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

                // resta y multiplicación: int op int = int; si hay float = float; otra cosa = error
        numerica(op1:any, op2:any, operacion:(a:number,b:number)=>number, nombre:string){
            const t1 = this.operando1.tipoDato.getTipo()
            const t2 = this.operando2.tipoDato.getTipo()
            const esNum = (t:tipoDato)=> t===tipoDato.ENTERO || t===tipoDato.DECIMAL
            if(!esNum(t1) || !esNum(t2)){
                return new Errores("Semántico",`${nombre} entre operadores no existe`, this.linea, this.columna)
            }
            const hayDecimal = t1===tipoDato.DECIMAL || t2===tipoDato.DECIMAL
            this.tipoDato.setTipo(hayDecimal ? tipoDato.DECIMAL : tipoDato.ENTERO)
            return operacion(Number(op1), Number(op2))
        }




    

}

export enum OperadoresAritmeticos{
    SUMA,
    RESTA,
    MULT
}