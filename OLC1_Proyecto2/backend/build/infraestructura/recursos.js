"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.Service = exports.Server = exports.Recurso = void 0;
/** Base de los tres recursos. 'status' solo lo modifican las funciones nativas. */
class Recurso {
    nombre;
    tipoRecurso;
    status;
    conexiones = new Set(); // nombres de los recursos conectados
    constructor(nombre, tipoRecurso, status) {
        this.nombre = nombre;
        this.tipoRecurso = tipoRecurso;
        this.status = status;
    }
    // Estado serializable para el reporte de infraestructura (sección 17.5)
    toJSON() {
        return { name: this.nombre, ...this.propiedades(), connections: [...this.conexiones] };
    }
}
exports.Recurso = Recurso;
class Server extends Recurso {
    cpu;
    memory;
    disk;
    os;
    packages = [];
    services = []; // servicios desplegados en este servidor
    constructor(nombre, cpu, memory, disk, os) {
        super(nombre, "server", "stopped"); // un server inicia en stopped (sección 9.1)
        this.cpu = cpu;
        this.memory = memory;
        this.disk = disk;
        this.os = os;
    }
    propiedades() {
        return { cpu: this.cpu, memory: this.memory, disk: this.disk, os: this.os,
            status: this.status, packages: [...this.packages], services: [...this.services] };
    }
}
exports.Server = Server;
class Service extends Recurso {
    port;
    replicas;
    dependsOn;
    host = null;
    constructor(nombre, port, replicas, dependsOn) {
        super(nombre, "service", "undeployed"); // estados de service: undeployed, running, stopped... (27.4)
        this.port = port;
        this.replicas = replicas;
        this.dependsOn = dependsOn;
    }
    propiedades() {
        return { port: this.port, replicas: this.replicas, status: this.status,
            host: this.host ? this.host.nombre : null, dependsOn: this.dependsOn.map(d => d.nombre) };
    }
}
exports.Service = Service;
class Database extends Recurso {
    engine;
    version;
    port;
    dependsOn;
    constructor(nombre, engine, version, port, dependsOn) {
        super(nombre, "database", "stopped");
        this.engine = engine;
        this.version = version;
        this.port = port;
        this.dependsOn = dependsOn;
    }
    propiedades() {
        return { engine: this.engine, version: this.version, port: this.port, status: this.status,
            dependsOn: this.dependsOn.map(d => d.nombre) };
    }
}
exports.Database = Database;
