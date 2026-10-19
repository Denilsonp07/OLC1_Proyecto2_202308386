


import Arbol from './analizador/simbolo/arbol';
import Errores from './analizador/excepciones/errores';
import { nombreTipo } from './analizador/simbolo/tipo';
import { Funcion } from './analizador/instrucciones/declaracionFuncion';
import { Tarea } from './analizador/instrucciones/tareas';
import { ejecutarPrograma } from './analizador/ejecutar';
import { Recurso } from './infraestructura/recursos';



// Jison genera JavaScript puro (CommonJS), por eso require.
const parser = require('./analizador/analizador.js');

export interface Limites { maxInstrucciones: number; maxProfundidad: number }

export const infraVacia = () => ({ servers: [] as any[], services: [] as any[], databases: [] as any[] });

/**
 * Jison no informa la columna de los errores. Jison hace Object.create(lexer) en cada parse(),
 * así que el estado del lexer original queda vacío. Solución: volver a lexear el código con una
 * copia PROPIA del lexer y leer su posición.
 *  - Error léxico:     el lexer lanza; lo ya consumido (matched) termina justo antes del carácter inválido.
 *  - Error sintáctico: hash.loc es el último token ACEPTADO; el culpable es el primer token que empieza después.
 */
function ubicarError(source: string, finAnterior: { line: number; col: number }) {
    const lx = Object.create(parser.parser.lexer);
    lx.setInput(source, {});
    try {
        while (true) {
            const tok = lx.lex();
            if (tok === undefined || tok === 'EOF' || tok === 1) break;
            const l = lx.yylloc;
            if (l.first_line > finAnterior.line || (l.first_line === finAnterior.line && l.first_column >= finAnterior.col)) {
                return { linea: l.first_line, columna: l.first_column };
            }
        }
    } catch {
        const consumido: string = lx.matched ?? "";
        return { linea: consumido.split("\n").length, columna: consumido.length - (consumido.lastIndexOf("\n") + 1) };
    }
    return { linea: finAnterior.line, columna: finAnterior.col };
}

/** Error léxico/sintáctico de Jison -> error estructurado con tipo, código, línea y columna. */
function errorDeParser(error: any, source: string) {
    const msg: string = error.message || "Error en el parser";
    const loc = error.hash?.loc;
    const sinCierre = msg.includes("COMENTARIO_SIN_CIERRE");
    const esLexico = msg.startsWith("Lexical error");
    // Léxico: no hay 'token anterior' que buscar; se deja que el lexer recorra todo hasta que lance.
    const fin = esLexico ? { line: Infinity, col: Infinity } : { line: loc?.last_line ?? 1, col: loc?.last_column ?? 0 };
    const pos = ubicarError(source, fin);
    return new Errores(
        esLexico || sinCierre ? "Léxico" : "Sintáctico",
        sinCierre ? "Comentario multilínea sin cerrar" : msg,
        pos.linea, pos.columna,
        esLexico || sinCierre ? "LEX-001" : "SYN-001"
    );
}

/** Todo el pipeline: léxico -> sintáctico -> ejecución -> respuesta lista para JSON. */
export function procesar(source: string, limites: Limites): any {
    // ---- 1. Léxico + sintáctico (Jison LANZA excepción si falla) ----
    let ast: any[];
    try {
        ast = parser.parse(source);
    } catch (error: any) {
        return JSON.parse(JSON.stringify({
            success: false, console: [], symbols: [], tokens: [], infrastructure: infraVacia(),
            errors: [errorDeParser(error, source)]
        }));
    }

    // ---- 2. Ejecución (registrar globales -> ejecutar main) ----
    const arbol = new Arbol(ast, limites.maxInstrucciones, limites.maxProfundidad);
    try {
        ejecutarPrograma(arbol);
    } catch (error: any) {
        // Un bug interno no debe tumbar nada; una pila agotada es un error de recursión controlado
        const pila = error instanceof RangeError;
        arbol.agregarError(new Errores("Ejecución",
            pila ? "Se agotó la pila de ejecución del intérprete (recursión demasiado profunda)" : `Error interno del intérprete: ${error.message}`,
            0, 0, pila ? "EXE-003" : "EXE-000"));
    }

    // ---- 3. Respuesta ----
    const symbols: any[] = [];
    const infrastructure = infraVacia();
    for (const [id, simbolo] of arbol.getTablaGlobal().getTabla()) {
        const valor = simbolo.getValor();
        if (valor instanceof Recurso && valor.nombre === id) {
            const destino = valor.tipoRecurso === "server" ? "servers" : valor.tipoRecurso === "service" ? "services" : "databases";
            infrastructure[destino].push(valor.toJSON());
            symbols.push({ identificador: id, categoria: "recurso", tipo: valor.tipoRecurso, ambito: "global", valor: valor.status });
        } else if (valor instanceof Funcion) {
            symbols.push({ identificador: id, categoria: "función", tipo: valor.tipoRetorno ? nombreTipo(valor.tipoRetorno) : "void", ambito: "global", valor: `${valor.params.length} parámetro(s)` });
        } else if (valor instanceof Tarea) {
            symbols.push({ identificador: id, categoria: "tarea", tipo: "task", ambito: "global", valor: "-" });
        } else {
            const v = valor instanceof Recurso ? valor.nombre
                    : Array.isArray(valor) ? valor.map(x => (x instanceof Recurso ? x.nombre : x))
                    : valor;
            symbols.push({ identificador: id, categoria: "variable", tipo: nombreTipo(simbolo.getTipo()), ambito: "global", valor: v });
        }
    }

    const consola = arbol.getConsola();
    const errores = arbol.getErrores();
    // El round-trip por JSON deja el resultado como objetos planos (Errores y Recurso usan toJSON),
    // que es justo lo que puede cruzar de un worker al hilo principal.
    return JSON.parse(JSON.stringify({
        success: errores.length === 0,
        console: consola === "" ? [] : consola.replace(/\n$/, "").split("\n"),
        errors: errores,
        symbols,
        tokens: [],
        infrastructure
    }));
}