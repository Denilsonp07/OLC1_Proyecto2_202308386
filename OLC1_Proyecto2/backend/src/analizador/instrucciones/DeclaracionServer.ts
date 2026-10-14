

import { Instruccion } from "../abstracto/instruccion";
import Errores from "../excepciones/errores";
import Arbol from "../simbolo/arbol";
import Simbolo from "../simbolo/simbolo";
import TablaSimbolo from "../simbolo/tablaSimbolo";
import Tipo, { tipoDato } from "../simbolo/tipo";
import { Server } from "../../infraestructura/Server";


export default class DeclaracionServer extends Instruccion {
    private id: string;
    private propiedades: Array<{ id: string; valor: Instruccion; linea?: number; columna?: number; col?: number }>;

    constructor(
        id: string,
        propiedades: Array<{ id: string; valor: Instruccion; linea?: number; columna?: number; col?: number }>,
        linea: number,
        columna: number
    ) {
        super(new Tipo(tipoDato.VOID), linea, columna);
        this.id = id;
        this.propiedades = propiedades;
    }

    public interpretar(arbol: Arbol, entorno: TablaSimbolo): Errores | null {
        // Valores por defecto o variables temporales
        let cpu: number | null = null;
        let memory: number | null = null;
        let disk: number | null = null;
        let os: string | null = null;

        // 1. Recorrer y evaluar cada propiedad
        for (const prop of this.propiedades) {
            // Evaluamos la expresión hija (Ej: 2 + 2)
            const valorEvaluado = prop.valor.interpretar(arbol, entorno);
            if (valorEvaluado instanceof Errores) {
                return valorEvaluado;
            }

            const linea = prop.linea ?? this.linea;
            const columna = prop.columna ?? prop.col ?? this.columna;
            
            // 2. Validación semántica de nombres y tipos
            switch (prop.id) {
                case "cpu":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new Errores("Semántico", "CPU debe ser un entero > 0", linea, columna);
                    }
                    cpu = valorEvaluado;
                    break;
                case "memory":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new Errores("Semántico", "Memory debe ser un entero > 0", linea, columna);
                    }
                    memory = valorEvaluado;
                    break;
                case "disk":
                    if (typeof valorEvaluado !== "number" || !Number.isInteger(valorEvaluado) || valorEvaluado <= 0) {
                        return new Errores("Semántico", "Disk debe ser un entero > 0", linea, columna);
                    }
                    disk = valorEvaluado;
                    break;
                case "os":
                    if (typeof valorEvaluado !== "string" || valorEvaluado === "") {
                        return new Errores("Semántico", "OS no puede estar vacío", linea, columna);
                    }
                    os = valorEvaluado;
                    break;
                default:
                    // Si viene una propiedad inventada (ej. `cores = 4;`)
                    return new Errores("Semántico", `La propiedad '${prop.id}' no existe en server`, linea, columna);
            }
        }

        // 3. Validar que no falten propiedades obligatorias
        if (cpu === null || memory === null || disk === null || os === null) {
            return new Errores(
                "Semántico",
                `Faltan propiedades obligatorias en el servidor '${this.id}'`,
                this.linea,
                this.columna
            );
        }

        // 4. Instanciar la clase de infraestructura y guardarla en la tabla de símbolos
        const nuevoServidor = new Server(cpu, memory, disk, os);
        
        // Verifica que el ID no exista previamente en este ámbito[cite: 15]
        const guardado = entorno.setVariable(new Simbolo(new Tipo(tipoDato.SERVER), this.id, nuevoServidor));
        if (!guardado) {
            return new Errores(
                "Semántico",
                `El identificador '${this.id}' ya fue declarado`,
                this.linea,
                this.columna
            );
        }
        return null;
    }
}