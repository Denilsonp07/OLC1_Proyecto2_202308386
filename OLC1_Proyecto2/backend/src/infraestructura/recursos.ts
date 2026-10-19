

export type TipoRecurso = "server" | "service" | "database"


/** Base de los tres recursos. 'status' solo lo modifican las funciones nativas. */
export abstract class Recurso {
    public status: string
    public conexiones: Set<string> = new Set()    // nombres de los recursos conectados

    constructor(public nombre: string, public tipoRecurso: TipoRecurso, status: string) {
        this.status = status
    }
    abstract propiedades(): Record<string, any>

    // Estado serializable para el reporte de infraestructura (sección 17.5)
    public toJSON() {
        return { name: this.nombre, ...this.propiedades(), connections: [...this.conexiones] }
    }
}

export class Server extends Recurso {
    public packages: string[] = []
    public services: string[] = []    // servicios desplegados en este servidor

    constructor(nombre: string, public cpu: number, public memory: number, public disk: number, public os: string) {
        super(nombre, "server", "stopped")       // un server inicia en stopped (sección 9.1)
    }
    propiedades() {
        return { cpu: this.cpu, memory: this.memory, disk: this.disk, os: this.os,
                 status: this.status, packages: [...this.packages], services: [...this.services] }
    }
}

export class Service extends Recurso {
    public host: Server | null = null

    constructor(nombre: string, public port: number, public replicas: number, public dependsOn: Recurso[]) {
        super(nombre, "service", "undeployed")   // estados de service: undeployed, running, stopped... (27.4)
    }
    propiedades() {
        return { port: this.port, replicas: this.replicas, status: this.status,
                 host: this.host ? this.host.nombre : null, dependsOn: this.dependsOn.map(d => d.nombre) }
    }
}

export class Database extends Recurso {
    constructor(nombre: string, public engine: string, public version: string, public port: number, public dependsOn: Recurso[]) {
        super(nombre, "database", "stopped")
    }
    propiedades() {
        return { engine: this.engine, version: this.version, port: this.port, status: this.status,
                 dependsOn: this.dependsOn.map(d => d.nombre) }
    }
}