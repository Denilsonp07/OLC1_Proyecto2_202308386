



import Arbol from "./simbolo/arbol"
import Errores from "./excepciones/errores"
import Senal from "./abstracto/senal"
import { Main, DeclaracionTask } from "./instrucciones/tareas"
import DeclaracionFuncion from "./instrucciones/declaracionFuncion"
import Declaracion from "./instrucciones/declaracion"
import DeclaracionRecurso from "./instrucciones/declaracionRecurso"

/**
 * Orden de ejecución (sección 15.1):
 *   1. registrar funciones y tareas (se pueden usar sin importar el orden en que se escribieron)
 *   2. registrar recursos y variables globales
 *   3. ejecutar el único bloque main
 * Los errores quedan en arbol.getErrores().
 */
export function ejecutarPrograma(arbol: Arbol): void {
    const ast = arbol.getInstrucciones()
    const global = arbol.getTablaGlobal()
    const mains = ast.filter(i => i instanceof Main)

    const registrar = (i: any): Errores | undefined => {
        const r = i.interpretar(arbol, global)
        if (r instanceof Senal) return new Errores("Semántico", "break/continue/return fuera de contexto", r.linea, r.columna, "SEM-006")
        return r instanceof Errores ? r : undefined
    }

    // 1. funciones y tareas primero
    for (const i of ast.filter(i => i instanceof DeclaracionFuncion || i instanceof DeclaracionTask)) {
        const e = registrar(i); if (e) arbol.agregarError(e)
    }

    // 2. recursos y variables globales, en el orden escrito. Si una declaración falla porque usa un
    //    identificador que se declara MÁS ADELANTE (ej: dependsOn = [db] y db va después), se reintenta
    //    cuando ya existan los demás. Lo que siga fallando se reporta.
    let pendientes: any[] = ast.filter(i => !(i instanceof DeclaracionFuncion || i instanceof DeclaracionTask || i instanceof Main))
    let progreso = true
    while (pendientes.length > 0 && progreso) {
        progreso = false
        const siguiente: any[] = []
        const fallos = new Map<any, Errores>()
        for (const i of pendientes) {
            const e = registrar(i)
            const reintentable = e && e.getCodigo() === "SEM-003" && (i instanceof Declaracion || i instanceof DeclaracionRecurso)
            if (reintentable) { siguiente.push(i); fallos.set(i, e!) }
            else { progreso = true; if (e) arbol.agregarError(e) }
        }
        if (!progreso) siguiente.forEach(i => arbol.agregarError(fallos.get(i)!))   // nada avanzó: son errores reales
        pendientes = siguiente
    }

    // 3. el bloque main
    if (mains.length === 0) {
        arbol.agregarError(new Errores("Semántico", "El archivo debe contener exactamente un bloque main", 1, 0, "SEM-011"))
    } else if (mains.length > 1) {
        arbol.agregarError(new Errores("Semántico", "Solo puede existir un bloque main", mains[1].linea, mains[1].columna, "SEM-011"))
    } else {
        const e = registrar(mains[0]); if (e) arbol.agregarError(e)
    }
}