

import Tipo from "../simbolo/tipo"

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
export enum TipoSenal { BREAK, CONTINUE, RETURN }

export default class Senal {
    constructor(public tipo: TipoSenal, public valor?: any, public tipoValor?: Tipo,
                public linea: number = 0, public columna: number = 0) {}
}