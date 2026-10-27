"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVAS = void 0;
exports.cumple = cumple;
const errores_1 = __importDefault(require("../analizador/excepciones/errores"));
const tipo_1 = require("../analizador/simbolo/tipo");
const recursos_1 = require("./recursos");
function cumple(p, t) {
    switch (p) {
        case "any": return true;
        case "resource": return (0, tipo_1.esRecurso)(t.getTipo());
        case "server": return t.getTipo() === tipo_1.tipoDato.SERVER;
        case "service": return t.getTipo() === tipo_1.tipoDato.SERVICE;
        case "string": return t.getTipo() === tipo_1.tipoDato.CADENA;
        case "int": return t.getTipo() === tipo_1.tipoDato.ENTERO;
        case "array": return t.getTipo() === tipo_1.tipoDato.ARREGLO;
    }
}
const infra = (arbol, l, c, codigo, msg) => {
    arbol.agregarError(new errores_1.default("Infraestructura", msg, l, c, codigo));
    return false;
};
const aviso = (arbol, msg) => { arbol.log("WARN", msg); return false; };
const imprimir = (a, t, arbol) => {
    arbol.Print(a.map((v, i) => (0, tipo_1.aTexto)(v, t[i])).join(" "));
    return undefined;
};
exports.NATIVAS = {
    start: { params: ["resource"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([r], _t, arbol, l, c) => {
            if (r.status === "running")
                return aviso(arbol, `${r.nombre} ya se encuentra en ejecución (start no tiene efecto)`);
            if (r instanceof recursos_1.Service && r.status === "undeployed") {
                return infra(arbol, l, c, "INFRA-006", `No se puede iniciar '${r.nombre}': el servicio no ha sido desplegado`);
            }
            r.status = "running";
            arbol.log("OK", `${r.nombre} -> running`);
            return true;
        } },
    stop: { params: ["resource"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([r], _t, arbol) => {
            if (r.status !== "running")
                return aviso(arbol, `${r.nombre} no está en ejecución (stop no tiene efecto)`);
            r.status = "stopped";
            arbol.log("OK", `${r.nombre} -> stopped`);
            return true;
        } },
    restart: { params: ["resource"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([r], _t, arbol) => {
            if (r.status !== "running")
                return aviso(arbol, `${r.nombre} no está activo: no se puede reiniciar`);
            arbol.log("OK", `${r.nombre} restarted`);
            return true;
        } },
    install: { params: ["server", "string"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([s, pkg], _t, arbol, l, c) => {
            if (s.status !== "running")
                return infra(arbol, l, c, "INFRA-001", `No se puede instalar '${pkg}' en '${s.nombre}': el servidor está detenido`);
            if (s.packages.includes(pkg))
                return aviso(arbol, `${pkg} ya está instalado en ${s.nombre}`);
            s.packages.push(pkg);
            arbol.log("OK", `${pkg} installed on ${s.nombre}`);
            return true;
        } },
    uninstall: { params: ["server", "string"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([s, pkg], _t, arbol) => {
            if (!s.packages.includes(pkg))
                return aviso(arbol, `${pkg} no está instalado en ${s.nombre}`);
            s.packages = s.packages.filter(p => p !== pkg);
            arbol.log("OK", `${pkg} uninstalled from ${s.nombre}`);
            return true;
        } },
    deploy: { params: ["server", "service"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([s, svc], _t, arbol, l, c) => {
            // 1) validar TODO antes de modificar nada
            if (s.status !== "running")
                return infra(arbol, l, c, "INFRA-002", `No se puede desplegar '${svc.nombre}': el servidor '${s.nombre}' está detenido`);
            for (const d of svc.dependsOn) {
                if (d.status !== "running") {
                    return infra(arbol, l, c, "INFRA-004", `No se puede desplegar '${svc.nombre}'. Dependencia '${d.nombre}' se encuentra en estado ${d.status}.`);
                }
            }
            if (svc.status === "running")
                return aviso(arbol, `${svc.nombre} ya está desplegado en ${svc.host?.nombre}`);
            // 2) recién ahora se modifica el estado
            if (svc.host)
                svc.host.services = svc.host.services.filter(n => n !== svc.nombre);
            svc.host = s;
            svc.status = "running";
            s.services.push(svc.nombre);
            arbol.log("OK", `${svc.nombre} deployed on ${s.nombre}`);
            return true;
        } },
    scale: { params: ["service", "int"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([svc, n], _t, arbol, l, c) => {
            if (n < 1)
                return infra(arbol, l, c, "INFRA-005", `scale requiere al menos una réplica (recibió ${n})`);
            if (n === svc.replicas)
                return aviso(arbol, `${svc.nombre} ya tiene ${n} réplicas`);
            arbol.log("OK", `${svc.nombre} scaled from ${svc.replicas} to ${n} replicas`);
            svc.replicas = n;
            return true;
        } },
    connect: { params: ["resource", "resource"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([a, b], _t, arbol, l, c) => {
            if (a === b)
                return infra(arbol, l, c, "INFRA-007", `'${a.nombre}' no puede conectarse consigo mismo`);
            if (a.conexiones.has(b.nombre))
                return aviso(arbol, `${a.nombre} y ${b.nombre} ya están conectados`); // sin duplicados
            a.conexiones.add(b.nombre);
            b.conexiones.add(a.nombre);
            arbol.log("OK", `${a.nombre} connected to ${b.nombre}`);
            return true;
        } },
    disconnect: { params: ["resource", "resource"], retorno: tipo_1.tipoDato.BOOLEAN, ejecutar: ([a, b], _t, arbol) => {
            if (!a.conexiones.has(b.nombre))
                return aviso(arbol, `${a.nombre} y ${b.nombre} no estaban conectados`);
            a.conexiones.delete(b.nombre);
            b.conexiones.delete(a.nombre);
            arbol.log("OK", `${a.nombre} disconnected from ${b.nombre}`);
            return true;
        } },
    print: { params: [], variadic: true, retorno: tipo_1.tipoDato.VOID, ejecutar: imprimir },
    println: { params: [], variadic: true, retorno: tipo_1.tipoDato.VOID, ejecutar: imprimir },
    length: { params: ["array"], retorno: tipo_1.tipoDato.ENTERO, ejecutar: ([arr]) => arr.length },
    status: { params: ["resource"], retorno: tipo_1.tipoDato.CADENA, ejecutar: ([r]) => r.status },
};
