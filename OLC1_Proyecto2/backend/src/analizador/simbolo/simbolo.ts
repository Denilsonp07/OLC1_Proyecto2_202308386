import Tipo from "./tipo";

export default class Simbolo{
    private tipo: Tipo
    private id: string
    private valor: any
    private categoria: string   // variable | parámetro | recurso | función | tarea 

    constructor(tipo:Tipo, id:string, valor?:any, categoria:string = "variable"){
        this.tipo=tipo
        this.id=id
        this.valor=valor
        this.categoria=categoria
    }
    public getTipo(): Tipo { return this.tipo; }
    public getId(): string { return this.id; }
    public getValor(): any { return this.valor; }
    public getCategoria(): string { return this.categoria; }
    public setTipo(tipo: Tipo): void { this.tipo = tipo; }
    public setId(id: string): void { this.id = id; }
    public setValor(valor: any): void { this.valor = valor; }
}