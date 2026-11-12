# Vacaciones mañana

Script en Python que lee el Excel de vacaciones (alojado en SharePoint y
sincronizado en local vía OneDrive) y muestra en la terminal quién tiene
vacaciones el **día siguiente** a la fecha de ejecución.

## Requisitos

- Python 3.9 o superior
- El Excel de vacaciones debe estar accesible en una carpeta local
  (la carpeta que SharePoint/OneDrive sincroniza en tu equipo)

## Instalación (en VS Code)

1. Abre esta carpeta en VS Code.
2. Crea un entorno virtual (opcional pero recomendado):
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## Configuración

El script necesita saber dónde está el Excel. Tienes dos opciones:

**Opción A — variable de entorno (recomendada):**

```bash
# Windows (PowerShell)
$env:VACACIONES_XLSX_PATH = "C:\Users\tu.usuario\OneDrive - TuEmpresa\Vacaciones\Vacaciones2026.xlsx"

# macOS/Linux
export VACACIONES_XLSX_PATH="/home/tu.usuario/OneDrive - TuEmpresa/Vacaciones/Vacaciones2026.xlsx"
```

**Opción B — pasar la ruta al ejecutar:**

```bash
python vacaciones_manana.py --excel "C:\ruta\a\Vacaciones2026.xlsx"
```

Si no usas ninguna de las dos, el script usa la ruta de ejemplo definida en
`DEFAULT_XLSX_PATH` dentro de `vacaciones_manana.py` — edítala con tu ruta real.

## Uso

```bash
python vacaciones_manana.py
```

Salida esperada:

```
Vacaciones para el 06/03/2026 (BV, hoja 'Vacaciones 2026')
------------------------------------------------------------
 - Alberto García [AIRPORTS]
```

### Elegir la hoja

Si el libro tiene varias pestañas, el script detecta solo la del calendario
de vacaciones (la que tiene los meses en celdas combinadas). Si quieres
forzarla:

```bash
python vacaciones_manana.py --hoja "Vacaciones 2026"
```

### Probar con otra fecha

Para pruebas, puedes forzar la fecha de referencia (el script comprobará
el día *siguiente* a esa fecha):

```bash
python vacaciones_manana.py --fecha 2026-03-05
```

## Cómo funciona / estructura esperada del Excel

El script asume que la hoja de cálculo sigue esta estructura (la misma que
la plantilla de vacaciones actual):

| Fila | Contenido |
|---|---|
| 2 | Nombre del mes, en celdas combinadas (p. ej. "SEPTIEMBRE") |
| 3 | Letra del día de la semana (L, M, X, J, V, S, D) |
| 4 | Número de día del mes (1, 2, 3, ...) |
| 5+ | Una fila por persona |

Columnas fijas por persona:

| Columna | Contenido |
|---|---|
| A | Departamento |
| B | Ubicación |
| C | Persona |
| D | Horas Trabajadas |
| E | Días NO facturados |
| F–I | Resumen de vacaciones (Actual / Ant. / Cons / Pdtes) |
| J en adelante | Calendario, una columna por día |

En el calendario, el código `"V"` significa vacaciones. El script busca
ese código en la columna del día siguiente, para cada persona.

**Caso especial de fin de año:** si el Excel incluye, al final del año, un
bloque adicional de "ENERO" (para cubrir el 1 de enero del año siguiente),
el script lo detecta automáticamente al ejecutarse el 31 de diciembre.

Si la estructura de tu Excel cambia (otra fila para los meses, otra
columna de inicio del calendario, otro código para vacaciones, etc.),
ajusta las constantes en la sección `CONFIGURACIÓN` al principio de
`vacaciones_manana.py`.

## Versión web (GitHub Pages)

Además del script, el proyecto incluye una página web (`index.html`, un
único archivo autocontenido) que hace lo mismo sin instalar nada:

1. Sube los archivos al repositorio y activa GitHub Pages
   (Settings > Pages > Deploy from a branch > `main` / root).
2. Abre `https://TU_USUARIO.github.io/TU_REPOSITORIO/`.
3. Elige el Excel (o arrástralo) en el menú lateral. La página muestra:
   - quién está de vacaciones o permiso mañana, y
   - quién empieza vacaciones o permiso mañana (se compara con el último día
     laborable anterior, saltando fines de semana y festivos).

   En el menú lateral puedes cambiar la fecha, elegir qué listas ver,
   filtrar por tipo (**Vacaciones** = códigos `V`/`VS`, **Permiso** = `P`,
   **Baja** = `B`, **Summerfest** = `S`), por ubicación y por departamento.

El Excel se lee en el navegador y no se sube a ningún sitio. GitHub Pages no
ejecuta Python, así que el `.py` solo sirve para usarlo desde la terminal
(y solo lista las vacaciones del día siguiente, sin permisos ni filtros).

## Publicar en GitHub

```bash
git init
git add .
git commit -m "Primera versión: vacaciones del día siguiente"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

> El `.gitignore` ya excluye los archivos `.xlsx` para no subir datos
> personales de vacaciones al repositorio.
