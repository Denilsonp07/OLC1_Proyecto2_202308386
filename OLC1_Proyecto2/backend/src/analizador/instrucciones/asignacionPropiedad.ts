


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"


import Tipo, { tipoDato } from "../simbolo/tipo"
import { Recurso } from "../../infraestructura/recursos"
import { getDef, validarValor } from "../../infraestructura/validacion"



// recurso.propiedad = valor;     (las de solo lectura -> error semántico, sección 22.4)
export default class AsignacionPropiedad extends Instruccion {
    constructor(private base: Instruccion, private propiedad: string, private expresion: Instruccion,
                linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const r = this.base.interpretar(arbol, tabla)
        if (r instanceof Errores) return r
        if (r === null || r === undefined) {
            return new Errores("Ejecución", `No se puede modificar '${this.propiedad}' de un valor null`, this.linea, this.columna, "EXE-004")
        }
        if (!(r instanceof Recurso)) {
            return new Errores("Semántico", `Solo los recursos tienen propiedades; no se puede asignar '${this.propiedad}'`, this.linea, this.columna, "SEM-008")
        }
        const def = getDef(r.tipoRecurso, this.propiedad)
        if (!def) {
            return new Errores("Semántico", `La propiedad '${this.propiedad}' no existe en ${r.tipoRecurso} '${r.nombre}'`, this.linea, this.columna, "SEM-004")
        }
        if (def.soloLectura) {
            return new Errores("Semántico",
                `La propiedad '${this.propiedad}' es de solo lectura (solo cambia con funciones nativas como start/deploy)`,
                this.linea, this.columna, "SEM-005")
        }
        const valor = this.expresion.interpretar(arbol, tabla)
        if (valor instanceof Errores) return valor
        const err = validarValor(this.propiedad, def, valor, this.expresion.tipoDato, this.linea, this.columna)
        if (err) return err
        ;(r as any)[this.propiedad] = valor
        return undefined
    }
}