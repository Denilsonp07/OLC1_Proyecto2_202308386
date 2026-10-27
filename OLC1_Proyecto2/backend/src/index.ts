

import express from 'express';
import cors from 'cors';
import path from 'path';
import { Worker } from 'worker_threads';
import { infraVacia, Limites } from './procesar';

const app = express();
const PORT = Number(process.env.PORT) || 8081;

// Límites de seguridad configurables (secciones 7.5 y 8.3 del enunciado)
const LIMITES: Limites = {
    maxInstrucciones: Number(process.env.MAX_INSTRUCCIONES) || 100000,
    maxProfundidad: Number(process.env.MAX_PROFUNDIDAD) || 1000,
};
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS) || 20000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ success: true, message: "El backend del compilador está funcionando." });
});

/**
 * Ejecuta el análisis en un HILO APARTE (worker) por dos razones:
 *  1. La pila de Node (~1 MB) no alcanza para 1000 niveles de recursión del lenguaje: cada llamada
 *     usa varios marcos de JavaScript. El worker se crea con 64 MB de pila.
 *  2. Un tiempo máximo: si algo se cuelga, se termina el hilo y el servidor sigue vivo.
 */
function ejecutarEnWorker(source: string, ejecutar: boolean): Promise<any> {
    return new Promise((resolve) => {
        const fallo = (descripcion: string, codigo: string) => resolve({
            success: false, console: [], symbols: [], tokens: [], infrastructure: infraVacia(),
            errors: [{ tipo: "Ejecución", codigo, descripcion, linea: 0, columna: 1 }]
        });

        const worker = new Worker(path.join(__dirname, 'worker.js'), {
            workerData: { source, limites: LIMITES, ejecutar },
            resourceLimits: { stackSizeMb: 64, maxOldGenerationSizeMb: 512 },
        });
        const timer = setTimeout(() => {
            worker.terminate();
            fallo(`La ejecución superó el tiempo máximo de ${TIMEOUT_MS} ms`, "EXE-006");
        }, TIMEOUT_MS);

        worker.once('message', (resultado) => { clearTimeout(timer); resolve(resultado); });
        worker.once('error', (e: Error) => { clearTimeout(timer); fallo(`Error interno del intérprete: ${e.message}`, "EXE-000"); });
    });
}

// Endpoints de la sección 24.4. Todos reciben { "source": "..." } y devuelven JSON.
//   execute  -> análisis completo + ejecución (todo el resultado)
//   analyze  -> léxico + sintáctico (+ AST) SIN ejecutar
//   tokens / ast / symbols / errors -> solo esa parte del resultado
const ENDPOINTS: Record<string, { ejecutar: boolean; campos?: string[] }> = {
    execute: { ejecutar: true },
    analyze: { ejecutar: false },
    tokens:  { ejecutar: false, campos: ['success', 'tokens', 'errors'] },
    ast:     { ejecutar: false, campos: ['success', 'ast', 'errors'] },
    symbols: { ejecutar: true,  campos: ['success', 'symbols', 'errors'] },
    errors:  { ejecutar: true,  campos: ['success', 'errors'] },
};

for (const [nombre, cfg] of Object.entries(ENDPOINTS)) {
    app.post(`/api/${nombre}`, async (req, res) => {
        // Express 5: req.body es undefined si no llegó JSON
        const source = req.body?.source;
        if (typeof source !== 'string') {
            return res.status(400).json({ success: false, message: "El campo 'source' (string) es obligatorio" });
        }
        const resultado = await ejecutarEnWorker(source, cfg.ejecutar);
        if (!cfg.campos) return res.json(resultado);
        res.json(Object.fromEntries(cfg.campos.map(c => [c, resultado[c]])));
    });
}

app.listen(PORT, () => {
    console.log(`Servidor AutoInfra corriendo en http://localhost:${PORT}`);
});