

import Tipo, { tipoDato, compatible, nombreTipo } from "../analizador/simbolo/tipo"
import Errores from "../analizador/excepciones/errores"
import { TipoRecurso } from "./recursos"



export interface DefPropiedad {
    tipo: Tipo
    soloLectura: boolean
    requerida: boolean
    validar?: (v: any) => string | null     // devuelve el motivo si el valor NO es válido
}

const INT = new Tipo(tipoDato.ENTERO), STR = new Tipo(tipoDato.CADENA)
const mayorQueCero = (v: number) => (v > 0 ? null : "debe ser mayor que 0")
const puerto = (v: number) => (v >= 1 && v <= 65535 ? null : "debe estar entre 1 y 65535")
const noVacio = (v: string) => (v.length > 0 ? null : "no puede estar vacío")
const dependencias = new Tipo(tipoDato.ARREGLO, tipoDato.RECURSO)

// Catálogo de propiedades por recurso (secciones 9 y 27). Lo que no esté aquí NO existe.
export const CATALOGO: Record<TipoRecurso, Record<string, DefPropiedad>> = {
    server: {
        cpu:      { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        memory:   { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        disk:     { tipo: INT, soloLectura: false, requerida: true, validar: mayorQueCero },
        os:       { tipo: STR, soloLectura: false, requerida: true, validar: noVacio },
        status:   { tipo: STR, soloLectura: true,  requerida: false },
        packages: { tipo: new Tipo(tipoDato.ARREGLO, tipoDato.CADENA), soloLectura: true, requerida: false },
    },
    service: {
        port:      { tipo: INT, soloLectura: false, requerida: true, validar: puerto },
        replicas:  { tipo: INT, soloLectura: false, requerida: false, validar: (v: number) => (v >= 1 ? null : "debe ser >= 1") },
        status:    { tipo: STR, soloLectura: true,  requerida: false },
        host:      { tipo: new Tipo(tipoDato.SERVER), soloLectura: true, requerida: false },
        dependsOn: { tipo: dependencias, soloLectura: false, requerida: false },
    },
    database: {
        engine:    { tipo: STR, soloLectura: false, requerida: true,
                     validar: (v: string) => (["postgresql", "mysql", "sqlite"].includes(v) ? null : "debe ser postgresql, mysql o sqlite") },
        version:   { tipo: STR, soloLectura: false, requerida: true, validar: noVacio },
        port:      { tipo: INT, soloLectura: false, requerida: true, validar: puerto },
        status:    { tipo: STR, soloLectura: true,  requerida: false },
        dependsOn: { tipo: dependencias, soloLectura: false, requerida: false },
    },
}

/** Valida tipo y restricción numérica/textual de un valor para una propiedad. */
export function validarValor(nombre: string, def: DefPropiedad, valor: any, tipoValor: Tipo, linea: number, columna: number): Errores | null {
    if (!compatible(def.tipo, tipoValor)) {
        return new Errores("Semántico", `La propiedad '${nombre}' espera ${nombreTipo(def.tipo)} y recibió ${nombreTipo(tipoValor)}`, linea, columna, "SEM-001")
    }
    if (def.validar) {
        const motivo = def.validar(valor)
        if (motivo) return new Errores("Semántico", `La propiedad '${nombre}' ${motivo}`, linea, columna, "SEM-009")
    }
    return null
}

/** Busca la definición de una propiedad SIN tropezar con 'constructor', 'toString', etc. del prototipo. */
export function getDef(tipo: TipoRecurso, nombre: string): DefPropiedad | undefined {
    return Object.prototype.hasOwnProperty.call(CATALOGO[tipo], nombre) ? CATALOGO[tipo][nombre] : undefined
}