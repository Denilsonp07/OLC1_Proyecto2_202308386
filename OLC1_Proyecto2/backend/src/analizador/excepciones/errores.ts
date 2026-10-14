
export default class Errores{
    private tipoError: string
    private descripcion : string
    private linea: number
    private columna: number

    constructor(tipoError: string, descripcion : string, linea: number ,columna: number) {
        this.tipoError= tipoError
        this.descripcion=descripcion
        this.linea=linea
        this.columna=columna
    }
    public getTipoError(): string {
        return this.tipoError;
    }
    public getDescripcion(): string {
        return this.descripcion;
    }
    public getLinea(): number {
        return this.linea;
    }
    public getColumna(): number {
        return this.columna;
    }
    public setTipoError(tipoError: string): void {
        this.tipoError = tipoError;
    }
    public setDescripcion(descripcion: string): void {
        this.descripcion = descripcion;
    }   
    public setLinea(linea: number): void {
        this.linea = linea;
    }
    public setColumna(columna: number): void {
        this.columna = columna;
    }
    public toString(): string {
        return `Error: ${this.tipoError} - ${this.descripcion} en la línea ${this.linea}, columna ${this.columna}`;
    }

    public toJSON() {
        return { tipo: this.tipoError, descripcion: this.descripcion, linea: this.linea, columna: this.columna }
    }

}