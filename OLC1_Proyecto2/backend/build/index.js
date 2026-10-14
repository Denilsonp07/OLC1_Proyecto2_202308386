"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const arbol_1 = __importDefault(require("./analizador/simbolo/arbol"));
const errores_1 = __importDefault(require("./analizador/excepciones/errores"));
const tipo_1 = require("./analizador/simbolo/tipo");
const Server_1 = require("./infraestructura/Server");
// Jison genera JavaScript puro (CommonJS), por eso require.
const parser = require('./analizador/analizador.js');
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 8081;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: "El backend del compilador está funcionando." });
});
const infraVacia = () => ({ servers: [], services: [], databases: [] });
app.post('/api/execute', (req, res) => {
    // Express 5: req.body es undefined si no llegó JSON
    const source = req.body?.source;
    if (typeof source !== 'string') {
        return res.status(400).json({ success: false, message: "El campo 'source' (string) es obligatorio" });
    }
    // ---- 1. Léxico + sintáctico (Jison LANZA excepción si falla) ----
    let ast;
    try {
        ast = parser.parse(source);
    }
    catch (error) {
        const msg = error.message || "Error en el parser";
        const hash = error.hash ?? {};
        return res.json({
            success: false, console: [], symbols: [], tokens: [], infrastructure: infraVacia(),
            errors: [{
                    tipo: msg.startsWith("Lexical error") ? "Léxico" : "Sintáctico",
                    descripcion: msg,
                    linea: hash.loc?.first_line ?? (typeof hash.line === 'number' ? hash.line + 1 : 0),
                    columna: hash.loc?.first_column ?? 0
                }]
        });
    }
    // ---- 2. Ejecución (try/catch aparte) ----
    const arbol = new arbol_1.default(ast);
    const entornoGlobal = arbol.getTablaGlobal(); // una sola tabla global: la del árbol
    const errores = arbol.getErrores();
    try {
        for (const instruccion of ast) {
            const resultado = instruccion.interpretar(arbol, entornoGlobal);
            if (resultado instanceof errores_1.default)
                errores.push(resultado); // ANTES se descartaba
        }
    }
    catch (error) {
        errores.push(new errores_1.default("Ejecución", `Error interno del intérprete: ${error.message}`, 0, 0));
    }
    // ---- 3. Respuesta ----
    const symbols = [];
    const infrastructure = infraVacia();
    for (const [id, simbolo] of entornoGlobal.getTabla()) {
        const valor = simbolo.getValor();
        if (valor instanceof Server_1.Server) {
            infrastructure.servers.push({ name: id, ...valor.toJSON() });
            symbols.push({ identificador: id, tipo: "SERVER", valor: valor.status });
        }
        else {
            symbols.push({ identificador: id, tipo: tipo_1.tipoDato[simbolo.getTipo().getTipo()], valor });
        }
    }
    const consola = arbol.getConsola();
    res.json({
        success: errores.length === 0,
        console: consola === "" ? [] : consola.replace(/\n$/, "").split("\n"),
        errors: errores,
        symbols,
        tokens: [],
        infrastructure
    });
});
app.listen(PORT, () => {
    console.log(`Servidor AutoInfra corriendo en http://localhost:${PORT}`);
});
