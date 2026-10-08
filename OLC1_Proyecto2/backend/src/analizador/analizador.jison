
%{

    const Tipo = require('./simbolo/Tipo')
    const Nativos= require('./expresiones/Nativos')
    const Aritmeticas= require('./expresiones/Aritmeticas')
    const Relacionales= require('./expresiones/Relacionales')


    const Declaracion= require('./instrucciones/Declaracion')
    const AccesoVar=require('./expresiones/AccesoVar')
    const AsignacionVar= require('./instrucciones/Asignacion')
    const CondicionalIf = require('./instrucciones/CondicionalIf');
    const Imprimir= require('./instrucciones/Imprimir')
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
"println" return 'IMPRIMIR';
\s+ /* Ignorar espacios y saltos de linea. */
"+" return 'MAS';
"-" return 'MENOS';
";" return 'PUNTO_COMA';
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

%start INICIO

%%

INICIO : INSTRUCCIONES EOF {return $1;}
;

INSTRUCCIONES : INSTRUCCIONES INSTRUCCION    {$1.push($2); $$=$1;}
    |INSTRUCCION  {$$= [$1]}
;

INSTRUCCION :INS_IMPRIMIR {$$ = $1;} 
            |EXPRESION PUNTO_COMA {$$=$1}
            |DECLARACION {$$=$1}
            |ASIGNAR    {$$ = $1;}
            |INS_IF {$$ = $1;}

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
    |EXPRESION MENOR EXPRESION { $$= new Relacionales.default(Relacionales.Op_relacionales.MENOR,@1.first_line, @1.first_column,$1,$3); }
    |EXPRESION IGUALDAD EXPRESION { $$= new Relacionales.default(Relacionales.Op_relacionales.IGUALDAD,@1.first_line, @1.first_column,$1,$3); }
    |ENTERO {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.ENTERO),$1, @1.first_line, @1.first_column ); }
    |DECIMAL {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.DECIMAL),$1, @1.first_line, @1.first_column ); }
    |CADENA  {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.CADENA),$1, @1.first_line, @1.first_column ); }
    |RTRUE             {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), true, @1.first_line, @1.first_column ); }
    |RFALSE            {$$= new Nativos.default(new Tipo.default(Tipo.tipoDato.BOOLEAN), false, @1.first_line, @1.first_column ); }
 
    |PAR_ABRE EXPRESION PAR_CIERRA {$$=$2;}
    |ID         {$$= new AccesoVar.default($1,@1.first_line, @1.first_column);}
;

TIPO: INT {$$= new Tipo.default(Tipo.tipoDato.ENTERO);}
    |TIPO_DECIMAL {$$= new Tipo.default(Tipo.tipoDato.DECIMAL);}
;