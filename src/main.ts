import { cargarCatalogo } from './catalogo.js';
import { pedirOpcion, pedirTexto } from './entrada.js';
import { disponiblesDe, estadoDe, multaDe, prestar, type Mostrador } from './dominio/prestamos.js';
import { LibroNoEncontradoError, SinEjemplaresError } from './dominio/tipos.js';

// El único archivo que habla con la persona. Aquí NO hay reglas de negocio:
// cuánto dura un préstamo y cuánto se cobra vive en dominio/prestamos.ts.

// El `as const` hace que TypeScript infiera los valores exactos y no `string`.
// Sin él, el switch de abajo no podría ser exhaustivo.
const OPCIONES = [
  { valor: 'prestar', etiqueta: 'Prestar un libro' },
  { valor: 'catalogo', etiqueta: 'Ver el catálogo' },
  { valor: 'prestamos', etiqueta: 'Ver los préstamos' },
  { valor: 'salir', etiqueta: 'Salir' },
] as const;

// El tipo sale de los datos: si se agrega una opción arriba, este tipo crece.
type Opcion = (typeof OPCIONES)[number]['valor'];

// pedirOpcion devuelve `string` porque no sabe cuáles son nuestras opciones.
// Esta guarda convierte ese texto en una Opcion de verdad.
function esOpcion(valor: string): valor is Opcion {
  return OPCIONES.some((o) => o.valor === valor);
}

const fecha = (d: Date) => d.toISOString().slice(0, 10);

function verCatalogo(m: Mostrador): void {
  console.log('\n  CATÁLOGO');
  for (const l of m.libros) {
    // anio es opcional, así que hay que decidir qué se imprime si no viene.
    const anio = l.anio === undefined ? 's/f' : l.anio;
    console.log(`  ${l.id}  ${l.titulo} · ${l.autor} · ${anio} · ${disponiblesDe(m, l)}/${l.ejemplares}`);
  }
  console.log('');
}

function verPrestamos(m: Mostrador, hoy: Date): void {
  if (m.prestamos.length === 0) return console.log('\n  Todavía no hay préstamos.\n');

  console.log('\n  PRÉSTAMOS');
  for (const p of m.prestamos) {
    const estado = estadoDe(p, hoy);
    const multa = multaDe(p, estado, hoy);
    console.log(`  ${p.folio}  ${p.socio} · vence ${fecha(p.venceEn)} · ${estado}${multa > 0 ? ` · multa $${multa}` : ''}`);
  }
  console.log('');
}

async function hacerPrestamo(m: Mostrador, hoy: Date): Promise<void> {
  const libroId = await pedirTexto('Identificador del libro (por ejemplo L-002)');
  if (libroId === undefined) return console.log('  Cancelado.\n');

  const socio = await pedirTexto('Nombre del socio');
  if (socio === undefined) return console.log('  Cancelado.\n');

  try {
    const p = prestar(m, libroId.toUpperCase(), socio, hoy);
    console.log(`\n  Listo. Folio ${p.folio}, vence el ${fecha(p.venceEn)}.\n`);
  } catch (error: unknown) {
    // `unknown` en el catch: lo que cae aquí puede ser cualquier cosa, así que
    // hay que estrecharlo con instanceof antes de leerle el mensaje.
    if (error instanceof LibroNoEncontradoError || error instanceof SinEjemplaresError) {
      return console.log(`\n  No se pudo: ${error.message}\n`);
    }
    throw error; // lo que no reconocemos, no lo silenciamos
  }
}

async function main(): Promise<void> {
  const { libros, descartados } = cargarCatalogo('datos/catalogo.json');
  console.log('\n  ===  MOSTRADOR DE LA BIBLIOTECA  ===\n');
  console.log(`  ${libros.length} libros cargados.`);
  if (descartados > 0) {
    console.log(`  ${descartados} registro(s) se descartaron por venir mal formados.`);
  }

  // La fecha se lee UNA vez y se pasa al dominio. Así el programa se puede
  // correr "otro día" cambiando esta línea.
  const hoy = new Date();
  const m: Mostrador = { libros, prestamos: [] };

  for (; ;) {
    const elegido = await pedirOpcion('¿Qué se va a hacer?', OPCIONES);

    // Ctrl+C llega hasta aquí como undefined.
    if (elegido === undefined || !esOpcion(elegido)) {
      console.log('\n  Hasta luego.\n');
      return;
    }

    switch (elegido) {
      case 'prestar':
        await hacerPrestamo(m, hoy);
        break;
      case 'catalogo':
        verCatalogo(m);
        break;
      case 'prestamos':
        verPrestamos(m, hoy);
        break;
      case 'salir':
        console.log('\n  Hasta luego.\n');
        return;
      default: {
        const _exhaustivo: never = elegido;
        throw new Error(`Opción sin manejar: ${String(_exhaustivo)}`);
      }
    }
  }
}

void main();
