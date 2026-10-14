


import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";
import { Server } from "../../infraestructura/Server";

const PROPS_SERVER: Record<string, tipoDato> = {
    cpu: tipoDato.ENTERO,
    memory: tipoDato.ENTERO,
    disk: tipoDato.ENTERO,
    os: tipoDato.CADENA,
    status: tipoDato.CADENA,
};

// recurso.propiedad   (ej: backend.memory)
export default class AccesoPropiedad extends Instruccion {
    private id: string;
    private propiedad: string;

    constructor(id: string, propiedad: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna);
        this.id = id;
        this.propiedad = propiedad;
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const simbolo = tabla.getVariable(this.id);
        if (simbolo == null) {
            return new Errores("Semántico", `'${this.id}' no ha sido declarado`, this.linea, this.columna);
        }
        const recurso = simbolo.getValor();
        if (!(recurso instanceof Server)) {
            return new Errores("Semántico", `'${this.id}' no es un recurso`, this.linea, this.columna);
        }
        if (!(this.propiedad in PROPS_SERVER)) {
            return new Errores("Semántico", `La propiedad '${this.propiedad}' no existe en server`, this.linea, this.columna);
        }
        this.tipoDato.setTipo(PROPS_SERVER[this.propiedad]);
        return (recurso as any)[this.propiedad];
    }
}