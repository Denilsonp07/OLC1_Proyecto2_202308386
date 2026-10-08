
import Tipo from "./tipo";

export default class Simbolo{
    private tipo: Tipo
    private id: string
    private valor: any

    constructor(tipo:Tipo, id:string, valor?:any){
        this.tipo=tipo
        this.id=id
        this.valor=valor
    }
    public getTipo(): Tipo {
        return this.tipo;
    }
    public getId(): string {
        return this.id;
    }
    public getValor(): any {
        return this.valor;
    }
    public setTipo(tipo: Tipo): void {
        this.tipo = tipo;
    }
    public setId(id: string): void {
        this.id = id;
    }   
    public setValor(valor: any): void {
        this.valor = valor;
    }
}