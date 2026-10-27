


import Simbolo from "./simbolo";

/** Una entrada del reporte de la tabla de símbolos: el símbolo y el ámbito donde se declaró. */
export interface EntradaRegistro { ambito: string; simbolo: Simbolo }

export default class TablaSimbolo{
    private tablaActual: Map<string,Simbolo>
    private nombreDato:string
    private padre: TablaSimbolo | null   // ámbito que contiene a este (null = global)
    private ruta: string                 // nombre del ámbito para el reporte: global, main, canDeploy, main > for > cuerpo...
    // Registro de TODOS los símbolos declarados, de todos los ámbitos. Lo comparten padre e hijos para que,
    // al terminar un ámbito local, sus símbolos sigan apareciendo en el reporte (sección 17.3).
    private registro: Map<string, EntradaRegistro>

    constructor(padre: TablaSimbolo | null = null, nombre: string = "global"){
        this.tablaActual= new Map<string,Simbolo>()
        this.nombreDato=""
        this.padre = padre
        this.ruta = padre === null || padre.padre === null ? nombre : `${padre.ruta} > ${nombre}`
        this.registro = padre ? padre.registro : new Map<string, EntradaRegistro>()
    }

    public crearHijo(nombre: string = "bloque"): TablaSimbolo {
        return new TablaSimbolo(this, nombre)
    }
    public getTabla(): Map<string, Simbolo> { return this.tablaActual; }
    public setTabla(tabla: Map<string, Simbolo>): void { this.tablaActual = tabla; }
    public getNombreDato(): string { return this.nombreDato; }
    public setNombreDato(nombreDato: string): void { this.nombreDato = nombreDato; }
    public getRuta(): string { return this.ruta; }
    public getRegistro(): EntradaRegistro[] { return [...this.registro.values()]; }

    public setVariable(simbolo: Simbolo): boolean {
        if (this.tablaActual.has(simbolo.getId())) {
            return false;
        }
        this.tablaActual.set(simbolo.getId(), simbolo);
        // Una misma línea ejecutada muchas veces (ciclo, función llamada n veces) comparte la clave:
        // queda UNA entrada por ámbito+nombre, con el último valor.
        if (this.registro.size < 5000) this.registro.set(`${this.ruta}|${simbolo.getId()}`, { ambito: this.ruta, simbolo });
        return true;
    }

    // sube por la cadena de ámbitos: local -> ... -> global
    public getVariable(id:string): Simbolo | undefined {
        const local = this.tablaActual.get(id)
        if(local !== undefined) return local
        return this.padre ? this.padre.getVariable(id) : undefined
    }
}