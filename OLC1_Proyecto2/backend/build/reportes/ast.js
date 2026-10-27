"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.construirAST = construirAST;
exports.aDot = aDot;
const instruccion_1 = require("../analizador/abstracto/instruccion");
const tipo_1 = __importStar(require("../analizador/simbolo/tipo"));
const SIMBOLOS_ARIT = ["+", "-", "*", "/", "%"];
const SIMBOLOS_REL = ["==", "!=", "<", "<=", ">", ">="];
const SIMBOLOS_LOG = ["&&", "||"];
const SIMBOLOS_UNA = ["-", "!"];
// nombre de la clase -> nombre que se muestra 
const NOMBRES = {
    Nativo: "LiteralExpression", AccesoVar: "IdentifierExpression", Aritmeticas: "BinaryExpression",
    Relacionales: "BinaryExpression", Logicas: "LogicalExpression", Unarias: "UnaryExpression",
    Llamada: "CallExpression", AccesoPropiedad: "PropertyAccessExpression", AccesoIndice: "IndexExpression",
    Arreglo: "ArrayExpression", Declaracion: "VariableDeclaration", DeclaracionRecurso: "ResourceDeclaration",
    AsignacionVar: "Assignment", AsignacionPropiedad: "PropertyAssignment", CondicionalIf: "IfInstruction",
    Mientras: "WhileInstruction", Para: "ForInstruction", Romper: "BreakInstruction", Continuar: "ContinueInstruction",
    Retorno: "ReturnInstruction", DeclaracionFuncion: "FunctionDeclaration", DeclaracionTask: "TaskDeclaration",
    RunTask: "RunInstruction", Main: "MainBlock",
};
// nombre del campo -> etiqueta de la arista
const ROLES = {
    operando1: "izq", operando2: "der", operador1: "izq", operador2: "der", op1: "izq", op2: "der",
    operando: "operando", condicion: "condición", instruccionesIf: "then", instruccionesElse: "else",
    cuerpo: "cuerpo", inicio: "inicio", incremento: "incremento", expresion: "valor", valor: "valor",
    base: "objetivo", indice: "índice", args: "arg", elementos: "elemento",
};
const COLORES = {
    LiteralExpression: "#e8f0fe", IdentifierExpression: "#e8f0fe", BinaryExpression: "#d2e3fc", LogicalExpression: "#d2e3fc",
    UnaryExpression: "#d2e3fc", CallExpression: "#fce8b2", PropertyAccessExpression: "#e8f0fe", IndexExpression: "#e8f0fe",
    ArrayExpression: "#e8f0fe", VariableDeclaration: "#ceead6", ResourceDeclaration: "#ceead6", FunctionDeclaration: "#ceead6",
    TaskDeclaration: "#ceead6", MainBlock: "#f6aea9", IfInstruction: "#fde293", WhileInstruction: "#fde293",
    ForInstruction: "#fde293", RunInstruction: "#fce8b2", Program: "#dadce0",
};
const MAX_NODOS = 3000;
const esNodo = (v) => v instanceof instruccion_1.Instruccion;
function construirAST(instrucciones) {
    let contador = 0;
    let truncado = false;
    const nuevo = (tipo) => ({ id: ++contador, tipo, atributos: [], hijos: [] });
    const visitar = (n, nodoPadre, rol) => {
        if (contador >= MAX_NODOS) {
            truncado = true;
            return;
        }
        nodoPadre.hijos.push({ rol, nodo: convertir(n) });
    };
    const convertir = (n) => {
        const clase = n.constructor.name;
        const nodo = nuevo(NOMBRES[clase] ?? clase);
        const campos = n;
        // el operador se guarda como número de un enum: se traduce a su símbolo
        if (clase === "Aritmeticas")
            nodo.atributos.push(`operador: ${SIMBOLOS_ARIT[campos.operador]}`);
        else if (clase === "Relacionales")
            nodo.atributos.push(`operador: ${SIMBOLOS_REL[campos.Operacion]}`);
        else if (clase === "Logicas")
            nodo.atributos.push(`operador: ${SIMBOLOS_LOG[campos.operador]}`);
        else if (clase === "Unarias")
            nodo.atributos.push(`operador: ${SIMBOLOS_UNA[campos.operador]}`);
        // el tipo solo es un dato del programa en estos nodos (en los demás se calcula al ejecutar)
        if (["Nativo", "Declaracion", "DeclaracionRecurso"].includes(clase))
            nodo.atributos.push(`tipo: ${(0, tipo_1.nombreTipo)(n.tipoDato)}`);
        for (const [campo, v] of Object.entries(campos)) {
            if (["linea", "columna", "tipoDato", "operador", "Operacion"].includes(campo) && !(campo === "operador" && !["Aritmeticas", "Relacionales", "Logicas", "Unarias"].includes(clase)))
                continue;
            const rol = ROLES[campo] ?? campo;
            if (v === null || v === undefined)
                continue;
            if (esNodo(v)) {
                visitar(v, nodo, rol);
            }
            else if (Array.isArray(v)) {
                v.forEach((x, i) => {
                    if (esNodo(x))
                        visitar(x, nodo, `${rol}[${i}]`);
                    else if (x && typeof x === "object" && "expresion" in x && "nombre" in x) { // propiedad de un recurso: { nombre, expresion }
                        const prop = nuevo("Property");
                        prop.atributos.push(`nombre: ${x.nombre}`);
                        if (esNodo(x.expresion))
                            prop.hijos.push({ rol: "valor", nodo: convertir(x.expresion) });
                        nodo.hijos.push({ rol: `propiedad[${i}]`, nodo: prop });
                    }
                    else if (x && typeof x === "object" && "tipo" in x && "id" in x)
                        nodo.atributos.push(`parámetro: ${(0, tipo_1.nombreTipo)(x.tipo)} ${x.id}`);
                });
            }
            else if (v instanceof tipo_1.default)
                nodo.atributos.push(`${campo === "tipoRetorno" ? "retorna" : campo}: ${(0, tipo_1.nombreTipo)(v)}`);
            else if (typeof v === "string")
                nodo.atributos.push(`${campo === "id" || campo === "propiedad" ? "nombre" : campo}: "${v.length > 40 ? v.slice(0, 37) + "..." : v}"`);
            else if (typeof v === "number" || typeof v === "boolean")
                nodo.atributos.push(`${campo}: ${v}`);
        }
        return nodo;
    };
    const raiz = nuevo("Program");
    for (const [i, ins] of instrucciones.entries())
        if (esNodo(ins))
            visitar(ins, raiz, `[${i}]`);
    return { arbol: raiz, truncado };
}
const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
/** Código DOT (Graphviz) del árbol. Se puede pegar en cualquier visor de Graphviz. */
function aDot(raiz, truncado = false) {
    const lineas = [
        "digraph AST {",
        '  rankdir=TB; node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11]; edge [fontname="Helvetica", fontsize=9, color="#5f6368"];',
    ];
    const rec = (n) => {
        const etiqueta = [n.tipo, ...n.atributos].map(esc).join("\\n");
        lineas.push(`  n${n.id} [label="${etiqueta}", fillcolor="${COLORES[n.tipo] ?? "#ffffff"}"];`);
        for (const h of n.hijos) {
            rec(h.nodo);
            lineas.push(`  n${n.id} -> n${h.nodo.id} [label="${esc(h.rol)}"];`);
        }
    };
    rec(raiz);
    if (truncado)
        lineas.push(`  aviso [label="(el árbol se recortó a ${MAX_NODOS} nodos)", shape=note, fillcolor="#fff3cd"];`);
    lineas.push("}");
    return lineas.join("\n");
}
