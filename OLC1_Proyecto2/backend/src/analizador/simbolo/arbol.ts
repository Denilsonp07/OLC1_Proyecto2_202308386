
import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import tablaSimbolo from "./tablaSimbolo";

export default class Arbol{
    private instrucciones: Array<Instruccion>
    private consola:string
    private tablaGlobal: tablaSimbolo
    private errores: Array<Errores>
    
    constructor(instrucciones: Array<Instruccion>) {
        this.instrucciones = instrucciones;
        this.consola = "";
        this.tablaGlobal = new tablaSimbolo();
        this.errores = new Array<Errores>();
    }
    public getInstrucciones(): Array<Instruccion> {
        return this.instrucciones;
    }
    public getConsola(): string {
        return this.consola;
    }   
    public getTablaGlobal(): tablaSimbolo {
        return this.tablaGlobal;
    }
    public getErrores(): Array<Errores> {
        return this.errores;
    }
    public setInstrucciones(instrucciones: Array<Instruccion>): void {
        this.instrucciones = instrucciones;
    }
    public setConsola(consola: string): void {
        this.consola = consola;
    }
    public setTablaGlobal(tablaGlobal: tablaSimbolo): void {
        this.tablaGlobal = tablaGlobal;
    }
    public setErrores(errores: Array<Errores>): void {
        this.errores = errores;
    }

    public Print(entrada: any) {
        this.consola = `${this.consola}${entrada}\n`
    }
    
}