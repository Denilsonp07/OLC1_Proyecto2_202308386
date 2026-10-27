"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.infraVacia = void 0;
exports.procesar = procesar;
const arbol_1 = __importDefault(require("./analizador/simbolo/arbol"));
const errores_1 = __importDefault(require("./analizador/excepciones/errores"));
const tipo_1 = require("./analizador/simbolo/tipo");
const declaracionFuncion_1 = require("./analizador/instrucciones/declaracionFuncion");
const tareas_1 = require("./analizador/instrucciones/tareas");
const ejecutar_1 = require("./analizador/ejecutar");
const lexico_1 = require("./analizador/lexico");
const sintactico_1 = require("./analizador/sintactico");
const ast_1 = require("./reportes/ast");
const recursos_1 = require("./infraestructura/recursos");
// Jison genera JavaScript puro (CommonJS), por eso require.
const parser = require('./analizador/analizador.js');
const infraVacia = () => ({ servers: [], services: [], databases: [] });
exports.infraVacia = infraVacia;
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1];
/**
 * Un error léxico (carácter suelto, cadena rota) suele provocar un error sintáctico justo al lado
 * ("falta ';'" porque el '@' desapareció). Esos errores son CONSECUENCIA, no un error nuevo:
 * se descartan los sintácticos que caen entre el token anterior y el siguiente al error léxico.
 */
function combinarErrores(lexicos, sintacticos, tokens) {
    const zonas = lexicos.map(e => {
        const p = [e.linea, e.columna];
        let desde = [1, 0], hasta = [Infinity, Infinity];
        for (const t of tokens) {
            if (cmp([t.finLinea, t.finColumna], p) <= 0)
                desde = [t.finLinea, t.finColumna];
            else if (cmp([t.linea, t.columna], p) >= 0) {
                hasta = [t.linea, t.columna];
                break;
            }
        }
        return { desde, hasta };
    });
    const resultado = lexicos.map(e => new errores_1.default("Léxico", e.descripcion, e.linea, e.columna, "LEX-001"));
    for (const e of sintacticos) {
        const p = [e.linea, e.columna];
        const esConsecuencia = zonas.some(z => cmp(p, z.desde) >= 0 && cmp(p, z.hasta) <= 0);
        if (!esConsecuencia)
            resultado.push(new errores_1.default("Sintáctico", e.descripcion, e.linea, e.columna, "SYN-001"));
    }
    return resultado.sort((a, b) => a.getLinea() - b.getLinea() || a.getColumna() - b.getColumna());
}
/** Todo el pipeline: léxico -> sintáctico (con recuperación) -> [ejecución] -> respuesta lista para JSON. */
function procesar(source, limites, ejecutar = true) {
    // ---- 1. Léxico: tabla de tokens + TODOS los errores léxicos ----
    const lex = (0, lexico_1.tokenizar)(parser, source);
    const tokens = lex.tokens.map(t => ({ n: t.n, lexema: t.lexema, token: t.token, linea: t.linea, columna: t.columna + 1 }));
    // ---- 2. Sintáctico: AST + TODOS los errores sintácticos (recuperación de errores) ----
    const sint = (0, sintactico_1.parsear)(parser, lex.tokens);
    const erroresParser = combinarErrores(lex.errores, sint.errores, lex.tokens);
    // ---- 3. Reporte del AST (aunque haya errores, si el parser logró armarlo) ----
    let ast = null;
    if (sint.ast) {
        const { arbol, truncado } = (0, ast_1.construirAST)(sint.ast);
        ast = { dot: (0, ast_1.aDot)(arbol, truncado), arbol, truncado };
    }
    // Con errores léxicos o sintácticos NO se ejecuta (sección 15.1: la ejecución parte de un AST válido)
    if (erroresParser.length > 0 || !ejecutar) {
        return JSON.parse(JSON.stringify({
            success: erroresParser.length === 0, console: [], errors: erroresParser, symbols: [],
            tokens, ast, infrastructure: (0, exports.infraVacia)(),
        }));
    }
    // ---- 4. Ejecución (registrar globales -> ejecutar main) ----
    const arbol = new arbol_1.default(sint.ast, limites.maxInstrucciones, limites.maxProfundidad);
    try {
        (0, ejecutar_1.ejecutarPrograma)(arbol);
    }
    catch (error) {
        // Un bug interno no debe tumbar nada; una pila agotada es un error de recursión controlado
        const pila = error instanceof RangeError;
        arbol.agregarError(new errores_1.default("Ejecución", pila ? "Se agotó la pila de ejecución del intérprete (recursión demasiado profunda)" : `Error interno del intérprete: ${error.message}`, 0, 0, pila ? "EXE-003" : "EXE-000"));
    }
    // ---- 5. Tabla de símbolos (todos los ámbitos) e infraestructura ----
    const symbols = [];
    const infrastructure = (0, exports.infraVacia)();
    for (const { ambito, simbolo } of arbol.getTablaGlobal().getRegistro()) {
        const valor = simbolo.getValor();
        const categoria = simbolo.getCategoria();
        let tipo = (0, tipo_1.nombreTipo)(simbolo.getTipo());
        let mostrar = valor;
        if (categoria === "recurso" && valor instanceof recursos_1.Recurso) {
            const destino = valor.tipoRecurso === "server" ? "servers" : valor.tipoRecurso === "service" ? "services" : "databases";
            infrastructure[destino].push(valor.toJSON());
            tipo = valor.tipoRecurso;
            mostrar = valor.status;
        }
        else if (valor instanceof declaracionFuncion_1.Funcion) {
            tipo = valor.tipoRetorno ? (0, tipo_1.nombreTipo)(valor.tipoRetorno) : "void";
            mostrar = `${valor.params.length} parámetro(s)`;
        }
        else if (valor instanceof tareas_1.Tarea) {
            tipo = "task";
            mostrar = "-";
        }
        else if (valor instanceof recursos_1.Recurso) {
            mostrar = valor.nombre; // variable que referencia un recurso
        }
        else if (Array.isArray(valor)) {
            mostrar = valor.map(x => (x instanceof recursos_1.Recurso ? x.nombre : x));
        }
        symbols.push({ identificador: simbolo.getId(), categoria, tipo, ambito, valor: mostrar });
    }
    const consola = arbol.getConsola();
    const errores = arbol.getErrores();
    // El round-trip por JSON deja el resultado como objetos planos (Errores y Recurso usan toJSON),
    // que es justo lo que puede cruzar de un worker al hilo principal.
    return JSON.parse(JSON.stringify({
        success: errores.length === 0,
        console: consola === "" ? [] : consola.replace(/\n$/, "").split("\n"),
        errors: errores,
        symbols, tokens, ast, infrastructure,
    }));
}
