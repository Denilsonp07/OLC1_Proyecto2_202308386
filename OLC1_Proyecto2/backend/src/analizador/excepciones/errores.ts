export default class Errores {
    private tipoError: string
    private descripcion: string
    private linea: number
    private columna: number
    private codigo?: string

    constructor(tipoError: string, descripcion: string, linea: number, columna: number, codigo?: string) {
        this.tipoError = tipoError
        this.descripcion = descripcion
        this.linea = linea
        this.columna = columna
        this.codigo = codigo
    }
    public getTipoError(): string { return this.tipoError }
    public getDescripcion(): string { return this.descripcion }
    public getLinea(): number { return this.linea }
    public getColumna(): number { return this.columna }
    public getCodigo(): string | undefined { return this.codigo }

    // jison cuenta columnas desde 0; el enunciado muestra columnas desde 1
    public toJSON() {
        return { tipo: this.tipoError, codigo: this.codigo, descripcion: this.descripcion,
                 linea: this.linea, columna: this.columna + 1 }
    }
    public toString(): string {
        return `Error: ${this.tipoError} - ${this.descripcion} en la línea ${this.linea}, columna ${this.columna + 1}`
    }
}