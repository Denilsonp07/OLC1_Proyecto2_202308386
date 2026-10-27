# Manual técnico de AutoInfra

## 1. Información general

AutoInfra es un compilador e intérprete para un lenguaje orientado a la
descripción y administración de infraestructura. El sistema permite declarar
servidores, servicios y bases de datos; definir variables, funciones y tareas;
ejecutar instrucciones de control; y simular operaciones de infraestructura
como iniciar, detener, instalar paquetes, desplegar servicios y conectar
recursos.

El proyecto está organizado en dos aplicaciones:

- **Backend:** implementa el compilador, el intérprete, la API REST y la
  generación de reportes.
- **Frontend:** proporciona el editor y la interfaz web para enviar código al
  backend y visualizar los resultados.

El flujo general es:

```text
Código fuente
    │
    ▼
Frontend React
    │  HTTP/JSON
    ▼
API Express
    │
    ▼
Worker de Node.js
    │
    ├── Análisis léxico
    ├── Análisis sintáctico y recuperación de errores
    ├── Construcción del AST
    └── Ejecución del programa válido
             │
             ▼
Resultado JSON: consola, errores, tokens, AST, símbolos e infraestructura
```

La documentación de la gramática formal se encuentra en
[`gramatica.md`](./gramatica.md).

## 2. Lenguajes de programación utilizados

### 2.1 TypeScript

El backend está escrito principalmente en **TypeScript**. Se utiliza para:

- Definir tipos de tokens, errores, recursos, símbolos y resultados.
- Implementar las clases del árbol de instrucciones y expresiones.
- Construir la tabla de símbolos y el motor de ejecución.
- Implementar la API HTTP de Express.
- Mantener separadas las responsabilidades del analizador y la ejecución.

TypeScript se transpila a JavaScript mediante el compilador configurado en
`backend/tsconfig.json`. El resultado se genera en `backend/build`.

### 2.2 JavaScript y JSX

El frontend está escrito en **JavaScript con JSX**, usando React. Los archivos
`.jsx` contienen componentes y lógica de interacción, mientras que CSS define
la apariencia visual de la aplicación.

### 2.3 Jison

La especificación del lenguaje está escrita en
[`analizador.jison`](../backend/src/analizador/analizador.jison). Jison permite
definir:

- Reglas léxicas mediante expresiones regulares.
- Tokens y palabras reservadas.
- Producciones de la gramática.
- Acciones semánticas que crean objetos del AST.

El comando `jison` genera
`backend/build/analizador/analizador.js`. Este archivo es generado
automáticamente y no debe editarse manualmente.

## 3. Herramientas, librerías y dependencias

### 3.1 Backend

Las dependencias principales del backend, declaradas en
[`backend/package.json`](../backend/package.json), son:

| Herramienta o librería | Uso |
|---|---|
| Node.js | Entorno de ejecución del servidor y del intérprete. |
| TypeScript | Tipado estático y transpilación del backend. |
| Express | Creación de la API HTTP y manejo de solicitudes JSON. |
| CORS | Permite solicitudes desde el frontend durante el desarrollo. |
| Jison | Generación del lexer y de las tablas del parser LALR. |
| `worker_threads` | Ejecución aislada del análisis y del programa. Es una API nativa de Node.js. |
| Nodemon | Reinicio automático del backend durante el desarrollo. |
| ts-node y tsx | Ejecución auxiliar de TypeScript en desarrollo. |
| `@types/node`, `@types/express`, `@types/cors` | Definiciones de tipos para TypeScript. |

### 3.2 Frontend

Las dependencias del frontend, declaradas en
[`frontend/package.json`](../frontend/package.json), son:

| Herramienta o librería | Uso |
|---|---|
| React | Construcción de la interfaz de usuario. |
| React DOM | Montaje de React en el elemento `root` del documento. |
| Vite | Servidor de desarrollo y empaquetado de producción. |
| `@viz-js/viz` | Visualización del AST generado en formato DOT. |
| Oxlint | Revisión estática del código JavaScript/JSX. |
| `@vitejs/plugin-react` | Integración de React con Vite. |

No se utiliza una base de datos. El estado de cada análisis se crea en memoria
y se descarta al terminar la solicitud.

## 4. Requisitos e instalación

Se requiere:

- Node.js compatible con las versiones declaradas en los paquetes.
- npm.
- Un navegador moderno.
- Dos terminales si se desea ejecutar backend y frontend simultáneamente.

Desde la raíz del repositorio se pueden instalar las dependencias con:

```powershell
npm install
cd backend
npm install
cd ..\frontend
npm install
```

El `package.json` de la raíz contiene las dependencias generales del
repositorio; cada aplicación mantiene sus propias dependencias y scripts.

## 5. Ejecución del proyecto

### 5.1 Backend en desarrollo

```powershell
cd backend
npm run dev
```

El backend queda disponible, por defecto, en
`http://localhost:8081`. Nodemon observa los archivos `.ts` y `.jison`, ejecuta
la compilación y reinicia el servidor cuando detecta cambios.

### 5.2 Compilación del backend

```powershell
cd backend
npm run build
```

Este comando ejecuta dos pasos:

1. `tsc`: transpila TypeScript a `backend/build`.
2. `npm run jison`: genera el parser JavaScript a partir del archivo Jison.

Para iniciar el backend compilando antes:

```powershell
cd backend
npm start
```

### 5.3 Frontend en desarrollo

```powershell
cd frontend
npm run dev
```

Vite muestra la dirección local en la consola. La interfaz intenta comunicarse
con el backend mediante los endpoints `/api/...`.

### 5.4 Construcción y validación del frontend

```powershell
cd frontend
npm run build
npm run lint
```

`npm run build` genera la versión distribuible en `frontend/dist`.
`npm run lint` ejecuta Oxlint.

## 6. Estructura general del proyecto

```text
OLC1_Proyecto2/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── procesar.ts
│   │   ├── worker.ts
│   │   ├── analizador/
│   │   │   ├── analizador.jison
│   │   │   ├── lexico.ts
│   │   │   ├── sintactico.ts
│   │   │   ├── ejecutar.ts
│   │   │   ├── abstracto/
│   │   │   ├── excepciones/
│   │   │   ├── expresiones/
│   │   │   ├── instrucciones/
│   │   │   └── simbolo/
│   │   ├── infraestructura/
│   │   └── reportes/
│   └── build/                 # salida generada; no editar manualmente
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── docs/
│   ├── ManualTecnico.md
│   ├── ManualUsuario.md
│   └── gramatica.md
├── package.json
└── package-lock.json
```

### 6.1 Backend y API

- [`index.ts`](../backend/src/index.ts): crea Express, configura CORS y JSON,
  registra endpoints y ejecuta cada solicitud en un worker.
- [`procesar.ts`](../backend/src/procesar.ts): coordina el pipeline completo y
  transforma el resultado a un objeto serializable.
- [`worker.ts`](../backend/src/worker.ts): recibe datos de `workerData`, llama a
  `procesar` y devuelve el resultado mediante `parentPort`.

### 6.2 Analizador

- [`analizador.jison`](../backend/src/analizador/analizador.jison): reglas
  léxicas, tokens, precedencia y producciones.
- [`lexico.ts`](../backend/src/analizador/lexico.ts): recorrido controlado del
  lexer generado y construcción de la tabla de tokens.
- [`sintactico.ts`](../backend/src/analizador/sintactico.ts): conductor LR que
  reutiliza las tablas de Jison y agrega recuperación de errores.
- [`ejecutar.ts`](../backend/src/analizador/ejecutar.ts): ordena el registro de
  declaraciones y la ejecución del bloque `main`.

### 6.3 Modelo de ejecución

- `abstracto/instruccion.ts`: clase base de expresiones e instrucciones.
- `abstracto/bloque.ts`: ejecución secuencial de bloques y propagación de
  señales.
- `abstracto/senal.ts`: representa `break`, `continue` y `return`.
- `simbolo/tipo.ts`: tipos, compatibilidad, conversiones y valores por defecto.
- `simbolo/simbolo.ts`: entrada individual de la tabla de símbolos.
- `simbolo/tablaSimbolo.ts`: ámbitos anidados y búsqueda de identificadores.
- `simbolo/arbol.ts`: estado de una ejecución, consola, errores y límites.

### 6.4 Expresiones e instrucciones

La carpeta `expresiones` implementa literales, variables, arreglos, llamadas,
acceso a propiedades e índices, operadores aritméticos, relacionales, lógicos
y unarios.

La carpeta `instrucciones` implementa declaraciones, asignaciones, funciones,
tareas, `main`, condicionales, ciclos, impresión, retorno y operaciones de
control.

### 6.5 Infraestructura y reportes

- `infraestructura/recursos.ts`: clases `Recurso`, `Server`, `Service` y
  `Database`.
- `infraestructura/validacion.ts`: catálogo de propiedades permitidas,
  obligatoriedad, solo lectura y restricciones de valores.
- `infraestructura/nativas.ts`: funciones nativas de operación sobre recursos.
- `reportes/ast.ts`: representación JSON del AST y generación de código DOT.

## 7. Clases, métodos y funciones importantes

### 7.1 `Instruccion`

`Instruccion` es la clase abstracta común a expresiones e instrucciones. Guarda
`tipoDato`, `linea` y `columna`, y exige que cada clase implemente:

```typescript
interpretar(arbol: Arbol, tabla: TablaSimbolo): any
```

El método interpreta el nodo en el entorno actual y puede devolver un valor,
un objeto `Errores`, una `Senal` o `undefined`.

### 7.2 `Tipo`

La clase `Tipo` representa tipos primitivos, tipos de recursos y arreglos.
`tipoDato` incluye `ENTERO`, `DECIMAL`, `BOOLEAN`, `CHAR`, `CADENA`, `VOID`,
`SERVER`, `SERVICE`, `DATABASE`, `RECURSO` y `ARREGLO`.

Funciones relevantes:

- `nombreTipo`: convierte un tipo interno a un nombre legible.
- `compatible`: comprueba asignaciones válidas, incluyendo `int` a `float` y
  el tipo genérico `resource`.
- `aTexto`: convierte valores a texto para impresión y concatenación.
- `valorPorDefecto`: obtiene el valor inicial de un tipo.

### 7.3 `TablaSimbolo` y `Simbolo`

`Simbolo` almacena tipo, identificador, valor y categoría. Las categorías
usadas son variable, parámetro, recurso, función y tarea.

`TablaSimbolo` mantiene un `Map` local y una referencia al ámbito padre. Sus
operaciones principales son:

- `crearHijo(nombre)`: crea un ámbito hijo.
- `setVariable(simbolo)`: declara un símbolo y rechaza duplicados locales.
- `getVariable(id)`: busca desde el ámbito actual hacia los padres.
- `getRegistro()`: obtiene el registro acumulado para el reporte final.
- `getRuta()`: devuelve la ruta descriptiva del ámbito, por ejemplo
  `global > main > for`.

### 7.4 `Arbol`

Aunque el nombre histórico es `Arbol`, esta clase representa el contexto global
de una ejecución. Sus responsabilidades son:

- Conservar las instrucciones del programa.
- Mantener la tabla global.
- Acumular la salida de `print` y la bitácora de infraestructura.
- Acumular errores.
- Contabilizar instrucciones mediante `tick`.
- Controlar profundidad mediante `entrarLlamada` y `salirLlamada`.

Los límites predeterminados son 100 000 instrucciones y 1 000 niveles de
llamada. Se pueden cambiar al crear el contexto desde las variables de entorno
del servidor.

### 7.5 Recursos de infraestructura

`Recurso` es una clase abstracta con `nombre`, `tipoRecurso`, `status` y un
conjunto de conexiones. `toJSON()` produce la forma serializable del recurso.

- `Server`: conserva CPU, memoria, disco, sistema operativo, paquetes y
  servicios desplegados. Inicia en estado `stopped`.
- `Service`: conserva puerto, réplicas, dependencias y servidor anfitrión.
  Inicia en estado `undeployed`.
- `Database`: conserva motor, versión, puerto y dependencias. Inicia en estado
  `stopped`.

### 7.6 Funciones nativas

`NATIVAS` define nombre, parámetros, tipo de retorno y función ejecutora para
cada operación. Las operaciones principales son:

| Función | Propósito |
|---|---|
| `start(resource)` | Cambia un recurso a `running`, respetando el despliegue de servicios. |
| `stop(resource)` | Detiene un recurso activo. |
| `restart(resource)` | Registra un reinicio de un recurso activo. |
| `install(server, string)` | Instala un paquete en un servidor activo. |
| `uninstall(server, string)` | Retira un paquete. |
| `deploy(server, service)` | Despliega un servicio y valida servidor y dependencias. |
| `scale(service, int)` | Cambia las réplicas; exige al menos una. |
| `connect(resource, resource)` | Crea una conexión bidireccional sin duplicados. |
| `disconnect(resource, resource)` | Elimina una conexión existente. |
| `print(...)`, `println(...)` | Escriben valores en la consola. |
| `length(array)` | Devuelve la cantidad de elementos. |
| `status(resource)` | Devuelve el estado textual del recurso. |

Las operaciones validan sus precondiciones antes de modificar el estado.
Cuando una operación es redundante se registra una advertencia; cuando una
precondición de infraestructura falla se registra un error `INFRA-xxx`.

### 7.7 `procesar` y `ejecutarPrograma`

`procesar(source, limites, ejecutar)` es el punto de entrada del compilador.
Realiza, en orden:

1. Tokenización.
2. Análisis sintáctico.
3. Combinación de errores léxicos y sintácticos.
4. Construcción del AST cuando existe un árbol parcial.
5. Ejecución únicamente si no existen errores de análisis y `ejecutar` es
   verdadero.
6. Construcción de tabla de símbolos, consola e infraestructura.
7. Conversión a JSON para cruzar el límite del worker.

`ejecutarPrograma(arbol)` aplica el orden semántico del lenguaje:

1. Registra funciones y tareas, sin importar el orden en que aparezcan.
2. Registra recursos y variables globales. Las declaraciones que dependen de
   un símbolo posterior pueden reintentarse.
3. Ejecuta el único bloque `main`.

El programa debe contener exactamente un bloque `main`. La ausencia o
duplicidad genera `SEM-011`.

## 8. Funcionamiento del analizador léxico

### 8.1 Entrada y salida

El lexer de Jison recibe el código fuente como texto. Las reglas de
[`analizador.jison`](../backend/src/analizador/analizador.jison) reconocen
espacios, saltos de línea, comentarios, palabras reservadas, identificadores,
enteros, decimales, cadenas, operadores y delimitadores.

`tokenizar` no usa `parser.parse()` directamente. Crea una copia del lexer
generado, inicializa su entrada y llama repetidamente a `lex()`. Para cada
token conserva:

- Número consecutivo.
- Nombre del token.
- Lexema original.
- Texto entregado a la gramática.
- Línea y columna inicial.
- Línea y columna final.

La columna interna comienza en cero y se convierte a base uno al preparar la
respuesta de la API.

### 8.2 Errores léxicos

El lexer acumula errores en `yy.erroresLexicos` y continúa avanzando. Esto
permite reportar más de un carácter no reconocido o más de una cadena sin
cerrar en un mismo análisis.

Se reportan, entre otros:

- Caracteres que no pertenecen al lenguaje.
- Cadenas sin cerrar.
- Comentarios multilínea sin cerrar.

Esta estrategia evita que el primer carácter inválido oculte todos los demás
errores del archivo. Los errores léxicos se convierten en objetos `Errores` con
categoría `Léxico` y código `LEX-001`.

## 9. Funcionamiento del analizador sintáctico

### 9.1 Gramática y AST

Jison genera tablas LALR a partir de las producciones del archivo Jison. Las
acciones semánticas de las producciones crean instancias de las clases del
intérprete. Por ejemplo, una suma crea `Aritmeticas`, una declaración crea
`Declaracion` y una estructura `if` crea `CondicionalIf`.

La gramática define, entre otros elementos:

- Declaraciones de variables y recursos.
- Asignaciones y accesos encadenados.
- Expresiones aritméticas, relacionales y lógicas.
- Funciones con parámetros y retorno.
- Tareas y ejecución mediante `run`.
- Bloque único `main`.
- `if`, `else`, `while`, `for`, `break` y `continue`.

### 9.2 Conductor `parsear`

El parser generado por Jison se detiene ante el primer error. Para evitarlo,
`parsear` reutiliza sus tablas (`table`, `productions_`,
`performAction`) y ejecuta un conductor LR propio.

La recuperación intenta, en este orden:

1. **Inserción:** insertar delimitadores faltantes como `;`, `)`, `]` o `}`.
2. **Borrado:** descartar un token sobrante si el estado actual puede
   continuar.
3. **Pánico:** descartar tokens hasta `;`, `}` o una declaración, retirar
   estados de la pila y continuar.

Después de un error se silencian tokens de cascada hasta desplazar tres tokens.
Existe un máximo de 50 errores sintácticos y una cota de iteraciones para que
la recuperación siempre termine.

La salida es `{ ast, errores }`. Si el parser logra construir parte del árbol,
el AST puede reportarse aunque existan errores; sin embargo, el programa no se
ejecuta si hay errores léxicos o sintácticos.

### 9.3 Combinación de errores

`combinarErrores` ordena los errores por línea y columna. Además, descarta
errores sintácticos que son consecuencia directa de un error léxico cercano,
por ejemplo un `;` faltante causado por la desaparición de un carácter
inválido. Esto evita duplicar diagnósticos sobre la misma causa.

## 10. Funcionamiento del motor de ejecución

### 10.1 Contexto y bloques

Cada nodo implementa `interpretar`. `ejecutarBloque` ejecuta las instrucciones
en orden y propaga:

- `Errores`, para detener el bloque actual.
- `Senal`, para transferir `break`, `continue` o `return` al ciclo o función
  correspondiente.
- Valores normales, que permiten continuar.

Cada bloque crea un ámbito hijo cuando corresponde. La búsqueda de variables
sube por la cadena de padres, mientras que las declaraciones solo ocupan el
ámbito local.

### 10.2 Funciones, tareas y `main`

Las funciones se registran antes de ejecutar `main`, por lo que pueden
invocarse aunque estén escritas después de la llamada. Las tareas almacenan su
cuerpo y su entorno de declaración; `run` crea un ámbito para ejecutarlas.

`main` es el punto de entrada. Una señal que llegue a `main` sin un ciclo o
función que la consuma se convierte en un error semántico `SEM-006`.

### 10.3 Recursos y atomicidad

Las declaraciones de recursos consultan `CATALOGO`, verifican propiedades
permitidas, tipos, valores obligatorios, valores duplicados y restricciones
como puertos entre 1 y 65535. Solo después de validar todo se crea el recurso y
se registra en la tabla de símbolos.

Las funciones nativas validan todas sus precondiciones antes de modificar
recursos. Por ejemplo, `deploy` valida que el servidor esté activo, que las
dependencias estén ejecutándose y que el servicio no esté ya desplegado antes
de cambiar `host`, `status` y las listas de servicios.

### 10.4 Límites de seguridad

El servidor usa un worker con límites de memoria y pila. Además:

- `MAX_INSTRUCCIONES` limita el número de instrucciones interpretadas.
- `MAX_PROFUNDIDAD` limita la profundidad de llamadas.
- `TIMEOUT_MS` termina el worker si una solicitud excede el tiempo máximo.

Valores predeterminados:

```text
MAX_INSTRUCCIONES = 100000
MAX_PROFUNDIDAD   = 1000
TIMEOUT_MS        = 20000
PORT              = 8081
```

Estos límites evitan ciclos infinitos, recursión excesiva y bloqueos del
servidor principal.

## 11. API REST

Todas las rutas de análisis reciben JSON con esta forma:

```json
{
  "source": "main { print(\"Hola\"); }"
}
```

Si `source` no existe o no es una cadena, la API devuelve HTTP 400.

### 11.1 `GET /api/health`

Comprueba que el backend esté disponible:

```json
{
  "success": true,
  "message": "El backend del compilador está funcionando."
}
```

### 11.2 `POST /api/execute`

Ejecuta análisis y programa. Devuelve todos los campos:

- `success`
- `console`
- `errors`
- `symbols`
- `tokens`
- `ast`
- `infrastructure`

### 11.3 `POST /api/analyze`

Realiza análisis léxico, sintáctico y generación del AST, pero no ejecuta el
programa. Devuelve el resultado completo del análisis.

### 11.4 Endpoints parciales

| Ruta | Ejecución | Campos principales |
|---|---:|---|
| `/api/tokens` | No | `success`, `tokens`, `errors` |
| `/api/ast` | No | `success`, `ast`, `errors` |
| `/api/symbols` | Sí | `success`, `symbols`, `errors` |
| `/api/errors` | Sí | `success`, `errors` |

`index.ts` centraliza la configuración de estas rutas mediante la constante
`ENDPOINTS`. Si se agrega un nuevo reporte, debe definirse allí y conservar el
contrato de entrada y salida JSON.

## 12. Reportes y visualización

### 12.1 Tabla de tokens

El frontend puede mostrar la secuencia de tokens con su lexema, tipo y
posición. Esta información permite localizar errores y comprobar que las
reglas léxicas reconocen correctamente el código.

### 12.2 AST

`construirAST` recorre por reflexión las propiedades de los nodos de
`Instruccion`. Produce nodos JSON con:

- `id`.
- `tipo`.
- `atributos`.
- `hijos`.

`aDot` transforma ese árbol a formato DOT. El reporte se limita a 3 000 nodos;
si se supera, `truncado` se marca en `true` y el DOT incluye una nota.
`@viz-js/viz` permite representarlo visualmente en el frontend.

### 12.3 Tabla de símbolos e infraestructura

El resultado de ejecución recorre el registro acumulado de todos los ámbitos.
Para cada símbolo se informa identificador, categoría, tipo, ámbito y valor.

Los recursos se agrupan en:

```json
{
  "servers": [],
  "services": [],
  "databases": []
}
```

Cada recurso se serializa con `toJSON`, incluyendo propiedades, estado,
conexiones y, cuando corresponde, paquetes, réplicas o servidor anfitrión.

## 13. Mantenimiento y extensión

### 13.1 Agregar una palabra reservada o producción

1. Agregar la regla léxica en `analizador.jison`.
2. Agregar o modificar la producción correspondiente.
3. Crear o reutilizar una clase `Instruccion` o expresión.
4. Implementar `interpretar`.
5. Actualizar `reportes/ast.ts` si el nodo necesita un nombre o rol especial.
6. Ejecutar `npm run build` dentro de `backend`.
7. Verificar tokens, errores, AST y ejecución desde la API.

### 13.2 Agregar un tipo de recurso

1. Ampliar `TipoRecurso` y crear la clase derivada de `Recurso`.
2. Agregar sus propiedades y estados en `validacion.ts`.
3. Crear la lógica de construcción en `DeclaracionRecurso`.
4. Agregar funciones nativas solo si la operación está definida por el
   lenguaje.
5. Incluir el recurso en `infraVacia` y en la serialización de `procesar`.
6. Actualizar la tabla de símbolos y el frontend para visualizarlo.

### 13.3 Agregar una función nativa

Cada entrada de `NATIVAS` debe declarar parámetros, retorno y función
ejecutora. La función debe:

- Validar tipos y precondiciones.
- No modificar el estado si una validación falla.
- Usar códigos `INFRA-xxx` para errores de infraestructura.
- Usar la bitácora `[OK]` o `[WARN]` para operaciones y redundancias.
- Mantener valores serializables en el resultado final.

### 13.4 Archivos generados

No se debe editar directamente `backend/build`. Los cambios deben hacerse en
`backend/src` y regenerarse con `npm run build`. Antes de confirmar cambios se
debe revisar el estado de Git para no incluir salidas generadas accidentalmente
si el flujo del repositorio no las versiona.

### 13.5 Diagnóstico de problemas

1. Comprobar `GET /api/health`.
2. Ejecutar el endpoint `/api/tokens` para aislar problemas léxicos.
3. Ejecutar `/api/ast` para validar la sintaxis sin efectos de ejecución.
4. Revisar `/api/errors` para distinguir errores de análisis y ejecución.
5. Consultar la consola del backend para errores del worker.
6. Verificar las variables `PORT`, `TIMEOUT_MS`, `MAX_INSTRUCCIONES` y
   `MAX_PROFUNDIDAD`.
7. Si se modificó la gramática, regenerar el parser con `npm run build`.

## 14. Contrato de errores

Los errores se representan con categoría, descripción, línea, columna y
código. Las categorías principales son:

| Categoría | Origen |
|---|---|
| `Léxico` | Carácter inválido, cadena o comentario sin cerrar. |
| `Sintáctico` | Secuencia de tokens que no coincide con la gramática. |
| `Semántico` | Tipos, declaraciones, ámbitos o uso incorrecto del lenguaje. |
| `Infraestructura` | Estado o precondición inválida de un recurso. |
| `Ejecución` | Límite excedido o fallo controlado del intérprete. |

El campo `success` solo es `true` cuando no existen errores relevantes en el
resultado. Un AST parcial puede estar disponible aunque `success` sea `false`;
esto sirve para diagnóstico, pero no habilita la ejecución.

## 15. Consideraciones para futuras mejoras

- Mantener sincronizados la gramática, las clases del AST, el reporte y la
  documentación.
- Añadir pruebas automatizadas para cada nueva producción y función nativa.
- Conservar los códigos de error estables para que el frontend pueda
  clasificarlos.
- Evitar ejecutar lógica del usuario en el hilo principal del servidor.
- Mantener límites finitos para instrucciones, profundidad, tamaño de reportes
  y tiempo de ejecución.
- Validar siempre la serialización cuando se agreguen propiedades de recursos.
- No colocar secretos ni configuración sensible en el código fuente; utilizar
  variables de entorno para valores de despliegue.
