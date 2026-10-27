# Gramática BNF de AutoInfra

Este documento describe la gramática implementada por el compilador de
AutoInfra. La especificación se divide en:

1. Reglas léxicas: convierten caracteres del código fuente en tokens.
2. Reglas sintácticas: combinan los tokens y forman el AST.
3. Precedencia y asociatividad de expresiones.
4. Reglas que pertenecen al análisis semántico y no a la BNF.


## 1. Notación BNF

| Notación | Significado |
|---|---|
| `<nombre>` | Símbolo no terminal. |
| `NOMBRE_TOKEN` | Token producido por el analizador léxico. |
| `'texto'` | Lexema literal escrito en el programa. |
| `::=` | “Se define como”. |
| `\|` | Alternativa. |
| `ε` | Cadena vacía. |
| `EOF` | Fin lógico del archivo. |

La gramática utiliza recursión para representar listas. Por ejemplo,
`<INSTRUCCIONES>` permite una o más instrucciones y `<BLOQUE>` permite cero o
más instrucciones.

Las acciones JavaScript que aparecen en el archivo Jison se omiten aquí,
porque construyen objetos del AST pero no cambian los tokens reconocidos ni las
producciones de la gramática.

## 2. Gramática léxica

El lexer se ejecuta antes del parser. Las reglas se prueban en el orden en que
aparecen en el archivo Jison. Las palabras reservadas se evalúan antes que
`ID`, por lo que, por ejemplo, `main` produce `MAIN` y no `ID`.

### 2.1 Espacios y comentarios

Estas entradas se ignoran:

```bnf
<espacio>              ::= <caracter-de-espacio>
                        | <espacio> <caracter-de-espacio>

<comentario-linea>     ::= '//' <caracter-cualquiera-hasta-salto>

<comentario-multilinea>::= '/*' <contenido-comentario> '*/'
```

En la implementación, `<caracter-de-espacio>` corresponde a los caracteres
reconocidos por `\s`, incluidos espacios, tabulaciones y saltos de línea.
`<comentario-linea>` comienza con `//` y termina antes del salto de línea.
`<comentario-multilinea>` puede abarcar varias líneas.

### 2.2 Palabras reservadas

```bnf
<palabra-reservada> ::= 'int'
                      | 'float'
                      | 'decimal'
                      | 'string'
                      | 'bool'
                      | 'server'
                      | 'service'
                      | 'database'
                      | 'if'
                      | 'else'
                      | 'while'
                      | 'for'
                      | 'break'
                      | 'continue'
                      | 'return'
                      | 'function'
                      | 'task'
                      | 'main'
                      | 'run'
                      | 'true'
                      | 'false'
```

Correspondencia entre lexema y token:

| Lexema | Token |
|---|---|
| `int` | `INT` |
| `float`, `decimal` | `TIPO_DECIMAL` |
| `string` | `TIPO_STRING` |
| `bool` | `TIPO_BOOL` |
| `server` | `R_SERVER` |
| `service` | `R_SERVICE` |
| `database` | `R_DATABASE` |
| `if` | `IF` |
| `else` | `ELSE` |
| `while` | `WHILE` |
| `for` | `FOR` |
| `break` | `BREAK` |
| `continue` | `CONTINUE` |
| `return` | `RETURN` |
| `function` | `FUNCTION` |
| `task` | `TASK` |
| `main` | `MAIN` |
| `run` | `RUN` |
| `true` | `RTRUE` |
| `false` | `RFALSE` |

El lenguaje distingue mayúsculas y minúsculas. Por ejemplo, `main` es una
palabra reservada, pero `Main` es un identificador.

### 2.3 Operadores y delimitadores

```bnf
<operador-logico>     ::= '&&' | '||' | '!'
<operador-relacional> ::= '<=' | '>=' | '!=' | '==' | '<' | '>'
<operador-aritmetico> ::= '+' | '-' | '*' | '/' | '%'
<asignacion>          ::= '='
<delimitador>         ::= ';' | ',' | '.' | '(' | ')' | '{' | '}' | '[' | ']'
```

Tabla exacta de tokens:

| Lexema | Token | Lexema | Token |
|---|---|---|---|
| `&&` | `AND` | `||` | `OR` |
| `<=` | `MENOR_IGUAL` | `>=` | `MAYOR_IGUAL` |
| `!=` | `DESIGUALDAD` | `==` | `IGUALDAD` |
| `<` | `MENOR` | `>` | `MAYOR` |
| `+` | `MAS` | `-` | `MENOS` |
| `*` | `POR` | `/` | `DIV` |
| `%` | `MOD` | `!` | `NOT` |
| `=` | `IGUAL` | `;` | `PUNTO_COMA` |
| `,` | `COMA` | `.` | `PUNTO` |
| `(` | `PAR_ABRE` | `)` | `PAR_CIERRA` |
| `{` | `LLAVE_ABRE` | `}` | `LLAVE_CIERRA` |
| `[` | `COR_ABRE` | `]` | `COR_CIERRA` |

Los operadores de dos caracteres aparecen antes que los operadores de un
carácter en el lexer. Por esto `<=` se reconoce como un solo token
`MENOR_IGUAL`, y no como `MENOR` seguido de `IGUAL`.

### 2.4 Identificadores y literales

Para expresar las reglas de caracteres se utilizan estas categorías:

```bnf
<letra>               ::= 'A' | 'B' | ... | 'Z'
                        | 'a' | 'b' | ... | 'z'

<digito>              ::= '0' | '1' | ... | '9'

<caracter-identificador>
                      ::= <letra> | <digito> | '_'

<caracter-escape>     ::= '\"' | '\\' | 'n' | 't'
```

Las definiciones de tokens implementadas son:

```bnf
<ID>                  ::= <letra-o-guion-bajo> <resto-id>

<resto-id>            ::= ε
                        | <caracter-identificador> <resto-id>

<letra-o-guion-bajo>  ::= <letra> | '_'

<ENTERO>              ::= <digito> <resto-digitos>

<resto-digitos>       ::= ε
                        | <digito> <resto-digitos>

<DECIMAL>             ::= <digito> <resto-digitos> '.'
                          <digito> <resto-digitos>

<CADENA>              ::= '"' <contenido-cadena> '"'

<contenido-cadena>    ::= ε
                        | <caracter-cadena> <contenido-cadena>
                        | '\' <caracter-escape> <contenido-cadena>
```

`<caracter-cadena>` representa cualquier carácter excepto una comilla doble,
una barra invertida o un salto de línea no permitido por la expresión regular
del lexer. Los escapes procesados por el lexer son:

| Escape | Valor |
|---|---|
| `\"` | Comilla doble |
| `\\` | Barra invertida |
| `\n` | Salto de línea |
| `\t` | Tabulador |

La expresión regular real de `ID` es `[a-zA-Z_][a-zA-Z0-9_]*`. La de
`ENTERO` es `[0-9]+`, y la de `DECIMAL` es `[0-9]+"."[0-9]+\b`.

### 2.5 Fin de archivo y errores léxicos

```bnf
<fin-archivo>         ::= EOF
```

El lexer no detiene todo el análisis ante un error. Acumula el diagnóstico y
continúa buscando tokens:

```bnf
<error-lexico>        ::= <caracter-no-reconocido>
                         | <cadena-sin-cerrar>
                         | <comentario-multilinea-sin-cerrar>
```

Los casos reconocidos son:

- Un carácter que no coincide con ningún token, como `@`.
- Una cadena que comienza con `"` y no encuentra su cierre antes del fin de
  línea o un punto y coma.
- Un comentario que comienza con `/*` y no encuentra `*/`.

Estos errores se reportan con categoría `Léxico` y código `LEX-001`. El
analizador sintáctico puede producir errores derivados, pero `procesar.ts`
elimina los diagnósticos sintácticos que son consecuencia directa de un error
léxico cercano.

## 3. Gramática sintáctica completa

El símbolo inicial del parser es `<INICIO>`.

### 3.1 Programa y bloques

```bnf
<INICIO>              ::= <INSTRUCCIONES> EOF
                        | EOF

<INSTRUCCIONES>       ::= <INSTRUCCIONES> <INSTRUCCION>
                        | <INSTRUCCION>

<BLOQUE>              ::= <INSTRUCCIONES>
                        | ε
```

`<INICIO>` acepta un archivo vacío o un archivo con una o más instrucciones.
`<BLOQUE>` puede estar vacío porque se utiliza dentro de llaves.

### 3.2 Instrucciones

```bnf
<INSTRUCCION>         ::= <EXPRESION> PUNTO_COMA
                        | <DECLARACION>
                        | <ASIGNAR> PUNTO_COMA
                        | <ASIGNAR_PROP> PUNTO_COMA
                        | BREAK PUNTO_COMA
                        | CONTINUE PUNTO_COMA
                        | RETURN PUNTO_COMA
                        | RETURN <EXPRESION> PUNTO_COMA
                        | <INS_IF>
                        | <INS_WHILE>
                        | <INS_FOR>
                        | <DEC_RECURSO>
                        | <DEC_FUNCION>
                        | <DEC_TASK>
                        | <DEC_MAIN>
                        | <INS_RUN>
```

Las instrucciones simples terminan en `PUNTO_COMA`. Las instrucciones que
contienen un bloque (`if`, ciclos, recursos, funciones, tareas y `main`) no
requieren un punto y coma después de la llave de cierre.

### 3.3 Tipos

```bnf
<TIPO_BASE>           ::= INT
                        | TIPO_DECIMAL
                        | TIPO_STRING
                        | TIPO_BOOL
                        | R_SERVER
                        | R_SERVICE
                        | R_DATABASE

<TIPO>                ::= <TIPO_BASE>
                        | <TIPO_BASE> COR_ABRE COR_CIERRA
```

`float` y `decimal` producen el mismo token `TIPO_DECIMAL`. La segunda
producción de `<TIPO>` representa un arreglo de elementos del tipo base, por
ejemplo `int[]` o `server[]`.

### 3.4 Declaraciones

```bnf
<DECLARACION>         ::= <TIPO> ID IGUAL <EXPRESION> PUNTO_COMA
                        | <TIPO> ID PUNTO_COMA
```

La primera forma declara e inicializa una variable. La segunda declara una
variable sin expresión inicial.

### 3.5 Declaraciones de recursos

```bnf
<DEC_RECURSO>         ::= <TIPO> ID LLAVE_ABRE <LISTA_PROP> LLAVE_CIERRA

<LISTA_PROP>          ::= <PROPIEDADES>
                        | ε

<PROPIEDADES>         ::= <PROPIEDADES> <PROPIEDAD>
                        | <PROPIEDAD>

<PROPIEDAD>           ::= ID IGUAL <EXPRESION> PUNTO_COMA
```

La forma sintáctica es común para los tres recursos. El análisis semántico
verifica que el tipo sea `server`, `service` o `database`, y que las
propiedades sean válidas para el recurso.

Ejemplo:

```text
server backend {
    cpu = 4;
    memory = 8192;
    disk = 100;
    os = "linux";
}
```

### 3.6 Asignaciones

```bnf
<ASIGNAR>             ::= ID IGUAL <EXPRESION>

<ASIGNAR_PROP>        ::= <PRIMARIO> PUNTO ID IGUAL <EXPRESION>
```

`<ASIGNAR>` no incluye `PUNTO_COMA` porque se reutiliza como incremento en
`<INS_FOR>`. En una instrucción normal se incorpora mediante
`<INSTRUCCION>`.

### 3.7 Condicionales

```bnf
<INS_IF>              ::= IF <EXPRESION> LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
                        | IF <EXPRESION> LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
                          ELSE LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
                        | IF <EXPRESION> LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
                          ELSE <INS_IF>
```

La tercera alternativa permite escribir `else if` sin introducir una palabra
reservada adicional.

### 3.8 Ciclos

```bnf
<INS_WHILE>           ::= WHILE <EXPRESION> LLAVE_ABRE <BLOQUE> LLAVE_CIERRA

<INS_FOR>             ::= FOR PAR_ABRE <DECLARACION> <EXPRESION>
                          PUNTO_COMA <ASIGNAR> PAR_CIERRA
                          LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
```

La declaración inicial del `for` ya contiene su propio `PUNTO_COMA`. Por eso
la producción incluye un segundo `PUNTO_COMA` entre la condición y el
incremento.

Ejemplo:

```text
for (int i = 0; i < 3; i = i + 1) {
    print(i);
}
```

### 3.9 Funciones

```bnf
<DEC_FUNCION>         ::= FUNCTION ID PAR_ABRE <PARAMS> PAR_CIERRA <TIPO>
                          LLAVE_ABRE <BLOQUE> LLAVE_CIERRA
                        | FUNCTION ID PAR_ABRE <PARAMS> PAR_CIERRA
                          LLAVE_ABRE <BLOQUE> LLAVE_CIERRA

<PARAMS>              ::= <LISTA_PARAMS>
                        | ε

<LISTA_PARAMS>        ::= <LISTA_PARAMS> COMA <PARAM>
                        | <PARAM>

<PARAM>               ::= <TIPO> ID
```

La primera alternativa de `<DEC_FUNCION>` declara el tipo de retorno. La
segunda declara una función sin tipo de retorno explícito.

### 3.10 Tareas, `main` y ejecución de tareas

```bnf
<DEC_TASK>            ::= TASK ID LLAVE_ABRE <BLOQUE> LLAVE_CIERRA

<DEC_MAIN>            ::= MAIN LLAVE_ABRE <BLOQUE> LLAVE_CIERRA

<INS_RUN>             ::= RUN ID PUNTO_COMA
```

El lenguaje permite declarar tareas sin parámetros. La instrucción `run`
ejecuta la tarea identificada por `ID`. La restricción de que exista
exactamente un bloque `main` se valida semánticamente al ejecutar el programa.

## 4. Gramática de expresiones

El parser Jison expresa las expresiones mediante la regla recursiva
`<EXPRESION>`. La precedencia se fija con las declaraciones `%left` y `%right`
del archivo Jison.

```bnf
<EXPRESION>           ::= <EXPRESION> MAS <EXPRESION>
                        | <EXPRESION> MENOS <EXPRESION>
                        | <EXPRESION> POR <EXPRESION>
                        | <EXPRESION> DIV <EXPRESION>
                        | <EXPRESION> MOD <EXPRESION>
                        | <EXPRESION> MENOR <EXPRESION>
                        | <EXPRESION> MENOR_IGUAL <EXPRESION>
                        | <EXPRESION> MAYOR <EXPRESION>
                        | <EXPRESION> MAYOR_IGUAL <EXPRESION>
                        | <EXPRESION> IGUALDAD <EXPRESION>
                        | <EXPRESION> DESIGUALDAD <EXPRESION>
                        | <EXPRESION> AND <EXPRESION>
                        | <EXPRESION> OR <EXPRESION>
                        | NOT <EXPRESION>
                        | MENOS <EXPRESION>
                        | <PRIMARIO>
```

La alternativa unaria `MENOS <EXPRESION>` usa la precedencia ficticia
`UMENOS`, declarada en Jison mediante `%prec UMENOS`. Esto permite diferenciar
el menos unario del menos binario.

### 4.1 Expresiones primarias y accesos encadenados

```bnf
<PRIMARIO>            ::= ENTERO
                        | DECIMAL
                        | CADENA
                        | RTRUE
                        | RFALSE
                        | PAR_ABRE <EXPRESION> PAR_CIERRA
                        | COR_ABRE <ARGS> COR_CIERRA
                        | ID PAR_ABRE <ARGS> PAR_CIERRA
                        | ID
                        | <PRIMARIO> PUNTO ID
                        | <PRIMARIO> COR_ABRE <EXPRESION> COR_CIERRA
```

Las dos últimas alternativas permiten encadenar accesos:

```text
api.host.os
packages[i]
service.dependsOn[0]
```

También permiten acceder a una propiedad o índice después de otra operación
primaria, debido a la recursión de `<PRIMARIO>`.

### 4.2 Argumentos y arreglos

```bnf
<ARGS>                ::= <LISTA_ARGS>
                        | ε

<LISTA_ARGS>          ::= <LISTA_ARGS> COMA <EXPRESION>
                        | <EXPRESION>
```

`<ARGS>` se utiliza tanto para los argumentos de una llamada como para los
elementos de un arreglo literal:

```text
print("server", backend);
int[] puertos = [80, 443];
```

## 5. Precedencia y asociatividad

Las declaraciones de precedencia del parser son:

```text
%left OR
%left AND
%left IGUALDAD DESIGUALDAD
%left MENOR MENOR_IGUAL MAYOR MAYOR_IGUAL
%left MAS MENOS
%left POR DIV MOD
%right NOT UMENOS
```

De menor a mayor precedencia:

| Nivel | Tokens | Asociatividad |
|---:|---|---|
| 1 | `OR` (`||`) | Izquierda |
| 2 | `AND` (`&&`) | Izquierda |
| 3 | `IGUALDAD`, `DESIGUALDAD` (`==`, `!=`) | Izquierda |
| 4 | `MENOR`, `MENOR_IGUAL`, `MAYOR`, `MAYOR_IGUAL` | Izquierda |
| 5 | `MAS`, `MENOS` (`+`, `-`) | Izquierda |
| 6 | `POR`, `DIV`, `MOD` (`*`, `/`, `%`) | Izquierda |
| 7 | `NOT`, `UMENOS` (`!`, `-` unario) | Derecha |

Los paréntesis se reconocen mediante la producción de `<PRIMARIO>` y permiten
forzar una agrupación distinta. Por ejemplo:

```text
2 + 3 * 4       -> 2 + (3 * 4)
(2 + 3) * 4     -> (2 + 3) * 4
!activo && ok   -> (!activo) && ok
-a * b          -> (-a) * b
```

La evaluación de `AND` y `OR` puede aplicar corto circuito durante la
ejecución; eso es comportamiento del intérprete y no una producción
adicional de la BNF.

## 6. Reglas semánticas fuera de la BNF

La BNF determina si una secuencia de tokens tiene estructura válida. Las
siguientes condiciones se verifican después, durante la interpretación:

- Debe existir exactamente un bloque `main`.
- No se permite declarar dos veces un identificador en el mismo ámbito.
- Las variables utilizadas deben existir en el ámbito actual o en un ámbito
  padre.
- Los tipos de asignaciones, operaciones y parámetros deben ser compatibles.
- `break` y `continue` solo son válidos dentro de un ciclo.
- `return` solo es válido dentro de una función.
- Un recurso solo puede ser `server`, `service` o `database`.
- Las propiedades de un recurso deben existir, no repetirse y respetar su
  tipo, obligatoriedad y permisos de escritura.
- Los puertos deben estar entre 1 y 65535.
- CPU, memoria y disco deben ser mayores que cero.
- Un servicio debe tener al menos una réplica.
- `deploy`, `start`, `install` y las demás funciones nativas deben respetar el
  estado y las dependencias de los recursos.

## 7. Recuperación de errores sintácticos

El archivo Jison genera tablas LALR, pero el proyecto utiliza
[`sintactico.ts`](../backend/src/analizador/sintactico.ts) como conductor del
parser para recuperar errores. Cuando encuentra una entrada inválida intenta:

1. Insertar un delimitador faltante (`;`, `)`, `]` o `}`).
2. Eliminar un token sobrante.
3. Entrar en modo pánico y descartar tokens hasta un punto de sincronización,
   como `;`, `}` o el inicio de una declaración.

La recuperación limita el reporte a 50 errores sintácticos. También silencia
errores en cascada hasta desplazar varios tokens. Esta lógica no cambia la BNF:
solo permite continuar el análisis para reportar más diagnósticos en una misma
entrada.

Los errores sintácticos se devuelven con categoría `Sintáctico` y código
`SYN-001`. Si existen errores léxicos o sintácticos, `procesar.ts` puede
devolver tokens y un AST parcial para diagnóstico, pero no ejecuta el programa.

## 8. Ejemplo completo

El siguiente programa utiliza varias producciones de la gramática:

```text
server backend {
    cpu = 4;
    memory = 8192;
    disk = 100;
    os = "linux";
}

service api {
    port = 8080;
    replicas = 2;
    dependsOn = [backend];
}

function iniciar(server objetivo) bool {
    return start(objetivo);
}

main {
    if (iniciar(backend)) {
        deploy(backend, api);
        print(status(api));
    } else {
        print("No se pudo iniciar el servidor");
    }
}
```

En este ejemplo:

- `server backend { ... }` usa `<DEC_RECURSO>`.
- Cada propiedad usa `<PROPIEDAD>`.
- `dependsOn = [backend];` usa un arreglo de `<PRIMARIO>`.
- `function ...` usa `<DEC_FUNCION>`, `<PARAMS>` y `<TIPO>`.
- `return start(objetivo);` usa una llamada dentro de una expresión.
- `if ... else ...` usa `<INS_IF>`.
- `main { ... }` usa `<DEC_MAIN>`.
