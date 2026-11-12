/*
 * vacaciones.js — lógica para localizar quién tiene vacaciones en una fecha.
 *
 * Es la misma lógica que vacaciones_manana.py, pero para el navegador.
 * No depende de la página: recibe filas y celdas combinadas ya leídas del
 * Excel, así que también se puede probar desde Node.
 *
 * Estructura esperada de la hoja (índices en base 0):
 *   fila 1 -> nombre del mes en celdas combinadas ("SEPTIEMBRE")
 *   fila 3 -> número de día del mes
 *   fila 4+ -> una fila por persona (col A = departamento, C = persona,
 *              D = horas trabajadas), calendario desde la columna J.
 *   "V" en el calendario = vacaciones.
 */
(function (root) {
  "use strict";

  const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
  ];

  // Ajusta estas constantes si cambia la plantilla del Excel.
  const CFG = {
    filaMeses: 1,
    filaNumDia: 3,
    primeraFilaPersonas: 4,
    colDepartamento: 0,
    colPersona: 2,
    colHoras: 3,
    codigoVacaciones: "V",
    filasVaciasParaParar: 5,
  };

  function normalizar(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function letraColumna(indice0) {
    let n = indice0 + 1;
    let s = "";
    while (n > 0) {
      const r = (n - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }

  function bloquesDeMes(rows, merges) {
    const bloques = [];
    for (const m of merges || []) {
      if (m.s.r === CFG.filaMeses && m.e.r === CFG.filaMeses) {
        const valor = (rows[m.s.r] || [])[m.s.c];
        bloques.push({ ini: m.s.c, fin: m.e.c, mes: normalizar(valor) });
      }
    }
    bloques.sort((a, b) => a.ini - b.ini);
    return bloques;
  }

  function tieneBloquesDeMes(datos) {
    return bloquesDeMes(datos.rows, datos.merges).some((b) => MESES.includes(b.mes));
  }

  /** Elige la hoja del calendario: primero las que se llaman "vacaciones",
   *  después cualquier hoja que tenga los bloques de meses. */
  function elegirHoja(nombres, getDatos) {
    const porNombre = nombres.filter((n) => normalizar(n).includes("VACACIONES"));
    const resto = nombres.filter((n) => !porNombre.includes(n));
    for (const n of porNombre.concat(resto)) {
      if (tieneBloquesDeMes(getDatos(n))) return n;
    }
    throw new Error(
      "No se encontró ninguna hoja con el calendario de vacaciones (hojas del libro: " +
        nombres.join(", ") + ")."
    );
  }

  function localizarColumnaDia(datos, fecha, anioHoja) {
    const nombreMes = MESES[fecha.getMonth()];
    const candidatos = bloquesDeMes(datos.rows, datos.merges).filter((b) => b.mes === nombreMes);
    if (candidatos.length === 0) {
      throw new Error("No se encontró el mes '" + nombreMes + "' en la hoja.");
    }

    let bloque;
    if (fecha.getFullYear() === anioHoja) {
      bloque = candidatos[0];
    } else if (fecha.getFullYear() === anioHoja + 1) {
      // 1 de enero del año siguiente: bloque extra de ENERO al final.
      bloque = candidatos[candidatos.length - 1];
    } else {
      throw new Error(
        "La fecha " + fecha.toLocaleDateString("es-ES") +
        " no corresponde al año de la hoja (" + anioHoja + ")."
      );
    }

    const filaDias = datos.rows[CFG.filaNumDia] || [];
    for (let c = bloque.ini; c <= bloque.fin; c++) {
      if (Number(filaDias[c]) === fecha.getDate()) return c;
    }
    throw new Error("No se encontró el día " + fecha.getDate() + " en el bloque de " + nombreMes + ".");
  }

  function personasConVacaciones(datos, columna) {
    const resultado = [];
    let deptoActual = null;
    let vacias = 0;

    for (let r = CFG.primeraFilaPersonas; r < datos.rows.length; r++) {
      const fila = datos.rows[r] || [];
      const horas = fila[CFG.colHoras];
      const esPersona = typeof horas === "number" && isFinite(horas);

      if (esPersona) {
        vacias = 0;
        const depto = fila[CFG.colDepartamento];
        if (depto) deptoActual = String(depto);

        const valor = fila[columna];
        if (typeof valor === "string" && valor.trim().toUpperCase() === CFG.codigoVacaciones) {
          resultado.push({
            persona: String(fila[CFG.colPersona]),
            departamento: deptoActual,
          });
        }
      } else {
        vacias++;
        if (vacias >= CFG.filasVaciasParaParar) break; // lo que sigue es la leyenda
      }
    }
    return resultado;
  }

  function calcular(datos, fecha, anioHoja) {
    const columna = localizarColumnaDia(datos, fecha, anioHoja);
    return { columna: letraColumna(columna), personas: personasConVacaciones(datos, columna) };
  }

  const api = { MESES, CFG, elegirHoja, calcular, letraColumna };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Vacaciones = api;
})(typeof self !== "undefined" ? self : this);
