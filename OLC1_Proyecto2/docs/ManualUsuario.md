# Manual de usuario de AutoInfra


## 1. Introducción

AutoInfra es un entorno web para escribir, guardar y ejecutar programas del
lenguaje de infraestructura AutoInfra. El usuario puede declarar servidores,
servicios y bases de datos, ejecutar operaciones sobre ellos y consultar los
resultados del intérprete.

Este manual explica el flujo básico de trabajo:


## 2. Requisitos previos

Antes de utilizar la interfaz se debe comprobar lo siguiente:

- Tener instalado Node.js y npm.
- Tener instaladas las dependencias del backend y frontend.
- Tener el backend ejecutándose en el puerto `8081`.
- Tener el frontend ejecutándose mediante Vite.
- Utilizar un navegador web moderno.

### 2.1 Iniciar el backend

Para iniciar el backend es sencillo desde una terminal hacer:

```powershell
cd backend
npm run dev
```

Por defecto, el backend queda disponible en:

```text
http://localhost:8081
```

Para comprobar que está activo se puede visitar:

```text
http://localhost:8081/api/health
```

Una respuesta correcta indica que el backend del compilador está funcionando.

### 2.2 Iniciar el frontend

para iniciar el frontend se debe abrir otra terminal:

```powershell
cd frontend
npm run dev
```

acá se mostrara el local host por defecto que aparecera como 

```text
http://localhost:5173
```

## 3. Descripción de la interfaz

La ventana principal está dividida en tres zonas:





### 3.1 Barra superior

La barra superior contiene:

- **Nuevo:** limpia el editor y crea un archivo sin título.
- **Abrir archivo:** selecciona un archivo local para cargarlo en el editor.
- **Guardar:** descarga el contenido actual como archivo.
- **Ejecutar:** envía el código al backend y muestra el resultado.

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20221814.png)

### 3.2 Editor de código

El editor es el área grande ubicada en el lado izquierdo. En él se escribe el
código AutoInfra. El nombre del archivo aparece sobre el editor:

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20222014.png)

### 3.3 Panel de resultados

El panel derecho muestra la salida de la última ejecución. Incluye las pestañas:

- Consola: mensajes producidos por print, start, deploy y otras
  operaciones.
- Errores: errores léxicos, sintácticos, semánticos o de ejecución.
- Tokens: tokens reconocidos por el analizador léxico.
- Símbolos:variables, funciones, tareas y recursos registrados.
- AST: árbol de sintaxis abstracta del programa.
- Infraestructura: servidores, servicios y bases de datos creados.

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20222203.png)

## 4. Crear un archivo nuevo

### 4.1 Crear un archivo vacío

Para crear un archivo nuevo es muy facil 

Haga clic en el botón Nuevo de la barra superior y el editor se quedará vacío.El nombre del archivo volverá a ser sin_titulo.infra.El panel de resultados se limpiará.


 Seleccione Aceptar para crear el archivo nuevo y descartar los cambios.
 y para cancelar igual 
Seleccione Cancelar para conservar el archivo actual.

### 4.2 Escribir codigo dentro del programa

Se puede escribir el código directamente en el editor. ejemplo:


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20222528.png)



El código puede escribirse o pegarse en el editor. El editor no realiza la
ejecución automáticamente; es necesario utilizar el botón Ejecutar.



## 5. Abrir un archivo existente



### 5.1 Abrir desde la interfaz

para abrir un archivo es muy sencillo 

1. Se debe hacer Haga en Abrir archivo.


2. Se abrirá el selector de archivos del sistema operativo.


3. Ubique el archivo que desea cargar.


4. Se debe seleccionar un archivo con extensión .infra o .txt.

5. Haga clic en Abrir y listo.

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20222844.png)

La aplicación cargará el contenido en el editor y mostrará el nombre real del
archivo en la parte superior del área de código.


## 6. Guardar un archivo

### 6.1 Guardar por primera vez

1. Escriba o cargue el programa en el editor.
2. Haga clic en Guardar.
3. El navegador descargará el archivo con el nombre que aparece sobre el
   editor.

el navegador descargará un archivo con ese nombre ejemplo:



> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20223115.png)



## 7. Ejecutar un archivo

### 7.1 Ejecutar el programa actual


4. Haga clic en Ejecutar.
se mostrara el resultado en la cosola de la derecha
se puede revisar la consola y las pestañas del panel de resultados.


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20223414.png)


### 7.2 Ejecución con errores

Si el programa contiene errores:

el sistema mostrara los errores en el panel de la derecha 


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20223632.png)



### 8.1 Consola

Muestra los valores recopilados 

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20223828.png)

### 8.2 Errores

Muestra la información de los errores necesaria con su descripcion en su linea y columna indicada:


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20223632.png)


### 8.3 Tokens

Permite ver los tokens capturadoss con su linea y colunma correspondiente:


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20224015.png)


### 8.4 Símbolos

Muestra los identificadores registrados durante la ejecución, incluyendo
variables, parámetros, funciones, tareas y recursos. También muestra su tipo,
ámbito y valor.

> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20224145.png)


### 8.5 AST

Muestra el árbol de sintaxis abstracta generado a partir del programa. Este
reporte es útil para comprobar la estructura de expresiones, declaraciones,
funciones y bloques de control.


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20224244.png)


### 8.6 Infraestructura

Agrupa los recursos declarados así:


> ![Interfaz Principal](images/Captura%20de%20pantalla%202026-10-26%20224342.png)


El reporte muestra propiedades, estado, conexiones, paquetes instalados y
dependencias según corresponda.

## 9. Flujo de trabajo recomendado

Para trabajar con un programa se recomienda este procedimiento:

1. Inicie el backend.
2. Inicie el frontend.
3. Abra AutoInfra en el navegador.
4. Presione Nuevo para comenzar desde cero o Abrir archivo para
   continuar un trabajo existente.
5. Escriba o modifique el código.
6. Presione Guardar.
7. Presione Ejecutar.
8. Revise primero la pestaña Errores.
9. Si no existen errores, consulte la Consola.
10. Utilice Tokens, AST, Símbolos e Infraestructura para
    analizar el comportamiento.
11. Realice cambios, guarde y ejecute de nuevo.


