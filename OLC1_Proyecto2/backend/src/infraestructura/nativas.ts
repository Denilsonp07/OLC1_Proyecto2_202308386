


import Arbol from "../analizador/simbolo/arbol"
import Errores from "../analizador/excepciones/errores"
import Tipo, { tipoDato, esRecurso, aTexto } from "../analizador/simbolo/tipo"
import { Recurso, Server, Service } from "./recursos"

/**
 * Funciones nativas (sección 10). Codificadas explícitamente aquí: no se ejecuta nada del sistema.
 * ATOMICIDAD (sección 12.2): cada una valida TODAS sus precondiciones antes de tocar el estado.
 *  - Precondición de infraestructura que falla -> se registra un error INFRA-xxx y retorna false.
 *  - Operación redundante (start sobre running...) -> [WARN] en la bitácora y retorna false.
 */
type Param = "resource" | "server" | "service" | "string" | "int" | "array" | "any"

export interface Nativa {
    params: Param[]
    variadic?: boolean
    retorno: tipoDato
    ejecutar: (a: any, t: Tipo[], arbol: Arbol, linea: number, col: number) => any
}

export function cumple(p: Param, t: Tipo): boolean {
    switch (p) {
        case "any": return true
        case "resource": return esRecurso(t.getTipo())
        case "server": return t.getTipo() === tipoDato.SERVER
        case "service": return t.getTipo() === tipoDato.SERVICE
        case "string": return t.getTipo() === tipoDato.CADENA
        case "int": return t.getTipo() === tipoDato.ENTERO
        case "array": return t.getTipo() === tipoDato.ARREGLO
    }
}

const infra = (arbol: Arbol, l: number, c: number, codigo: string, msg: string) => {
    arbol.agregarError(new Errores("Infraestructura", msg, l, c, codigo))
    return false
}
const aviso = (arbol: Arbol, msg: string) => { arbol.log("WARN", msg); return false }

const imprimir = (a: any[], t: Tipo[], arbol: Arbol) => {
    arbol.Print(a.map((v, i) => aTexto(v, t[i])).join(" "))
    return undefined
}

export const NATIVAS: Record<string, Nativa> = {
    start: { params: ["resource"], retorno: tipoDato.BOOLEAN, ejecutar: ([r]: [Recurso], _t, arbol, l, c) => {
        if (r.status === "running") return aviso(arbol, `${r.nombre} ya se encuentra en ejecución (start no tiene efecto)`)
        if (r instanceof Service && r.status === "undeployed") {
            return infra(arbol, l, c, "INFRA-006", `No se puede iniciar '${r.nombre}': el servicio no ha sido desplegado`)
        }
        r.status = "running"
        arbol.log("OK", `${r.nombre} -> running`)
        return true
    }},
    stop: { params: ["resource"], retorno: tipoDato.BOOLEAN, ejecutar: ([r]: [Recurso], _t, arbol) => {
        if (r.status !== "running") return aviso(arbol, `${r.nombre} no está en ejecución (stop no tiene efecto)`)
        r.status = "stopped"
        arbol.log("OK", `${r.nombre} -> stopped`)
        return true
    }},
    restart: { params: ["resource"], retorno: tipoDato.BOOLEAN, ejecutar: ([r]: [Recurso], _t, arbol) => {
        if (r.status !== "running") return aviso(arbol, `${r.nombre} no está activo: no se puede reiniciar`)
        arbol.log("OK", `${r.nombre} restarted`)
        return true
    }},
    install: { params: ["server", "string"], retorno: tipoDato.BOOLEAN, ejecutar: ([s, pkg]: [Server, string], _t, arbol, l, c) => {
        if (s.status !== "running") return infra(arbol, l, c, "INFRA-001", `No se puede instalar '${pkg}' en '${s.nombre}': el servidor está detenido`)
        if (s.packages.includes(pkg)) return aviso(arbol, `${pkg} ya está instalado en ${s.nombre}`)
        s.packages.push(pkg)
        arbol.log("OK", `${pkg} installed on ${s.nombre}`)
        return true
    }},
    uninstall: { params: ["server", "string"], retorno: tipoDato.BOOLEAN, ejecutar: ([s, pkg]: [Server, string], _t, arbol) => {
        if (!s.packages.includes(pkg)) return aviso(arbol, `${pkg} no está instalado en ${s.nombre}`)
        s.packages = s.packages.filter(p => p !== pkg)
        arbol.log("OK", `${pkg} uninstalled from ${s.nombre}`)
        return true
    }},
    deploy: { params: ["server", "service"], retorno: tipoDato.BOOLEAN, ejecutar: ([s, svc]: [Server, Service], _t, arbol, l, c) => {
        // 1) validar TODO antes de modificar nada
        if (s.status !== "running") return infra(arbol, l, c, "INFRA-002", `No se puede desplegar '${svc.nombre}': el servidor '${s.nombre}' está detenido`)
        for (const d of svc.dependsOn) {
            if (d.status !== "running") {
                return infra(arbol, l, c, "INFRA-004", `No se puede desplegar '${svc.nombre}'. Dependencia '${d.nombre}' se encuentra en estado ${d.status}.`)
            }
        }
        if (svc.status === "running") return aviso(arbol, `${svc.nombre} ya está desplegado en ${svc.host?.nombre}`)
        // 2) recién ahora se modifica el estado
        if (svc.host) svc.host.services = svc.host.services.filter(n => n !== svc.nombre)
        svc.host = s
        svc.status = "running"
        s.services.push(svc.nombre)
        arbol.log("OK", `${svc.nombre} deployed on ${s.nombre}`)
        return true
    }},
    scale: { params: ["service", "int"], retorno: tipoDato.BOOLEAN, ejecutar: ([svc, n]: [Service, number], _t, arbol, l, c) => {
        if (n < 1) return infra(arbol, l, c, "INFRA-005", `scale requiere al menos una réplica (recibió ${n})`)
        if (n === svc.replicas) return aviso(arbol, `${svc.nombre} ya tiene ${n} réplicas`)
        arbol.log("OK", `${svc.nombre} scaled from ${svc.replicas} to ${n} replicas`)
        svc.replicas = n
        return true
    }},
    connect: { params: ["resource", "resource"], retorno: tipoDato.BOOLEAN, ejecutar: ([a, b]: [Recurso, Recurso], _t, arbol, l, c) => {
        if (a === b) return infra(arbol, l, c, "INFRA-007", `'${a.nombre}' no puede conectarse consigo mismo`)
        if (a.conexiones.has(b.nombre)) return aviso(arbol, `${a.nombre} y ${b.nombre} ya están conectados`)   // sin duplicados
        a.conexiones.add(b.nombre); b.conexiones.add(a.nombre)
        arbol.log("OK", `${a.nombre} connected to ${b.nombre}`)
        return true
    }},
    disconnect: { params: ["resource", "resource"], retorno: tipoDato.BOOLEAN, ejecutar: ([a, b]: [Recurso, Recurso], _t, arbol) => {
        if (!a.conexiones.has(b.nombre)) return aviso(arbol, `${a.nombre} y ${b.nombre} no estaban conectados`)
        a.conexiones.delete(b.nombre); b.conexiones.delete(a.nombre)
        arbol.log("OK", `${a.nombre} disconnected from ${b.nombre}`)
        return true
    }},
    print:   { params: [], variadic: true, retorno: tipoDato.VOID, ejecutar: imprimir },
    println: { params: [], variadic: true, retorno: tipoDato.VOID, ejecutar: imprimir },
    length:  { params: ["array"], retorno: tipoDato.ENTERO, ejecutar: ([arr]: [any[]]) => arr.length },
    status:  { params: ["resource"], retorno: tipoDato.CADENA, ejecutar: ([r]: [Recurso]) => r.status },
}