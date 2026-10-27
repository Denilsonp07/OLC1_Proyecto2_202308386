"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoSenal = void 0;
/**
 * Contrato de retorno de interpretar():
 *   undefined          -> todo normal
 *   Errores            -> fallo: sube de inmediato hasta quien lo reporte
 *   Senal              -> control de flujo (break / continue / return): sube sin ejecutar
 *                         más instrucciones hasta que algo la absorba
 *                         (while/for: BREAK y CONTINUE; llamada a función: RETURN)
 * Si una Senal llega a main/task/función sin quien la absorba, ese borde la convierte en
 * error semántico (break/continue fuera de ciclo, return fuera de función).
 */
var TipoSenal;
(function (TipoSenal) {
    TipoSenal[TipoSenal["BREAK"] = 0] = "BREAK";
    TipoSenal[TipoSenal["CONTINUE"] = 1] = "CONTINUE";
    TipoSenal[TipoSenal["RETURN"] = 2] = "RETURN";
})(TipoSenal || (exports.TipoSenal = TipoSenal = {}));
class Senal {
    tipo;
    valor;
    tipoValor;
    linea;
    columna;
    constructor(tipo, valor, tipoValor, linea = 0, columna = 0) {
        this.tipo = tipo;
        this.valor = valor;
        this.tipoValor = tipoValor;
        this.linea = linea;
        this.columna = columna;
    }
}
exports.default = Senal;
