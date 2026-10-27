"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Errores {
    tipoError;
    descripcion;
    linea;
    columna;
    codigo;
    constructor(tipoError, descripcion, linea, columna, codigo) {
        this.tipoError = tipoError;
        this.descripcion = descripcion;
        this.linea = linea;
        this.columna = columna;
        this.codigo = codigo;
    }
    getTipoError() { return this.tipoError; }
    getDescripcion() { return this.descripcion; }
    getLinea() { return this.linea; }
    getColumna() { return this.columna; }
    getCodigo() { return this.codigo; }
    // jison cuenta columnas desde 0; el enunciado muestra columnas desde 1
    toJSON() {
        return { tipo: this.tipoError, codigo: this.codigo, descripcion: this.descripcion,
            linea: this.linea, columna: this.columna + 1 };
    }
    toString() {
        return `Error: ${this.tipoError} - ${this.descripcion} en la línea ${this.linea}, columna ${this.columna + 1}`;
    }
}
exports.default = Errores;
