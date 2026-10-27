"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const procesar_1 = require("./procesar");
// Este archivo corre en un hilo aparte (ver index.ts): recibe el código y devuelve el resultado.
worker_threads_1.parentPort.postMessage((0, procesar_1.procesar)(worker_threads_1.workerData.source, worker_threads_1.workerData.limites, worker_threads_1.workerData.ejecutar));
