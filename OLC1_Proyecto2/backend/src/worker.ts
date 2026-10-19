

import { parentPort, workerData } from 'worker_threads';
import { procesar } from './procesar';

// Este archivo corre en un hilo aparte (ver index.ts): recibe el código y devuelve el resultado.
parentPort!.postMessage(procesar(workerData.source, workerData.limites));