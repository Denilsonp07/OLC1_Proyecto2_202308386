
export class Server {
    //propiedades lectura y escritura

    public cpu: number;
    public memory: number;
    public disk: number;
    public os: string;


    // Propiedades de solo lectura (controladas por el interprete)
    private _status: string; 
    private _packages: string[];

    constructor(cpu: number, memory: number, disk: number, os: string) {
        this.cpu = cpu;
        this.memory = memory;
        this.disk = disk;
        this.os = os;
        this._status = "stopped"; // Un server inicia en estado stopped
        this._packages = [];
    }

    // Metodos para interactuar con la infraestructura de forma controlada
    public get status(): string {
        return this._status;
    }

    public get packages(): string[] {
        return [...this._packages];
    }


    public toJSON() {
        return { cpu: this.cpu, memory: this.memory, disk: this.disk, os: this.os,
                 status: this._status, packages: this.packages };
    }


    public start(): boolean {
        if (this._status === "running") {
            return false; // Retorna false si ya estaba activo
        }
        this._status = "running";
        return true;
    }

    public stop(): boolean {
        if (this._status === "stopped") {
            return false; // Retorna false si ya estaba detenido
        }
        this._status = "stopped";
        return true;
    }

    public install(pkg: string): boolean {
        if (this._status === "stopped") {
            // No se puede instalar software en un servidor detenido
            return false; 
        }
        this._packages.push(pkg);
        return true;
    }


}