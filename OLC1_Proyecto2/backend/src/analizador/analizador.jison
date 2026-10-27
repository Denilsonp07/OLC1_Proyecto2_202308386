

%{
    const Tipo = require('./simbolo/tipo')
    const Nativos = require('./expresiones/nativos')
    const Aritmeticas = require('./expresiones/aritmeticas')
    const Relacionales = require('./expresiones/relacionales')
    const Logicas = require('./expresiones/logicas')
    const Unarias = require('./expresiones/unarias')
    const AccesoVar = require('./expresiones/accesoVar')
    const AccesoPropiedad = require('./expresiones/accesoPropiedad')
    const AccesoIndice = require('./expresiones/accesoIndice')
    const Arreglo = require('./expresiones/arreglo')
    const Llamada = require('./expresiones/llamada')

    const Declaracion = require('./instrucciones/declaracion')
    const DeclaracionRecurso = require('./instrucciones/declaracionRecurso')
    const AsignacionVar = require('./instrucciones/asignacion')
    const AsignacionPropiedad = require('./instrucciones/asignacionPropiedad')
    const CondicionalIf = require('./instrucciones/condicionalIf')
    const Mientras = require('./instrucciones/mientras')
    const Para = require('./instrucciones/para')
    const Saltos = require('./instrucciones/saltos')
    const Retorno = require('./instrucciones/retorno')
    const DeclaracionFuncion = require('./instrucciones/declaracionFuncion')
    const Tareas = require('./instrucciones/tareas')

    // Escapes mínimos de cadenas: \" \\ \n \t
    function desescapar(s) {
        return s.replace(/\\(["\\nt])/g, function (m, c) { return c === 'n' ? '\n' : c === 't' ? '\t' : c; });
    }
%}

%lex
%%
\s+                                         /* ignorar espacios y saltos de línea */
"//".*                                      /* comentario de una línea */
"/*"[^*]*\*+([^/*][^*]*\*+)*"/"             /* comentario multilínea */
"/*"[\s\S]*                                 { yy.erroresLexicos.push({ descripcion: "Comentario multilínea sin cerrar", linea: yylloc.first_line, columna: yylloc.first_column }); }

// ---- palabras reservadas ----
"int"         return 'INT';
"float"       return 'TIPO_DECIMAL';
"decimal"     return 'TIPO_DECIMAL';
"string"      return 'TIPO_STRING';
"bool"        return 'TIPO_BOOL';
"server"      return 'R_SERVER';
"service"     return 'R_SERVICE';
"database"    return 'R_DATABASE';
"if"          return 'IF';
"else"        return 'ELSE';
"while"       return 'WHILE';
"for"         return 'FOR';
"break"       return 'BREAK';
"continue"    return 'CONTINUE';
"return"      return 'RETURN';
"function"    return 'FUNCTION';
"task"        return 'TASK';
"main"        return 'MAIN';
"run"         return 'RUN';
"true"        return 'RTRUE';
"false"       return 'RFALSE';

// ---- operadores: los de 2 caracteres ANTES que los de 1 ----
"&&" return 'AND';
"||" return 'OR';
"<=" return 'MENOR_IGUAL';
">=" return 'MAYOR_IGUAL';
"!=" return 'DESIGUALDAD';
"==" return 'IGUALDAD';
"+"  return 'MAS';
"-"  return 'MENOS';
"*"  return 'POR';
"/"  return 'DIV';
"%"  return 'MOD';
"<"  return 'MENOR';
">"  return 'MAYOR';
"!"  return 'NOT';
"="  return 'IGUAL';
";"  return 'PUNTO_COMA';
","  return 'COMA';
"."  return 'PUNTO';
"("  return 'PAR_ABRE';
")"  return 'PAR_CIERRA';
"{"  return 'LLAVE_ABRE';
"}"  return 'LLAVE_CIERRA';
"["  return 'COR_ABRE';
"]"  return 'COR_CIERRA';

[0-9]+"."[0-9]+\b       return 'DECIMAL';
[0-9]+                  return 'ENTERO';
\"(\\.|[^\\\"])*\"      { yytext = desescapar(yytext.substr(1, yyleng - 2)); return 'CADENA'; }
[a-zA-Z_][a-zA-Z0-9_]*  return 'ID';


// ---- errores léxicos: se acumulan en yy.erroresLexicos y el lexer SIGUE (sección 14.1) ----
\"[^\"\n;]*           { yy.erroresLexicos.push({ descripcion: "Cadena sin cerrar", linea: yylloc.first_line, columna: yylloc.first_column }); yytext = yytext.substr(1); return 'CADENA'; }
.                     { yy.erroresLexicos.push({ descripcion: "Carácter no reconocido '" + yytext + "'", linea: yylloc.first_line, columna: yylloc.first_column }); }


<<EOF>> return 'EOF';

/lex

// De MENOR a MAYOR precedencia 
%left OR
%left AND
%left IGUALDAD DESIGUALDAD
%left MENOR MENOR_IGUAL MAYOR MAYOR_IGUAL
%left MAS MENOS
%left POR DIV MOD
%right NOT UMENOS

%start INICIO

%%

INICIO : INSTRUCCIONES EOF { return $1; }
       | EOF               { return []; }
;

INSTRUCCIONES : INSTRUCCIONES INSTRUCCION { if ($2 != null) { $1.push($2); } $$ = $1; }
              | INSTRUCCION               { $$ = ($1 == null) ? [] : [$1]; }
;

BLOQUE : INSTRUCCIONES { $$ = $1; }
       |               { $$ = []; }
;

// Toda instrucción simple termina en ';'. Las que terminan en bloque { } no la llevan.


INSTRUCCION : EXPRESION PUNTO_COMA          { $$ = $1; }
            | DECLARACION                   { $$ = $1; }
            | ASIGNAR PUNTO_COMA            { $$ = $1; }
            | ASIGNAR_PROP PUNTO_COMA       { $$ = $1; }
            | BREAK PUNTO_COMA              { $$ = new Saltos.Romper(@1.first_line, @1.first_column); }
            | CONTINUE PUNTO_COMA           { $$ = new Saltos.Continuar(@1.first_line, @1.first_column); }
            | RETURN PUNTO_COMA             { $$ = new Retorno.default(null, @1.first_line, @1.first_column); }
            | RETURN EXPRESION PUNTO_COMA   { $$ = new Retorno.default($2, @1.first_line, @1.first_column); }
            | INS_IF                        { $$ = $1; }
            | INS_WHILE                     { $$ = $1; }
            | INS_FOR                       { $$ = $1; }
            | DEC_RECURSO                   { $$ = $1; }
            | DEC_FUNCION                   { $$ = $1; }
            | DEC_TASK                      { $$ = $1; }
            | DEC_MAIN                      { $$ = $1; }
            | INS_RUN                       { $$ = $1; }
;



// ---------- tipos ----------

TIPO_BASE : INT          { $$ = new Tipo.default(Tipo.tipoDato.ENTERO); }
          | TIPO_DECIMAL { $$ = new Tipo.default(Tipo.tipoDato.DECIMAL); }
          | TIPO_STRING  { $$ = new Tipo.default(Tipo.tipoDato.CADENA); }
          | TIPO_BOOL    { $$ = new Tipo.default(Tipo.tipoDato.BOOLEAN); }
          | R_SERVER     { $$ = new Tipo.default(Tipo.tipoDato.SERVER); }
          | R_SERVICE    { $$ = new Tipo.default(Tipo.tipoDato.SERVICE); }
          | R_DATABASE   { $$ = new Tipo.default(Tipo.tipoDato.DATABASE); }
;


TIPO : TIPO_BASE                       { $$ = $1; }
     | TIPO_BASE COR_ABRE COR_CIERRA   { $$ = new Tipo.default(Tipo.tipoDato.ARREGLO, $1.getTipo()); }
;

// ---------- declaraciones ----------

// 'TIPO ID' es común a variables y recursos; lo que sigue (= ; o {) decide cuál es.
DECLARACION : TIPO ID IGUAL EXPRESION PUNTO_COMA
              { $$ = new Declaracion.default($1, @1.first_line, @1.first_column, $2, $4); }
            | TIPO ID PUNTO_COMA
              { $$ = new Declaracion.default($1, @1.first_line, @1.first_column, $2, null); }
;

DEC_RECURSO : TIPO ID LLAVE_ABRE LISTA_PROP LLAVE_CIERRA
              { $$ = new DeclaracionRecurso.default($1, $2, $4, @1.first_line, @1.first_column); }
;

LISTA_PROP : PROPIEDADES { $$ = $1; }
           |             { $$ = []; }
;
PROPIEDADES : PROPIEDADES PROPIEDAD { $1.push($2); $$ = $1; }
            | PROPIEDAD             { $$ = [$1]; }
;
PROPIEDAD : ID IGUAL EXPRESION PUNTO_COMA
            { $$ = { nombre: $1, expresion: $3, linea: @1.first_line, columna: @1.first_column }; }
;

// ---------- asignaciones ----------

// ASIGNAR no lleva ';' aquí: el for la reutiliza como incremento.
ASIGNAR : ID IGUAL EXPRESION
          { $$ = new AsignacionVar.default($1, $3, @1.first_line, @1.first_column); }
;
ASIGNAR_PROP : PRIMARIO PUNTO ID IGUAL EXPRESION
               { $$ = new AsignacionPropiedad.default($1, $3, $5, @1.first_line, @1.first_column); }
;

// ---------- control de flujo ----------

INS_IF : IF EXPRESION LLAVE_ABRE BLOQUE LLAVE_CIERRA
         { $$ = new CondicionalIf.default($2, $4, undefined, @1.first_line, @1.first_column); }
       | IF EXPRESION LLAVE_ABRE BLOQUE LLAVE_CIERRA ELSE LLAVE_ABRE BLOQUE LLAVE_CIERRA
         { $$ = new CondicionalIf.default($2, $4, $8, @1.first_line, @1.first_column); }
       | IF EXPRESION LLAVE_ABRE BLOQUE LLAVE_CIERRA ELSE INS_IF
         { $$ = new CondicionalIf.default($2, $4, [$7], @1.first_line, @1.first_column); }
;

INS_WHILE : WHILE EXPRESION LLAVE_ABRE BLOQUE LLAVE_CIERRA
            { $$ = new Mientras.default($2, $4, @1.first_line, @1.first_column); }
;

// for ( int i = 0 ; i < 3 ; i = i + 1 ) { ... }      DECLARACION ya trae su ';'
INS_FOR : FOR PAR_ABRE DECLARACION EXPRESION PUNTO_COMA ASIGNAR PAR_CIERRA LLAVE_ABRE BLOQUE LLAVE_CIERRA
          { $$ = new Para.default($3, $4, $6, $9, @1.first_line, @1.first_column); }
;

// ---------- funciones, tareas, main ----------

DEC_FUNCION : FUNCTION ID PAR_ABRE PARAMS PAR_CIERRA TIPO LLAVE_ABRE BLOQUE LLAVE_CIERRA
              { $$ = new DeclaracionFuncion.default($2, $4, $6, $8, @1.first_line, @1.first_column); }
            | FUNCTION ID PAR_ABRE PARAMS PAR_CIERRA LLAVE_ABRE BLOQUE LLAVE_CIERRA
              { $$ = new DeclaracionFuncion.default($2, $4, null, $7, @1.first_line, @1.first_column); }
;
PARAMS : LISTA_PARAMS { $$ = $1; }
       |              { $$ = []; }
;
LISTA_PARAMS : LISTA_PARAMS COMA PARAM { $1.push($3); $$ = $1; }
             | PARAM                   { $$ = [$1]; }
;
PARAM : TIPO ID { $$ = new DeclaracionFuncion.Parametro($1, $2); }
;

DEC_TASK : TASK ID LLAVE_ABRE BLOQUE LLAVE_CIERRA
           { $$ = new Tareas.DeclaracionTask($2, $4, @1.first_line, @1.first_column); }
;
DEC_MAIN : MAIN LLAVE_ABRE BLOQUE LLAVE_CIERRA
           { $$ = new Tareas.Main($3, @1.first_line, @1.first_column); }
;
INS_RUN : RUN ID PUNTO_COMA
          { $$ = new Tareas.RunTask($2, @1.first_line, @1.first_column); }
;

// ---------- expresiones ----------

EXPRESION : EXPRESION MAS EXPRESION         { $$ = new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.SUMA, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION MENOS EXPRESION       { $$ = new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.RESTA, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION POR EXPRESION         { $$ = new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.MULT, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION DIV EXPRESION         { $$ = new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.DIV, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION MOD EXPRESION         { $$ = new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.MOD, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION MENOR EXPRESION       { $$ = new Relacionales.default(Relacionales.Op_relacionales.MENOR, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION MENOR_IGUAL EXPRESION { $$ = new Relacionales.default(Relacionales.Op_relacionales.MENOR_IGUAL, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION MAYOR EXPRESION       { $$ = new Relacionales.default(Relacionales.Op_relacionales.MAYOR, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION MAYOR_IGUAL EXPRESION { $$ = new Relacionales.default(Relacionales.Op_relacionales.MAYOR_IGUAL, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION IGUALDAD EXPRESION    { $$ = new Relacionales.default(Relacionales.Op_relacionales.IGUALDAD, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION DESIGUALDAD EXPRESION { $$ = new Relacionales.default(Relacionales.Op_relacionales.DESIGUALDAD, @1.first_line, @1.first_column, $1, $3); }
          | EXPRESION AND EXPRESION         { $$ = new Logicas.default(Logicas.OperadoresLogicos.AND, $1, $3, @1.first_line, @1.first_column); }
          | EXPRESION OR EXPRESION          { $$ = new Logicas.default(Logicas.OperadoresLogicos.OR, $1, $3, @1.first_line, @1.first_column); }
          | NOT EXPRESION                   { $$ = new Unarias.default(Unarias.OperadoresUnarios.NOT, $2, @1.first_line, @1.first_column); }
          | MENOS EXPRESION %prec UMENOS    { $$ = new Unarias.default(Unarias.OperadoresUnarios.NEGATIVO, $2, @1.first_line, @1.first_column); }
          | PRIMARIO                        { $$ = $1; }
;

// postfix: llamadas, propiedades e índices encadenables (api.host.os, packages[i])
PRIMARIO : ENTERO    { $$ = new Nativos.default(new Tipo.default(Tipo.tipoDato.ENTERO), parseInt($1), @1.first_line, @1.first_column); }
         | DECIMAL   { $$ = new Nativos.default(new Tipo.default(Tipo.tipoDato.DECIMAL), parseFloat($1), @1.first_line, @1.first_column); }
         | CADENA    { $$ = new Nativos.default(new Tipo.default(Tipo.tipoDato.CADENA), $1, @1.first_line, @1.first_column); }
         | RTRUE     { $$ = new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), true, @1.first_line, @1.first_column); }
         | RFALSE    { $$ = new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), false, @1.first_line, @1.first_column); }
         | PAR_ABRE EXPRESION PAR_CIERRA                { $$ = $2; }
         | COR_ABRE ARGS COR_CIERRA                     { $$ = new Arreglo.default($2, @1.first_line, @1.first_column); }
         | ID PAR_ABRE ARGS PAR_CIERRA                  { $$ = new Llamada.default($1, $3, @1.first_line, @1.first_column); }
         | ID                                           { $$ = new AccesoVar.default($1, @1.first_line, @1.first_column); }
         | PRIMARIO PUNTO ID                            { $$ = new AccesoPropiedad.default($1, $3, @1.first_line, @1.first_column); }
         | PRIMARIO COR_ABRE EXPRESION COR_CIERRA       { $$ = new AccesoIndice.default($1, $3, @1.first_line, @1.first_column); }
;

ARGS : LISTA_ARGS { $$ = $1; }
     |            { $$ = []; }
;
LISTA_ARGS : LISTA_ARGS COMA EXPRESION { $1.push($3); $$ = $1; }
           | EXPRESION                 { $$ = [$1]; }
;