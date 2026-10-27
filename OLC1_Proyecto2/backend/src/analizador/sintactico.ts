import { Token } from "./lexico"

/**
 * Conductor LR con RECUPERACIÓN DE ERRORES (sección 14.4).
 *
 * Jison genera las tablas LALR (parser.table, productions_, performAction...), pero el parser que
 * produce NO se recupera de errores: se detiene en el primero. Aquí reutilizamos sus tablas y
 * escribimos el bucle de análisis, añadiendo recuperación. Ante un error, en este orden:
 *   1. INSERCIÓN:  si insertar un token faltante (; ) ] }) hace que el análisis continúe -> se inserta.
 *   2. BORRADO:    si descartar el token sobrante hace que continúe -> se descarta.
 *   3. PÁNICO:     se descartan tokens hasta un punto de sincronización (';' o '}' o una declaración),
 *                  se sacan estados de la pila hasta uno que admita una instrucción y se continúa.
 * Tras un error se silencian los siguientes hasta desplazar 3 tokens (evita errores en cascada).
 */
export interface ErrorSintactico { descripcion: string; linea: number; columna: number }

const LEGIBLE: Record<string, string> = {
    PUNTO_COMA: ";", COMA: ",", PUNTO: ".", PAR_ABRE: "(", PAR_CIERRA: ")", LLAVE_ABRE: "{", LLAVE_CIERRA: "}",
    COR_ABRE: "[", COR_CIERRA: "]", IGUAL: "=", IGUALDAD: "==", DESIGUALDAD: "!=", MENOR: "<", MENOR_IGUAL: "<=",
    MAYOR: ">", MAYOR_IGUAL: ">=", MAS: "+", MENOS: "-", POR: "*", DIV: "/", MOD: "%", AND: "&&", OR: "||", NOT: "!",
    INT: "int", TIPO_DECIMAL: "float", TIPO_STRING: "string", TIPO_BOOL: "bool", R_SERVER: "server",
    R_SERVICE: "service", R_DATABASE: "database", IF: "if", ELSE: "else", WHILE: "while", FOR: "for",
    BREAK: "break", CONTINUE: "continue", RETURN: "return", FUNCTION: "function", TASK: "task", MAIN: "main",
    RUN: "run", RTRUE: "true", RFALSE: "false",
}
const DESCRIPTIVO: Record<string, string> = {
    ID: "un identificador", ENTERO: "un número entero", DECIMAL: "un número decimal", CADENA: "una cadena", EOF: "el fin del archivo",
}
const nombreLegible = (n: string) => DESCRIPTIVO[n] ?? `'${LEGIBLE[n] ?? n}'`

interface Loc { first_line: number; first_column: number; last_line: number; last_column: number }
interface Tok { sym: number; nombre: string; texto: string; lexema: string; loc: Loc }

const MAX_ERRORES = 50

export function parsear(parser: any, tokens: Token[]): { ast: any[] | null; errores: ErrorSintactico[] } {
    const P = parser.parser
    const table = P.table
    const prods = P.productions_
    const sim = (n: string): number => P.symbols_[n]
    const S_INSTR = sim('INSTRUCCION'), S_EOF = sim('EOF'), S_PUNTO_COMA = sim('PUNTO_COMA'), S_LLAVE_CIERRA = sim('LLAVE_CIERRA')
    const S_DECLARACIONES = new Set([sim('FUNCTION'), sim('TASK'), sim('MAIN')])
    const END = 1   // $end

    // ---- tokens -> símbolos de la gramática (más EOF y $end al final, como lo haría el lexer) ----
    const toks: Tok[] = tokens.map(t => ({
        sym: sim(t.token), nombre: t.token, texto: t.texto, lexema: t.lexema,
        loc: { first_line: t.linea, first_column: t.columna, last_line: t.finLinea, last_column: t.finColumna },
    }))
    const ult = tokens.length ? tokens[tokens.length - 1] : undefined
    const locFin: Loc = ult
        ? { first_line: ult.finLinea, first_column: ult.finColumna, last_line: ult.finLinea, last_column: ult.finColumna }
        : { first_line: 1, first_column: 0, last_line: 1, last_column: 0 }
    toks.push({ sym: S_EOF, nombre: 'EOF', texto: '', lexema: '', loc: locFin })
    toks.push({ sym: END, nombre: '$end', texto: '', lexema: '', loc: locFin })

    // ---- tablas ----
    const accion = (estado: number, s: number): number[] | undefined => {
        const d = P.defaultActions[estado]
        if (d) return d
        const a = table[estado][s]
        return Array.isArray(a) && a.length && a[0] ? a : undefined
    }
    /** ¿Puede el análisis consumir estos tokens a partir de esta pila de estados? (sin ejecutar acciones) */
    const simular = (estados: number[], seq: number[]): boolean => {
        const s = estados.slice()
        for (const t of seq) {
            for (let guard = 0; guard < 500; guard++) {
                const a = accion(s[s.length - 1], t)
                if (!a) return false
                if (a[0] === 1) { s.push(a[1]); break }                       // desplaza: token consumido
                if (a[0] === 3) return true                                   // aceptar
                const [lhs, len] = prods[a[1]]                                // reduce y reintenta el mismo token
                s.length -= len
                const g = table[s[s.length - 1]][lhs]
                if (typeof g !== 'number') return false
                s.push(g)
            }
        }
        return true
    }
    const esperados = (estado: number): string[] => {
        const out: string[] = []
        for (const k of Object.keys(table[estado])) {
            const id = Number(k)
            if (P.terminals_[id] && id > 2 && Array.isArray(table[estado][k])) out.push(P.terminals_[id])
        }
        return out
    }

    // ---- pilas (como las de Jison: vs y ls empiezan con un elemento ficticio) ----
    const st: number[] = [0]
    const sy: number[] = []
    const vs: any[] = [null]
    const ls: Loc[] = [{ first_line: 1, first_column: 0, last_line: 1, last_column: 0 }]
    const yy = {}

    // ---- lectura con "cola" de tokens virtuales insertados por la recuperación ----
    let pos = 0
    const cola: Tok[] = []
    const actual = (): Tok => (cola.length ? cola[0] : toks[Math.min(pos, toks.length - 1)])
    const consumir = () => { if (cola.length) cola.shift(); else pos++ }

    const errores: ErrorSintactico[] = []
    let desdeError = 99          // tokens desplazados desde el último error informado
    let ultimoPanico = -1
    const reportar = (descripcion: string, linea: number, columna: number) => {
        if (desdeError >= 3) {   // si no, es un error en cascada del anterior: se silencia
            errores.push({ descripcion, linea, columna })
            desdeError = 0
        }
    }

    const maxIter = 5000 + toks.length * 40      // cota: la recuperación siempre termina
    for (let iter = 0; iter < maxIter; iter++) {
        const estado = st[st.length - 1]
        const la = actual()
        const a = accion(estado, la.sym)

        if (a) {
            if (a[0] === 1) {                                                  // DESPLAZAR
                sy.push(la.sym); st.push(a[1]); vs.push(la.texto); ls.push(la.loc)
                consumir(); desdeError++
            } else if (a[0] === 2) {                                           // REDUCIR
                const [lhs, len] = prods[a[1]]
                const yyval: any = {}
                yyval.$ = vs[vs.length - len]
                yyval._$ = {
                    first_line: ls[ls.length - (len || 1)].first_line, last_line: ls[ls.length - 1].last_line,
                    first_column: ls[ls.length - (len || 1)].first_column, last_column: ls[ls.length - 1].last_column,
                }
                const r = P.performAction.apply(yyval, [la.texto, 0, 0, yy, a[1], vs, ls])
                if (typeof r !== 'undefined') return { ast: r, errores }     // la regla INICIO hace 'return $1'
                if (len) { st.length -= len; sy.length -= len; vs.length -= len; ls.length -= len }
                sy.push(lhs); vs.push(yyval.$); ls.push(yyval._$)
                st.push(table[st[st.length - 1]][lhs])
            } else {
                return { ast: vs[vs.length - 1], errores }                     // ACEPTAR
            }
            continue
        }

        // ================= ERROR SINTÁCTICO =================
        if (errores.length >= MAX_ERRORES) {
            errores.push({ descripcion: `Se detectaron más de ${MAX_ERRORES} errores sintácticos; se detuvo el análisis`, linea: la.loc.first_line, columna: la.loc.first_column })
            break
        }
        const previo = ls[ls.length - 1]                    // fin del último token aceptado
        const eof = la.sym === S_EOF || la.sym === END
        const vista = eof ? "el fin del archivo" : `'${la.lexema}'`
        const antesDe = eof ? "al final del archivo" : `antes de ${vista}`

        // 1. INSERCIÓN de un token faltante
        let reparado = false
        for (const cand of ['PUNTO_COMA', 'PAR_CIERRA', 'COR_CIERRA', 'LLAVE_CIERRA']) {
            if (simular(st, [sim(cand), la.sym])) {
                reportar(`Se esperaba '${LEGIBLE[cand]}' ${antesDe}`, previo.last_line, previo.last_column)
                cola.unshift({ sym: sim(cand), nombre: cand, texto: '', lexema: LEGIBLE[cand], loc: { ...previo, first_line: previo.last_line, first_column: previo.last_column } })
                reparado = true
                break
            }
        }
        if (reparado) continue

        // 2. BORRADO del token sobrante
        if (!cola.length && !eof && toks[pos + 1] && simular(st, [toks[pos + 1].sym])) {
            reportar(eof ? "Fin de archivo inesperado" : `Token inesperado ${vista}`, la.loc.first_line, la.loc.first_column)
            pos++
            continue
        }

        // 3. MODO PÁNICO
        const esp = esperados(estado).map(nombreLegible)
        const lista = esp.length > 6 ? esp.slice(0, 6).join(", ") + ", ..." : esp.join(", ")
        reportar(`${eof ? "Fin de archivo inesperado" : `Token inesperado ${vista}`}${lista ? `. Se esperaba: ${lista}` : ""}`, la.loc.first_line, la.loc.first_column)

        if (ultimoPanico === pos && !cola.length && !eof) consumir()        // sin progreso: se descarta el token que atasca
        ultimoPanico = pos
        cola.length = 0
        while (true) {                                                      // descartar hasta un punto de sincronización
            const t = actual()
            if (t.sym === S_EOF || t.sym === END) break
            if (t.sym === S_PUNTO_COMA) { consumir(); break }               // fin de sentencia: se consume
            if (t.sym === S_LLAVE_CIERRA || S_DECLARACIONES.has(t.sym)) break   // cierre de bloque / nueva declaración: se conserva
            consumir()
        }
        while (st.length > 1 && typeof table[st[st.length - 1]][S_INSTR] !== 'number') {   // sacar estados hasta uno que admita una instrucción
            st.pop(); sy.pop(); vs.pop(); ls.pop()
        }
        const destino = table[st[st.length - 1]][S_INSTR]
        if (typeof destino !== 'number') break
        sy.push(S_INSTR); st.push(destino); vs.push(null); ls.push(la.loc)  // la sentencia dañada queda como 'null'
        desdeError = 0
    }
    return { ast: null, errores }
}