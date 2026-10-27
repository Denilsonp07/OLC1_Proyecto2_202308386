


import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import Simbolo from "../simbolo/simbolo"


import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato } from "../simbolo/tipo"
import { Recurso, Server, Service, Database, TipoRecurso } from "../../infraestructura/recursos"
import { CATALOGO, getDef, validarValor } from "../../infraestructura/validacion"

export interface PropiedadDada { nombre: string; expresion: Instruccion; linea: number; columna: number }

// server backend { cpu = 4; ... }     service api { ... }     database db { ... }
export default class DeclaracionRecurso extends Instruccion {
    constructor(tipo: Tipo, private id: string, private propiedades: PropiedadDada[], linea: number, columna: number) {
        super(tipo, linea, columna)
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const kind: TipoRecurso | undefined =
            this.tipoDato.getTipo() === tipoDato.SERVER ? "server" :
            this.tipoDato.getTipo() === tipoDato.SERVICE ? "service" :
            this.tipoDato.getTipo() === tipoDato.DATABASE ? "database" : undefined
        if (!kind) {
            return new Errores("Semántico", `'${this.id}': solo server, service y database admiten un bloque de propiedades`, this.linea, this.columna, "SEM-008")
        }

        const v: Record<string, any> = {}
        for (const p of this.propiedades) {
            const def = getDef(kind, p.nombre)
            if (!def) return new Errores("Semántico", `La propiedad '${p.nombre}' no existe en un recurso ${kind}`, p.linea, p.columna, "SEM-004")
            if (def.soloLectura) return new Errores("Semántico", `La propiedad '${p.nombre}' es de solo lectura`, p.linea, p.columna, "SEM-005")
            if (p.nombre in v) return new Errores("Semántico", `La propiedad '${p.nombre}' está duplicada`, p.linea, p.columna, "SEM-002")

            const valor = p.expresion.interpretar(arbol, tabla)
            if (valor instanceof Errores) return valor
            const err = validarValor(p.nombre, def, valor, p.expresion.tipoDato, p.linea, p.columna)
            if (err) return err
            v[p.nombre] = valor
        }
        for (const [nombre, def] of Object.entries(CATALOGO[kind])) {
            if (def.requerida && !(nombre in v)) {
                return new Errores("Semántico", `Falta la propiedad obligatoria '${nombre}' en ${kind} '${this.id}'`, this.linea, this.columna, "SEM-010")
            }
        }

        let recurso: Recurso
        if (kind === "server") recurso = new Server(this.id, v.cpu, v.memory, v.disk, v.os)
        else if (kind === "service") recurso = new Service(this.id, v.port, v.replicas ?? 1, v.dependsOn ?? [])
        else recurso = new Database(this.id, v.engine, v.version, v.port, v.dependsOn ?? [])

        if (!tabla.setVariable(new Simbolo(new Tipo(this.tipoDato.getTipo()), this.id, recurso, "recurso"))) {
            return new Errores("Semántico", `El identificador '${this.id}' ya fue declarado en este ámbito`, this.linea, this.columna, "SEM-002")
        }
        arbol.log("OK", `Resource '${this.id}' registered`)
        return undefined
    }
}