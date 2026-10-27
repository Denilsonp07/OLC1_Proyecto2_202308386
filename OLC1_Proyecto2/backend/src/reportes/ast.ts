import { Instruccion } from "../analizador/abstracto/instruccion"
import Tipo, { nombreTipo } from "../analizador/simbolo/tipo"
import { OperadoresAritmeticos } from "../analizador/expresiones/aritmeticas"
import { Op_relacionales } from "../analizador/expresiones/relacionales"
import { OperadoresLogicos } from "../analizador/expresiones/logicas"
import { OperadoresUnarios } from "../analizador/expresiones/unarias"

/**
 * Reporte del AST: tipo de nodo y valores relevantes, como árbol JSON y como
 * código DOT de Graphviz. El árbol se arma por REFLEXIÓN sobre los nodos del intérprete:
 * cualquier propiedad que sea un nodo (o una lista de nodos) es un hijo; el resto son atributos.
 * Así, un nodo nuevo aparece en el reporte sin escribir código adicional.
 */
export interface NodoAST {
    id: number
    tipo: string                         // BinaryExpression, IfInstruction...
    atributos: string[]                  // "id: backend", "valor: 40"...
    hijos: { rol: string; nodo: NodoAST }[]
}

const SIMBOLOS_ARIT = ["+", "-", "*", "/", "%"]
const SIMBOLOS_REL = ["==", "!=", "<", "<=", ">", ">="]
const SIMBOLOS_LOG = ["&&", "||"]
const SIMBOLOS_UNA = ["-", "!"]

// nombre de la clase -> nombre que se muestra 
const NOMBRES: Record<string, string> = {
    Nativo: "LiteralExpression", AccesoVar: "IdentifierExpression", Aritmeticas: "BinaryExpression",
    Relacionales: "BinaryExpression", Logicas: "LogicalExpression", Unarias: "UnaryExpression",
    Llamada: "CallExpression", AccesoPropiedad: "PropertyAccessExpression", AccesoIndice: "IndexExpression",
    Arreglo: "ArrayExpression", Declaracion: "VariableDeclaration", DeclaracionRecurso: "ResourceDeclaration",
    AsignacionVar: "Assignment", AsignacionPropiedad: "PropertyAssignment", CondicionalIf: "IfInstruction",
    Mientras: "WhileInstruction", Para: "ForInstruction", Romper: "BreakInstruction", Continuar: "ContinueInstruction",
    Retorno: "ReturnInstruction", DeclaracionFuncion: "FunctionDeclaration", DeclaracionTask: "TaskDeclaration",
    RunTask: "RunInstruction", Main: "MainBlock",
}
// nombre del campo -> etiqueta de la arista
const ROLES: Record<string, string> = {
    operando1: "izq", operando2: "der", operador1: "izq", operador2: "der", op1: "izq", op2: "der",
    operando: "operando", condicion: "condición", instruccionesIf: "then", instruccionesElse: "else",
    cuerpo: "cuerpo", inicio: "inicio", incremento: "incremento", expresion: "valor", valor: "valor",
    base: "objetivo", indice: "índice", args: "arg", elementos: "elemento",
}
const COLORES: Record<string, string> = {
    LiteralExpression: "#e8f0fe", IdentifierExpression: "#e8f0fe", BinaryExpression: "#d2e3fc", LogicalExpression: "#d2e3fc",
    UnaryExpression: "#d2e3fc", CallExpression: "#fce8b2", PropertyAccessExpression: "#e8f0fe", IndexExpression: "#e8f0fe",
    ArrayExpression: "#e8f0fe", VariableDeclaration: "#ceead6", ResourceDeclaration: "#ceead6", FunctionDeclaration: "#ceead6",
    TaskDeclaration: "#ceead6", MainBlock: "#f6aea9", IfInstruction: "#fde293", WhileInstruction: "#fde293",
    ForInstruction: "#fde293", RunInstruction: "#fce8b2", Program: "#dadce0",
}
const MAX_NODOS = 3000

const esNodo = (v: any): v is Instruccion => v instanceof Instruccion

export function construirAST(instrucciones: Instruccion[]): { arbol: NodoAST; truncado: boolean } {
    let contador = 0
    let truncado = false

    const nuevo = (tipo: string): NodoAST => ({ id: ++contador, tipo, atributos: [], hijos: [] })

    const visitar = (n: any, nodoPadre: NodoAST, rol: string) => {
        if (contador >= MAX_NODOS) { truncado = true; return }
        nodoPadre.hijos.push({ rol, nodo: convertir(n) })
    }

    const convertir = (n: Instruccion): NodoAST => {
        const clase = n.constructor.name
        const nodo = nuevo(NOMBRES[clase] ?? clase)
        const campos = n as any

        // el operador se guarda como número de un enum: se traduce a su símbolo
        if (clase === "Aritmeticas") nodo.atributos.push(`operador: ${SIMBOLOS_ARIT[campos.operador]}`)
        else if (clase === "Relacionales") nodo.atributos.push(`operador: ${SIMBOLOS_REL[campos.Operacion]}`)
        else if (clase === "Logicas") nodo.atributos.push(`operador: ${SIMBOLOS_LOG[campos.operador]}`)
        else if (clase === "Unarias") nodo.atributos.push(`operador: ${SIMBOLOS_UNA[campos.operador]}`)
        // el tipo solo es un dato del programa en estos nodos (en los demás se calcula al ejecutar)
        if (["Nativo", "Declaracion", "DeclaracionRecurso"].includes(clase)) nodo.atributos.push(`tipo: ${nombreTipo(n.tipoDato)}`)

        for (const [campo, v] of Object.entries(campos)) {
            if (["linea", "columna", "tipoDato", "operador", "Operacion"].includes(campo) && !(campo === "operador" && !["Aritmeticas", "Relacionales", "Logicas", "Unarias"].includes(clase))) continue
            const rol = ROLES[campo] ?? campo
            if (v === null || v === undefined) continue
            if (esNodo(v)) { visitar(v, nodo, rol) }
            else if (Array.isArray(v)) {
                v.forEach((x: any, i: number) => {
                    if (esNodo(x)) visitar(x, nodo, `${rol}[${i}]`)
                    else if (x && typeof x === "object" && "expresion" in x && "nombre" in x) {   // propiedad de un recurso: { nombre, expresion }
                        const prop = nuevo("Property"); prop.atributos.push(`nombre: ${x.nombre}`)
                        if (esNodo(x.expresion)) prop.hijos.push({ rol: "valor", nodo: convertir(x.expresion) })
                        nodo.hijos.push({ rol: `propiedad[${i}]`, nodo: prop })
                    }
                    else if (x && typeof x === "object" && "tipo" in x && "id" in x) nodo.atributos.push(`parámetro: ${nombreTipo(x.tipo)} ${x.id}`)
                })
            }
            else if (v instanceof Tipo) nodo.atributos.push(`${campo === "tipoRetorno" ? "retorna" : campo}: ${nombreTipo(v)}`)
            else if (typeof v === "string") nodo.atributos.push(`${campo === "id" || campo === "propiedad" ? "nombre" : campo}: "${v.length > 40 ? v.slice(0, 37) + "..." : v}"`)
            else if (typeof v === "number" || typeof v === "boolean") nodo.atributos.push(`${campo}: ${v}`)
        }
        return nodo
    }

    const raiz = nuevo("Program")
    for (const [i, ins] of instrucciones.entries()) if (esNodo(ins)) visitar(ins, raiz, `[${i}]`)
    return { arbol: raiz, truncado }
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")

/** Código DOT (Graphviz) del árbol. Se puede pegar en cualquier visor de Graphviz. */
export function aDot(raiz: NodoAST, truncado = false): string {
    const lineas: string[] = [
        "digraph AST {",
        '  rankdir=TB; node [shape=box, style="rounded,filled", fontname="Helvetica", fontsize=11]; edge [fontname="Helvetica", fontsize=9, color="#5f6368"];',
    ]
    const rec = (n: NodoAST) => {
        const etiqueta = [n.tipo, ...n.atributos].map(esc).join("\\n")
        lineas.push(`  n${n.id} [label="${etiqueta}", fillcolor="${COLORES[n.tipo] ?? "#ffffff"}"];`)
        for (const h of n.hijos) {
            rec(h.nodo)
            lineas.push(`  n${n.id} -> n${h.nodo.id} [label="${esc(h.rol)}"];`)
        }
    }
    rec(raiz)
    if (truncado) lineas.push(`  aviso [label="(el árbol se recortó a ${MAX_NODOS} nodos)", shape=note, fillcolor="#fff3cd"];`)
    lineas.push("}")
    return lineas.join("\n")
}