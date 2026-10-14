
import Simbolo from "./simbolo";

export default class TablaSimbolo{
    private tablaActual: Map<string,Simbolo>
    private nombreDato:string
    
    private padre: TablaSimbolo | null   // null = ámbito global

    constructor(padre: TablaSimbolo | null = null){
        this.tablaActual= new Map<string,Simbolo>()
        this.nombreDato=""
        this.padre = padre
    }


     public crearHijo(): TablaSimbolo {
        return new TablaSimbolo(this)
    }

        public getTabla(): Map<string, Simbolo> {
        return this.tablaActual;
    }
        public setTabla(tabla: Map<string, Simbolo>): void {
        this.tablaActual = tabla;
    }
        public getNombreDato(): string {
        return this.nombreDato;
    }
    public setNombreDato(nombreDato: string): void {
        this.nombreDato = nombreDato;
    }


    public setVariable(simbolo: Simbolo): boolean {
        if (this.tablaActual.has(simbolo.getId())) {
            return false;
        }
        this.tablaActual.set(simbolo.getId(), simbolo);
        return true;
    }

    public getVariable(id:string): Simbolo | undefined {
        const local = this.tablaActual.get(id)
        if(local !== undefined) return local
        return this.padre ? this.padre.getVariable(id) : undefined
    }
}