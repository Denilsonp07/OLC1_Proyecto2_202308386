import express from 'express';
import cors from 'cors';

import Arbol from './analizador/simbolo/arbol';
import Errores from './analizador/excepciones/errores';
import { tipoDato } from './analizador/simbolo/tipo';
import { Server } from './infraestructura/Server';

// Jison genera JavaScript puro (CommonJS), por eso require.
const parser = require('./analizador/analizador.js');

const app = express();
const PORT = Number(process.env.PORT) || 8081;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: "El backend del compilador está funcionando." });
});

const infraVacia = () => ({ servers: [] as any[], services: [] as any[], databases: [] as any[] });

app.post('/api/execute', (req, res) => {
    // Express 5: req.body es undefined si no llegó JSON
    const source = req.body?.source;
    if (typeof source !== 'string') {
        return res.status(400).json({ success: false, message: "El campo 'source' (string) es obligatorio" });
    }

    // ---- 1. Léxico + sintáctico (Jison LANZA excepción si falla) ----
    let ast: any[];
    try {
        ast = parser.parse(source);
    } catch (error: any) {
        const msg: string = error.message || "Error en el parser";
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
    const arbol = new Arbol(ast);
    const entornoGlobal = arbol.getTablaGlobal();   // una sola tabla global: la del árbol
    const errores = arbol.getErrores();

    try {
        for (const instruccion of ast) {
            const resultado = instruccion.interpretar(arbol, entornoGlobal);
            if (resultado instanceof Errores) errores.push(resultado);   // ANTES se descartaba
        }
    } catch (error: any) {
        errores.push(new Errores("Ejecución", `Error interno del intérprete: ${error.message}`, 0, 0));
    }

    // ---- 3. Respuesta ----
    const symbols: any[] = [];
    const infrastructure = infraVacia();
    for (const [id, simbolo] of entornoGlobal.getTabla()) {
        const valor = simbolo.getValor();
        if (valor instanceof Server) {
            infrastructure.servers.push({ name: id, ...valor.toJSON() });
            symbols.push({ identificador: id, tipo: "SERVER", valor: valor.status });
        } else {
            symbols.push({ identificador: id, tipo: tipoDato[simbolo.getTipo().getTipo()], valor });
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