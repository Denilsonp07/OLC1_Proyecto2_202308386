import { Instruccion } from "../abstracto/instruccion"
import Errores from "../excepciones/errores"
import Arbol from "../simbolo/arbol"
import TablaSimbolo from "../simbolo/tablaSimbolo"
import Tipo, { tipoDato, esNumerico, nombreTipo, aTexto } from "../simbolo/tipo"

export enum OperadoresAritmeticos { SUMA, RESTA, MULT, DIV, MOD }
const SIMBOLO = ["+", "-", "*", "/", "%"]

// Tabla de la sección 26.1
export default class Aritmeticas extends Instruccion {
    constructor(private operador: OperadoresAritmeticos, private operando1: Instruccion,
                private operando2: Instruccion, linea: number, columna: number) {
        super(new Tipo(tipoDato.ENTERO), linea, columna)
    }

    private invalida(t1: Tipo, t2: Tipo) {
        return new Errores("Semántico",
            `Operación '${SIMBOLO[this.operador]}' no válida entre ${nombreTipo(t1)} y ${nombreTipo(t2)}`,
            this.linea, this.columna, "SEM-008")
    }

    interpretar(arbol: Arbol, tabla: TablaSimbolo) {
        const a = this.operando1.interpretar(arbol, tabla)
        if (a instanceof Errores) return a
        const t1 = this.operando1.tipoDato.clonar()
        const b = this.operando2.interpretar(arbol, tabla)
        if (b instanceof Errores) return b
        const t2 = this.operando2.tipoDato.clonar()
        const n1 = t1.getTipo(), n2 = t2.getTipo()

        // string + cualquier primitivo = concatenación
        if (this.operador === OperadoresAritmeticos.SUMA && n1 === tipoDato.CADENA) {
            if (!(esNumerico(n2) || n2 === tipoDato.CADENA || n2 === tipoDato.BOOLEAN)) return this.invalida(t1, t2)
            this.tipoDato = new Tipo(tipoDato.CADENA)
            return aTexto(a, t1) + aTexto(b, t2)
        }

        if (!esNumerico(n1) || !esNumerico(n2)) return this.invalida(t1, t2)
        const hayDecimal = n1 === tipoDato.DECIMAL || n2 === tipoDato.DECIMAL

        switch (this.operador) {
            case OperadoresAritmeticos.SUMA:
                this.tipoDato = new Tipo(hayDecimal ? tipoDato.DECIMAL : tipoDato.ENTERO); return a + b
            case OperadoresAritmeticos.RESTA:
                this.tipoDato = new Tipo(hayDecimal ? tipoDato.DECIMAL : tipoDato.ENTERO); return a - b
            case OperadoresAritmeticos.MULT:
                this.tipoDato = new Tipo(hayDecimal ? tipoDato.DECIMAL : tipoDato.ENTERO); return a * b
            case OperadoresAritmeticos.DIV:
                if (b === 0) return new Errores("Ejecución", "División entre cero", this.linea, this.columna, "EXE-001")
                this.tipoDato = new Tipo(tipoDato.DECIMAL); return a / b          // siempre float: 5/2 = 2.5
            case OperadoresAritmeticos.MOD:
                if (n1 !== tipoDato.ENTERO || n2 !== tipoDato.ENTERO) return this.invalida(t1, t2)   // % solo enteros
                if (b === 0) return new Errores("Ejecución", "Módulo entre cero", this.linea, this.columna, "EXE-001")
                this.tipoDato = new Tipo(tipoDato.ENTERO); return a % b
        }
    }
}