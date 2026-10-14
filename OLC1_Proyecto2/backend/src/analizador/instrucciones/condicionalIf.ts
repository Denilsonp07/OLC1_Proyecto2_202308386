

//if <condicion>{
//Instruccion
//}
//else{  Instruccion}

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";


export default class CondicionalIf extends Instruccion{
    private condicion:Instruccion
    private instruccionesIf: Instruccion[]
    private instruccionesElse: Instruccion[] | undefined
    
    constructor(condicion: Instruccion, instruccionesIf: Instruccion[], instruccionesElse: Instruccion[] | undefined, linea: number, columna: number){
        super(new Tipo(tipoDato.VOID), linea, columna);
        this.condicion = condicion;
        this.instruccionesIf = instruccionesIf;
        this.instruccionesElse = instruccionesElse;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        let cond=this.condicion.interpretar(arbol,tabla)

        if(cond instanceof Errores) return cond

        if( this.condicion.tipoDato.getTipo() != tipoDato.BOOLEAN){
            return new Errores("Semantico", "La condicion debe ser un booleano",this.linea, this.columna)
        }

        if(cond){
            const tablaIf = tabla.crearHijo()
            for(let i of this.instruccionesIf){
                if(i instanceof Instruccion){
                    let resultado = i.interpretar(arbol,tablaIf)
                    if(resultado instanceof Errores) return resultado
                }
            }
        }else {
           if(this.instruccionesElse != undefined){
                const tablaElse = tabla.crearHijo()
                for(let i of this.instruccionesElse){
                    if(i instanceof Instruccion){
                        let resultado= i.interpretar(arbol,tablaElse)
                        if(resultado instanceof Errores) return resultado
                    }
                }
            }
        }

        
    }
}