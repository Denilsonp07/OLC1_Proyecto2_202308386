"use strict";
/**
 * Análisis léxico completo del archivo, usando el lexer que genera Jison.
 * A diferencia de parser.parse() (que se detiene en el primer carácter inválido), aquí el lexer
 * NUNCA lanza: los errores léxicos se acumulan (ver las reglas finales del .jison) y se sigue.
 * Resultado: la tabla de tokens y la lista de TODOS los errores léxicos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenizar = tokenizar;
function tokenizar(parser, source) {
    // Jison hace Object.create(lexer) en cada parse(); aquí hacemos lo mismo para tener nuestra propia copia
    const lx = Object.create(parser.parser.lexer);
    const yy = { erroresLexicos: [] };
    lx.setInput(source, yy);
    // El lexer generado devuelve el NÚMERO del símbolo (no su nombre); terminals_ lo traduce.
    const EOF = parser.parser.symbols_['EOF'];
    const nombres = parser.parser.terminals_;
    const tokens = [];
    while (true) {
        const id = lx.lex();
        if (id === undefined || id === 1 || id === EOF)
            break;
        const l = lx.yylloc;
        tokens.push({
            n: tokens.length + 1,
            token: nombres[id],
            lexema: lx.match,
            texto: lx.yytext,
            linea: l.first_line, columna: l.first_column,
            finLinea: l.last_line, finColumna: l.last_column,
        });
    }
    return { tokens, errores: yy.erroresLexicos };
}
