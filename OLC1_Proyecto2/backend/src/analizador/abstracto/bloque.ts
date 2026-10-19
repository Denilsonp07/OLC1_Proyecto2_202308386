

import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Errores from "../excepciones/errores"
import Senal from "./senal"
import { Instruccion } from "./instruccion"

/**
 * Ejecuta una lista de instrucciones EN ORDEN dentro de la tabla dada.
 * Se detiene en cuanto una devuelve un Errores o una Senal y la propaga hacia arriba.
 * Aquí se cuenta cada instrucción ejecutada para el límite de 100,000 (sección 7.5).
 */
export function ejecutarBloque(instrucciones: Instruccion[], arbol: Arbol, tabla: TablaSimbolo): Errores | Senal | undefined {
    for (const i of instrucciones) {
        const limite = arbol.tick(i.linea, i.columna)
        if (limite) return limite
        const r = i.interpretar(arbol, tabla)
        if (r instanceof Errores || r instanceof Senal) return r
    }
    return undefined
}