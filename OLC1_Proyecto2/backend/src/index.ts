

import arbol from "./analizador/simbolo/arbol";
import tablaSimbolo from "./analizador/simbolo/tablaSimbolo";

class patronInterpreter {
    start(): any {
        try {
            let parser = require('./analizador/analizador.js');

            let entrada = `
                int a = 10;
                if a < 20 {
                    a = 50
                    int total =a+100;
                    println(total)
                } else {
                    a = 0
                println("hola esto es el else")
                }
            `;

            let ast = new Arbol(parser.parse(entrada));
            let tabla = new TablaSimbolo();
            ast.setTablaGlobal(tabla);
            ast.setConsola("");

            for (let i of ast.getInstrucciones()) {
                var resultado = i.interpretar(ast, tabla);
                if (resultado !== undefined) {
                    console.log(resultado);
                }
            }

            console.log(ast.getConsola());
            console.log("--- Tabla de símbolos ---");
            console.log(tabla);
        } catch (e: any) {
            console.error(e);
            process.exitCode = 1;
        }
    }
}

export const interpreter = new patronInterpreter();
interpreter.start();