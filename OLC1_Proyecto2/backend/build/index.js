"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Importamos las clases 
const arbol_1 = __importDefault(require("./analizador/simbolo/arbol"));
const tablaSimbolo_1 = __importDefault(require("./analizador/simbolo/tablaSimbolo"));
// Importamos el analizador generado por Jison. 
// Usamos 'require' porque Jison genera JavaScript puro (CommonJS)
const parser = require('./analizador/analizador.js');
const app = (0, express_1.default)();
const PORT = 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: "El backend del compilador está funcionando." });
});
app.post('/api/execute', (req, res) => {
    const { source } = req.body;
    if (!source) {
        return res.status(400).json({ success: false, message: "No se proporcionó código fuente" });
    }
    try {
        // 1. Análisis Léxico y Sintáctico
        // Jison procesa el texto y retorna un arreglo con las instrucciones (el AST)[cite: 14, 16]
        const ast = parser.parse(source);
        // 2. Inicialización del Entorno y Estado Global
        const entornoGlobal = new tablaSimbolo_1.default(); // Entorno raíz (no tiene padre)[cite: 1]
        const arbol = new arbol_1.default(ast);
        // 3. Primer recorrido: Registrar recursos, funciones y tareas globales[cite: 16]
        // (Por ahora recorreremos todo el AST, luego separaremos el main)
        for (let instruccion of ast) {
            instruccion.interpretar(entornoGlobal, arbol);
        }
        // 4. Retornar la respuesta con el formato exacto requerido por el frontend[cite: 25]
        res.json({
            success: true,
            console: arbol.getConsola() ? arbol.getConsola().split('\n') : [],
            errors: arbol.getErrores(), // Lista de errores léxicos, sintácticos y semánticos
            symbols: [], // Aquí mapearemos la tabla de símbolos después
            infrastructure: {
                servers: [], // Aquí extraeremos los recursos del entornoGlobal
                services: [],
                databases: []
            }
        });
    }
    catch (error) {
        // Captura de errores irrecuperables (ej. error sintáctico fatal de Jison)
        console.error("Error durante la compilación:", error);
        res.json({
            success: false,
            console: [],
            errors: [
                {
                    tipo: "Sintáctico",
                    codigo: "SYN-001",
                    descripcion: error.message || "Error irrecuperable en el parser",
                    linea: error.hash?.loc?.first_line || 0,
                    columna: error.hash?.loc?.first_column || 0
                }
            ],
            infrastructure: { servers: [], services: [], databases: [] }
        });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor AutoInfra corriendo en http://localhost:${PORT}`);
});
