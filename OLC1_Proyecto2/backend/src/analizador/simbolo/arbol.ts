
import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import tablaSimbolo from "./tablaSimbolo";



export default class Arbol {
    private instrucciones: Array<Instruccion>
    private consola: string
    private tablaGlobal: tablaSimbolo
    private errores: Array<Errores>

    // Límites de segurida configurables
    private ejecutadas = 0
    private profundidad = 0

    constructor(instrucciones: Array<Instruccion>, private maxInstrucciones = 100000, private maxProfundidad = 1000) {
        this.instrucciones = instrucciones
        this.consola = ""
        this.tablaGlobal = new tablaSimbolo()
        this.errores = new Array<Errores>()
    }
    public getInstrucciones(): Array<Instruccion> { return this.instrucciones }
    public getConsola(): string { return this.consola }
    public getTablaGlobal(): tablaSimbolo { return this.tablaGlobal }
    public getErrores(): Array<Errores> { return this.errores }

    public agregarError(e: Errores) { this.errores.push(e) }

    /** Salida de print() */
    public Print(entrada: any) { this.consola += `${entrada}\n` }

    /** Bitácora de la infraestructura: [OK] / [WARN] */
    public log(nivel: "OK" | "WARN", mensaje: string) { this.consola += `[${nivel}] ${mensaje}\n` }

    /** Se llama por cada instrucción ejecutada. Devuelve un Errores al superar el límite. */
    public tick(linea: number, columna: number): Errores | null {
        if (++this.ejecutadas > this.maxInstrucciones) {
            return new Errores("Ejecución", `Se superó el límite de ${this.maxInstrucciones} instrucciones ejecutadas (posible ciclo infinito)`, linea, columna, "EXE-002")
        }
        return null
    }
    public entrarLlamada(linea: number, columna: number): Errores | null {
        if (this.profundidad + 1 > this.maxProfundidad) {
            return new Errores("Ejecución", `Se superó la profundidad máxima de llamadas (${this.maxProfundidad})`, linea, columna, "EXE-003")
        }
        this.profundidad++
        return null
    }
    public salirLlamada() { this.profundidad-- }
}