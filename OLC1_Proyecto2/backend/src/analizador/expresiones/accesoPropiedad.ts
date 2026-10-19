


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"

import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"
import { Recurso } from "../../infraestructura/recursos"
import { getDef } from "../../infraestructura/validacion"

// recurso.propiedad   (encadenable: api.host.os, api.dependsOn[0].status)
export default class AccesoPropiedad extends Instruccion {
    constructor(private base: Instruccion, private propiedad: string, linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const r = this.base.interpretar(arbol, tabla)
        if (r instanceof Errores) return r
        if (r === null) {
            return new Errores("Ejecución", `No se puede leer '${this.propiedad}' de un valor null (¿el servicio ya fue desplegado?)`, this.linea, this.columna, "EXE-004")
        }
        if (!(r instanceof Recurso)) {
            return new Errores("Semántico", `Solo los recursos tienen propiedades; no se puede leer '${this.propiedad}'`, this.linea, this.columna, "SEM-008")
        }
        const def = getDef(r.tipoRecurso, this.propiedad)
        if (!def) {
            return new Errores("Semántico", `La propiedad '${this.propiedad}' no existe en ${r.tipoRecurso} '${r.nombre}'`, this.linea, this.columna, "SEM-004")
        }
        this.tipoDato = def.tipo.clonar()
        return (r as any)[this.propiedad]
    }
}