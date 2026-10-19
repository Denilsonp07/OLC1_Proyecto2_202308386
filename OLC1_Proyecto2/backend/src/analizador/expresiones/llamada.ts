


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Senal, { TipoSenal } from "../abstracto/senal"
import { ejecutarBloque } from "../abstracto/bloque"
import Arbol from "../simbolo/arbol"
import Simbolo from "../simbolo/simbolo"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, compatible, nombreTipo } from "../simbolo/tipo"
import { NATIVAS, cumple, Nativa } from "../../infraestructura/nativas"
import { Funcion } from "../instrucciones/declaracionFuncion"

// nombre(arg1, arg2...)   -> función nativa o función del usuario
export default class Llamada extends Instruccion {
    constructor(private id: string, private args: Instruccion[], linea: number, columna: number) {
        super(new Tipo(tipoDato.VOID), linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const nativa = Object.prototype.hasOwnProperty.call(NATIVAS, this.id) ? NATIVAS[this.id] : undefined
        const valorSim = nativa ? undefined : tabla.getVariable(this.id)?.getValor()
        const funcion = valorSim instanceof Funcion ? valorSim : undefined
        if (!nativa && !funcion) {
            return new Errores("Semántico", `La función '${this.id}' no existe`, this.linea, this.columna, "SEM-003")
        }

        // argumentos evaluados de izquierda a derecha
        const valores: any[] = []
        const tipos: Tipo[] = []
        for (const a of this.args) {
            const v = a.interpretar(arbol, tabla)
            if (v instanceof Errores) return v
            valores.push(v)
            tipos.push(a.tipoDato.clonar())
        }
        return nativa ? this.llamarNativa(nativa, valores, tipos, arbol) : this.llamarFuncion(funcion!, valores, tipos, arbol)
    }

    private firmaIncorrecta(firma: string, motivo: string) {
        return new Errores("Semántico", `Firma incorrecta: ${firma} (${motivo})`, this.linea, this.columna, "SEM-007")
    }

    private llamarNativa(n: Nativa, valores: any[], tipos: Tipo[], arbol: Arbol) {
        const firma = `${this.id}(${n.params.join(", ")}${n.variadic ? "..." : ""})`
        if (!n.variadic) {
            if (valores.length !== n.params.length) return this.firmaIncorrecta(firma, `recibió ${valores.length} argumento(s)`)
            for (let i = 0; i < n.params.length; i++) {
                if (!cumple(n.params[i], tipos[i])) return this.firmaIncorrecta(firma, `el argumento ${i + 1} es ${nombreTipo(tipos[i])}`)
                if (n.params[i] !== "any" && n.params[i] !== "int" && n.params[i] !== "string" && valores[i] === null) {
                    return new Errores("Ejecución", `El argumento ${i + 1} de '${this.id}' es null`, this.linea, this.columna, "EXE-004")
                }
            }
        }
        const r = n.ejecutar(valores, tipos, arbol, this.linea, this.columna)
        this.tipoDato = new Tipo(n.retorno)
        return r
    }

    private llamarFuncion(f: Funcion, valores: any[], tipos: Tipo[], arbol: Arbol) {
        const firma = `${f.nombre}(${f.params.map(p => nombreTipo(p.tipo)).join(", ")})`
        if (valores.length !== f.params.length) return this.firmaIncorrecta(firma, `recibió ${valores.length} argumento(s)`)
        for (let i = 0; i < f.params.length; i++) {
            if (!compatible(f.params[i].tipo, tipos[i])) {
                return this.firmaIncorrecta(firma, `el argumento ${i + 1} es ${nombreTipo(tipos[i])} y se esperaba ${nombreTipo(f.params[i].tipo)}`)
            }
        }
        const limite = arbol.entrarLlamada(this.linea, this.columna)
        if (limite) return limite

        // Entorno NUEVO por llamada, enlazado al entorno donde se DECLARÓ la función (sección 8)
        const local = new TablaSimbolo(f.entorno)
        f.params.forEach((p, i) => local.setVariable(new Simbolo(p.tipo, p.id, valores[i])))
        const r = ejecutarBloque(f.cuerpo, arbol, local)
        arbol.salirLlamada()

        if (r instanceof Errores) return r
        if (r instanceof Senal && r.tipo !== TipoSenal.RETURN) {
            const que = r.tipo === TipoSenal.BREAK ? "break" : "continue"
            return new Errores("Semántico", `'${que}' utilizado fuera de un ciclo`, r.linea, r.columna, "SEM-006")
        }

        const esVoid = f.tipoRetorno === null
        if (r instanceof Senal) {   // RETURN
            if (esVoid && r.tipoValor && r.tipoValor.getTipo() !== tipoDato.VOID) {
                return new Errores("Semántico", `La función '${f.nombre}' no declara tipo de retorno pero retorna un valor`, this.linea, this.columna, "SEM-001")
            }
            if (!esVoid) {
                if (!r.tipoValor || !compatible(f.tipoRetorno!, r.tipoValor)) {
                    return new Errores("Semántico", `La función '${f.nombre}' debe retornar ${nombreTipo(f.tipoRetorno!)}`, this.linea, this.columna, "SEM-001")
                }
                this.tipoDato = f.tipoRetorno!.clonar()
                return r.valor
            }
        } else if (!esVoid) {
            return new Errores("Semántico", `La función '${f.nombre}' debe retornar un valor ${nombreTipo(f.tipoRetorno!)}`, this.linea, this.columna, "SEM-001")
        }
        this.tipoDato = new Tipo(tipoDato.VOID)
        return undefined
    }
}