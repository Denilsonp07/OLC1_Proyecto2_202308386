
%{

    const Tipo = require('./simbolo/tipo')
    const Nativos= require('./expresiones/nativos')
    const Aritmeticas= require('./expresiones/aritmeticas')
    const Relacionales= require('./expresiones/relacionales')


    const Declaracion= require('./instrucciones/declaracion')
    const AccesoVar=require('./expresiones/accesoVar')
    const AsignacionVar= require('./instrucciones/asignacion')
    const CondicionalIf = require('./instrucciones/condicionalIf');
    const Imprimir= require('./instrucciones/imprimir')

    //  IMPORTS DE INFRA

    const DeclaracionServer = require('./instrucciones/DeclaracionServer');

    const AccesoPropiedad = require('./expresiones/accesoPropiedad');
%}



%lex
%%
//plabras reservadas
"var"       return 'VAR';
"int"       return 'INT';
"decimal"   return 'TIPO_DECIMAL';
"if"        return 'IF';
"else"      return 'ELSE';
"true"      return 'RTRUE';
"false"     return 'RFALSE';
"print"     return 'IMPRIMIR';
"println"   return 'IMPRIMIR';

// palabras reservadas de infraestructura
"server"      return 'R_SERVER';
"service"     return 'R_SERVICE';
"database"    return 'R_DATABASE';


\s+ /* Ignorar espacios y saltos de linea. */

"+" return 'MAS';
"-" return 'MENOS';
"*" return 'POR';
";" return 'PUNTO_COMA';
"." return 'PUNTO';
"(" return 'PAR_ABRE';
")" return 'PAR_CIERRA';
"{" return 'LLAVE_ABRE';
"}" return 'LLAVE_CIERRA';
"<" return 'MENOR';
"==" return 'IGUALDAD';
"=" return 'IGUAL';

[0-9]+"."[0-9]+\b  return 'DECIMAL';
[0-9]+                  return 'ENTERO';
\"[^\"]*\"              { yytext = yytext.substr(1,yyleng-2); return 'CADENA'; }
[a-zA-Z_][a-zA-Z0-9_]*  return 'ID';

<<EOF>> return 'EOF';

/lex

%left IGUALDAD MENOR
%left MAS MENOS
%left POR

%start INICIO

%%

INICIO : INSTRUCCIONES EOF {return $1;}
;

INSTRUCCIONES : INSTRUCCIONES INSTRUCCION    {$1.push($2); $$=$1;}
    |INSTRUCCION  {$$= [$1]}
;

INSTRUCCION :INS_IMPRIMIR PUNTO_COMA {$$ = $1;}
            |EXPRESION PUNTO_COMA {$$=$1}
            |DECLARACION {$$=$1}
            |ASIGNAR PUNTO_COMA   {$$ = $1;}
            |INS_IF PUNTO_COMA    {$$ = $1;}
            |DEC_SERVER PUNTO_COMA {$$ = $1;}

;

//     REGLAS INFRAESTRUCTURA

DEC_SERVER : R_SERVER ID LLAVE_ABRE LISTA_PROPIEDADES LLAVE_CIERRA
    { $$ = new DeclaracionServer.default($2, $4, @1.first_line, @1.first_column); }
;


LISTA_PROPIEDADES : LISTA_PROPIEDADES PROPIEDAD 
    { $1.push($2); $$ = $1; }
    | PROPIEDAD 
    { $$ = [$1]; }
;


PROPIEDAD : ID IGUAL EXPRESION PUNTO_COMA
    { $$ = { id: $1, valor: $3, linea: @1.first_line, col: @1.first_column }; }
;



DECLARACION:TIPO ID IGUAL EXPRESION PUNTO_COMA {$$= new Declaracion.default($1,@1.first_line, @1.first_column,$2,$4)}
;

ASIGNAR: ID IGUAL EXPRESION {$$= new AsignacionVar.default($1, $3, @1.first_line, @1.first_column);}
;

INS_IF : IF EXPRESION LLAVE_ABRE INSTRUCCIONES LLAVE_CIERRA { $$ = new CondicionalIf.default($2, $4, undefined, @1.first_line, @1.first_column); }
       | IF EXPRESION LLAVE_ABRE INSTRUCCIONES LLAVE_CIERRA ELSE LLAVE_ABRE INSTRUCCIONES LLAVE_CIERRA { $$ = new CondicionalIf.default($2, $4, $8, @1.first_line, @1.first_column); }
;

INS_IMPRIMIR : IMPRIMIR PAR_ABRE EXPRESION PAR_CIERRA {$$= new Imprimir.default($3,@1.first_line, @1.first_column);}
;

EXPRESION : EXPRESION MAS EXPRESION  { $$= new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.SUMA,$1,$3,  @1.first_line, @1.first_column ); }
    |EXPRESION MENOS EXPRESION { $$= new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.RESTA,$1,$3,  @1.first_line, @1.first_column ); }

    |EXPRESION POR EXPRESION { $$= new Aritmeticas.default(Aritmeticas.OperadoresAritmeticos.MULT,$1,$3,  @1.first_line, @1.first_column ); }
    |EXPRESION MENOR EXPRESION { $$= new Relacionales.default(Relacionales.Op_relacionales.MENOR,@1.first_line, @1.first_column,$1,$3); }
    |EXPRESION IGUALDAD EXPRESION { $$= new Relacionales.default(Relacionales.Op_relacionales.IGUALDAD,@1.first_line, @1.first_column,$1,$3); }
    |ENTERO  {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.ENTERO),parseInt($1), @1.first_line, @1.first_column ); }
    |DECIMAL {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.DECIMAL),parseFloat($1), @1.first_line, @1.first_column ); }
    |CADENA  {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.CADENA),$1, @1.first_line, @1.first_column ); }
    |RTRUE             {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), true, @1.first_line, @1.first_column ); }
    |RFALSE            {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), false, @1.first_line, @1.first_column ); }
 
    |PAR_ABRE EXPRESION PAR_CIERRA {$$=$2;}

    |ID PUNTO ID {$$= new AccesoPropiedad.default($1,$3,@1.first_line, @1.first_column);}
    |ID         {$$= new AccesoVar.default($1,@1.first_line, @1.first_column);}
;

TIPO: INT {$$= new Tipo.default(Tipo.tipoDato.ENTERO);}
    |TIPO_DECIMAL {$$= new Tipo.default(Tipo.tipoDato.DECIMAL);}
;