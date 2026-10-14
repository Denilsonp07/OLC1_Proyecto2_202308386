"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
class Server {
    //propiedades lectura y escritura
    cpu;
    memory;
    disk;
    os;
    // Propiedades de solo lectura (controladas por el interprete)
    _status;
    _packages;
    constructor(cpu, memory, disk, os) {
        this.cpu = cpu;
        this.memory = memory;
        this.disk = disk;
        this.os = os;
        this._status = "stopped"; // Un server inicia en estado stopped
        this._packages = [];
    }
    // Metodos para interactuar con la infraestructura de forma controlada
    get status() {
        return this._status;
    }
    get packages() {
        return [...this._packages];
    }
    toJSON() {
        return { cpu: this.cpu, memory: this.memory, disk: this.disk, os: this.os,
            status: this._status, packages: this.packages };
    }
    start() {
        if (this._status === "running") {
            return false; // Retorna false si ya estaba activo
        }
        this._status = "running";
        return true;
    }
    stop() {
        if (this._status === "stopped") {
            return false; // Retorna false si ya estaba detenido
        }
        this._status = "stopped";
        return true;
    }
    install(pkg) {
        if (this._status === "stopped") {
            // No se puede instalar software en un servidor detenido
            return false;
        }
        this._packages.push(pkg);
        return true;
    }
}
exports.Server = Server;
