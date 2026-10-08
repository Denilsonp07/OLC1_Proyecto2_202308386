"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Errores {
    tipoError;
    descripcion;
    linea;
    columna;
    constructor(tipoError, descripcion, linea, columna) {
        this.tipoError = tipoError;
        this.descripcion = descripcion;
        this.linea = linea;
        this.columna = columna;
    }
    getTipoError() {
        return this.tipoError;
    }
    getDescripcion() {
        return this.descripcion;
    }
    getLinea() {
        return this.linea;
    }
    getColumna() {
        return this.columna;
    }
    setTipoError(tipoError) {
        this.tipoError = tipoError;
    }
    setDescripcion(descripcion) {
        this.descripcion = descripcion;
    }
    setLinea(linea) {
        this.linea = linea;
    }
    setColumna(columna) {
        this.columna = columna;
    }
    toString() {
        return `Error: ${this.tipoError} - ${this.descripcion} en la línea ${this.linea}, columna ${this.columna}`;
    }
}
exports.default = Errores;
