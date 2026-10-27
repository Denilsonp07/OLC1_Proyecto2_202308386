/**
 * Análisis léxico completo del archivo, usando el lexer que genera Jison.
 * A diferencia de parser.parse() (que se detiene en el primer carácter inválido), aquí el lexer
 * NUNCA lanza: los errores léxicos se acumulan (ver las reglas finales del .jison) y se sigue.
 * Resultado: la tabla de tokens y la lista de TODOS los errores léxicos.
 */


export interface Token {
    n: number            // posición en la tabla de tokens (1, 2, 3...)
    token: string        // nombre del token en la gramática (ID, ENTERO, PUNTO_COMA...)
    lexema: string       // texto tal cual aparece en el código
    texto: string        // valor que recibe la gramática ($1): igual al lexema, salvo en las cadenas
    linea: number        // inicio del token (línea base 1)
    columna: number      // inicio del token (columna base 0)
    finLinea: number     // fin del token
    finColumna: number   // fin del token (exclusivo)
}

export interface ErrorLexico { descripcion: string; linea: number; columna: number }

export function tokenizar(parser: any, source: string): { tokens: Token[]; errores: ErrorLexico[] } {
    // Jison hace Object.create(lexer) en cada parse(); aquí hacemos lo mismo para tener nuestra propia copia
    const lx = Object.create(parser.parser.lexer)
    const yy = { erroresLexicos: [] as ErrorLexico[] }
    lx.setInput(source, yy)

    // El lexer generado devuelve el NÚMERO del símbolo (no su nombre); terminals_ lo traduce.
    const EOF = parser.parser.symbols_['EOF']
    const nombres = parser.parser.terminals_

    const tokens: Token[] = []
    while (true) {
        const id = lx.lex()
        if (id === undefined || id === 1 || id === EOF) break
        const l = lx.yylloc
        tokens.push({
            n: tokens.length + 1,
            token: nombres[id],
            lexema: lx.match,
            texto: lx.yytext,
            linea: l.first_line, columna: l.first_column,
            finLinea: l.last_line, finColumna: l.last_column,
        })
    }
    return { tokens, errores: yy.erroresLexicos }
}