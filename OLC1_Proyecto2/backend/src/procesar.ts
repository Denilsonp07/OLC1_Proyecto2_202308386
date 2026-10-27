import Arbol from './analizador/simbolo/arbol';
import Errores from './analizador/excepciones/errores';
import { nombreTipo } from './analizador/simbolo/tipo';
import { Funcion } from './analizador/instrucciones/declaracionFuncion';
import { Tarea } from './analizador/instrucciones/tareas';
import { ejecutarPrograma } from './analizador/ejecutar';
import { tokenizar, Token } from './analizador/lexico';
import { parsear } from './analizador/sintactico';
import { construirAST, aDot } from './reportes/ast';
import { Recurso } from './infraestructura/recursos';

// Jison genera JavaScript puro (CommonJS), por eso require.
const parser = require('./analizador/analizador.js');

export interface Limites { maxInstrucciones: number; maxProfundidad: number }

export const infraVacia = () => ({ servers: [] as any[], services: [] as any[], databases: [] as any[] });

type Pos = [number, number];   // [línea, columna]
const cmp = (a: Pos, b: Pos) => a[0] - b[0] || a[1] - b[1];

/**
 * Un error léxico (carácter suelto, cadena rota) suele provocar un error sintáctico justo al lado
 * ("falta ';'" porque el '@' desapareció). Esos errores son CONSECUENCIA, no un error nuevo:
 * se descartan los sintácticos que caen entre el token anterior y el siguiente al error léxico.
 */
function combinarErrores(lexicos: { descripcion: string; linea: number; columna: number }[],
                         sintacticos: { descripcion: string; linea: number; columna: number }[],
                         tokens: Token[]): Errores[] {
    const zonas = lexicos.map(e => {
        const p: Pos = [e.linea, e.columna];
        let desde: Pos = [1, 0], hasta: Pos = [Infinity, Infinity];
        for (const t of tokens) {
            if (cmp([t.finLinea, t.finColumna], p) <= 0) desde = [t.finLinea, t.finColumna];
            else if (cmp([t.linea, t.columna], p) >= 0) { hasta = [t.linea, t.columna]; break; }
        }
        return { desde, hasta };
    });
    const resultado: Errores[] = lexicos.map(e => new Errores("Léxico", e.descripcion, e.linea, e.columna, "LEX-001"));
    for (const e of sintacticos) {
        const p: Pos = [e.linea, e.columna];
        const esConsecuencia = zonas.some(z => cmp(p, z.desde) >= 0 && cmp(p, z.hasta) <= 0);
        if (!esConsecuencia) resultado.push(new Errores("Sintáctico", e.descripcion, e.linea, e.columna, "SYN-001"));
    }
    return resultado.sort((a, b) => a.getLinea() - b.getLinea() || a.getColumna() - b.getColumna());
}

/** Todo el pipeline: léxico -> sintáctico (con recuperación) -> [ejecución] -> respuesta lista para JSON. */
export function procesar(source: string, limites: Limites, ejecutar: boolean = true): any {
    // ---- 1. Léxico: tabla de tokens + TODOS los errores léxicos ----
    const lex = tokenizar(parser, source);
    const tokens = lex.tokens.map(t => ({ n: t.n, lexema: t.lexema, token: t.token, linea: t.linea, columna: t.columna + 1 }));

    // ---- 2. Sintáctico: AST + TODOS los errores sintácticos (recuperación de errores) ----
    const sint = parsear(parser, lex.tokens);
    const erroresParser = combinarErrores(lex.errores, sint.errores, lex.tokens);

    // ---- 3. Reporte del AST (aunque haya errores, si el parser logró armarlo) ----
    let ast: any = null;
    if (sint.ast) {
        const { arbol, truncado } = construirAST(sint.ast);
        ast = { dot: aDot(arbol, truncado), arbol, truncado };
    }

    // Con errores léxicos o sintácticos NO se ejecuta (sección 15.1: la ejecución parte de un AST válido)
    if (erroresParser.length > 0 || !ejecutar) {
        return JSON.parse(JSON.stringify({
            success: erroresParser.length === 0, console: [], errors: erroresParser, symbols: [],
            tokens, ast, infrastructure: infraVacia(),
        }));
    }

    // ---- 4. Ejecución (registrar globales -> ejecutar main) ----
    const arbol = new Arbol(sint.ast as any[], limites.maxInstrucciones, limites.maxProfundidad);
    try {
        ejecutarPrograma(arbol);
    } catch (error: any) {
        // Un bug interno no debe tumbar nada; una pila agotada es un error de recursión controlado
        const pila = error instanceof RangeError;
        arbol.agregarError(new Errores("Ejecución",
            pila ? "Se agotó la pila de ejecución del intérprete (recursión demasiado profunda)" : `Error interno del intérprete: ${error.message}`,
            0, 0, pila ? "EXE-003" : "EXE-000"));
    }

    // ---- 5. Tabla de símbolos (todos los ámbitos) e infraestructura ----
    const symbols: any[] = [];
    const infrastructure = infraVacia();
    for (const { ambito, simbolo } of arbol.getTablaGlobal().getRegistro()) {
        const valor = simbolo.getValor();
        const categoria = simbolo.getCategoria();
        let tipo = nombreTipo(simbolo.getTipo());
        let mostrar: any = valor;

        if (categoria === "recurso" && valor instanceof Recurso) {
            const destino = valor.tipoRecurso === "server" ? "servers" : valor.tipoRecurso === "service" ? "services" : "databases";
            infrastructure[destino].push(valor.toJSON());
            tipo = valor.tipoRecurso;
            mostrar = valor.status;
        } else if (valor instanceof Funcion) {
            tipo = valor.tipoRetorno ? nombreTipo(valor.tipoRetorno) : "void";
            mostrar = `${valor.params.length} parámetro(s)`;
        } else if (valor instanceof Tarea) {
            tipo = "task"; mostrar = "-";
        } else if (valor instanceof Recurso) {
            mostrar = valor.nombre;                       // variable que referencia un recurso
        } else if (Array.isArray(valor)) {
            mostrar = valor.map(x => (x instanceof Recurso ? x.nombre : x));
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