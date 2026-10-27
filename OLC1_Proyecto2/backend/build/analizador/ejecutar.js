"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarPrograma = ejecutarPrograma;
const errores_1 = __importDefault(require("./excepciones/errores"));
const senal_1 = __importDefault(require("./abstracto/senal"));
const tareas_1 = require("./instrucciones/tareas");
const declaracionFuncion_1 = __importDefault(require("./instrucciones/declaracionFuncion"));
const declaracion_1 = __importDefault(require("./instrucciones/declaracion"));
const declaracionRecurso_1 = __importDefault(require("./instrucciones/declaracionRecurso"));
/**
 * Orden de ejecución (sección 15.1):
 *   1. registrar funciones y tareas (se pueden usar sin importar el orden en que se escribieron)
 *   2. registrar recursos y variables globales
 *   3. ejecutar el único bloque main
 * Los errores quedan en arbol.getErrores().
 */
function ejecutarPrograma(arbol) {
    const ast = arbol.getInstrucciones();
    const global = arbol.getTablaGlobal();
    const mains = ast.filter(i => i instanceof tareas_1.Main);
    const registrar = (i) => {
        const r = i.interpretar(arbol, global);
        if (r instanceof senal_1.default)
            return new errores_1.default("Semántico", "break/continue/return fuera de contexto", r.linea, r.columna, "SEM-006");
        return r instanceof errores_1.default ? r : undefined;
    };
    // 1. funciones y tareas primero
    for (const i of ast.filter(i => i instanceof declaracionFuncion_1.default || i instanceof tareas_1.DeclaracionTask)) {
        const e = registrar(i);
        if (e)
            arbol.agregarError(e);
    }
    // 2. recursos y variables globales, en el orden escrito. Si una declaración falla porque usa un
    //    identificador que se declara MÁS ADELANTE (ej: dependsOn = [db] y db va después), se reintenta
    //    cuando ya existan los demás. Lo que siga fallando se reporta.
    let pendientes = ast.filter(i => !(i instanceof declaracionFuncion_1.default || i instanceof tareas_1.DeclaracionTask || i instanceof tareas_1.Main));
    let progreso = true;
    while (pendientes.length > 0 && progreso) {
        progreso = false;
        const siguiente = [];
        const fallos = new Map();
        for (const i of pendientes) {
            const e = registrar(i);
            const reintentable = e && e.getCodigo() === "SEM-003" && (i instanceof declaracion_1.default || i instanceof declaracionRecurso_1.default);
            if (reintentable) {
                siguiente.push(i);
                fallos.set(i, e);
            }
            else {
                progreso = true;
                if (e)
                    arbol.agregarError(e);
            }
        }
        if (!progreso)
            siguiente.forEach(i => arbol.agregarError(fallos.get(i))); // nada avanzó: son errores reales
        pendientes = siguiente;
    }
    // 3. el bloque main
    if (mains.length === 0) {
        arbol.agregarError(new errores_1.default("Semántico", "El archivo debe contener exactamente un bloque main", 1, 0, "SEM-011"));
    }
    else if (mains.length > 1) {
        arbol.agregarError(new errores_1.default("Semántico", "Solo puede existir un bloque main", mains[1].linea, mains[1].columna, "SEM-011"));
    }
    else {
        const e = registrar(mains[0]);
        if (e)
            arbol.agregarError(e);
    }
}
