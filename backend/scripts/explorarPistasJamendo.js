/**
 * explorarPistasJamendo.js
 *
 * Fase 7.3 - Soul Station: exploración de pistas reales en Jamendo.
 *
 * Qué hace:
 * 1. Consulta la API pública de Jamendo (v3.0) por cada género definido en CATEGORIAS.
 * 2. Pagina automáticamente (offset) porque Jamendo limita a 200 resultados por
 *    consulta, y queremos un pool grande (180 tracks totales) para poder armar
 *    playlists distintas cada día más adelante en la Fase 8.
 * 3. Filtra del lado del cliente cualquier track cuya licencia (license_ccurl)
 *    no permita uso comercial (descarta "nc" = non-commercial).
 * 4. Filtra tracks de menos de 3 minutos (180 segundos).
 * 5. Se detiene por categoría en cuanto junta la cantidadDeseada, o al llegar
 *    al tope de páginas de seguridad (paginasMaximas), lo que pase primero.
 * 6. Guarda los resultados filtrados en un archivo JSON local para revisión manual.
 *
 * Esto NO carga nada en MongoDB todavía. Es solo exploración/curaduría.
 * La carga real se hace después con cargarSoulStation.js usando el
 * endpoint ya existente POST /api/soul-station.
 *
 * Uso:
 *   1. Configurar JAMENDO_CLIENT_ID en tu .env (backend/.env)
 *   2. node scripts/explorarPistasJamendo.js
 *   3. Revisar el archivo generado: backend/scripts/candidatos-soul-station.json
 *
 * Buenas prácticas aplicadas:
 * - Reutilizable: buscarPorGenero() y las funciones de filtro sirven para
 *   cualquier género o criterio nuevo sin tocar el resto del script.
 * - Escalable: agregar una categoría nueva es solo una línea en CATEGORIAS;
 *   la paginación se adapta sola sin importar cuántos tracks se pidan.
 * - Seguro: el client_id se lee de variable de entorno, nunca hardcodeado.
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = process.env.JAMENDO_CLIENT_ID;

if (!CLIENT_ID) {
  console.error('ERROR: falta JAMENDO_CLIENT_ID en tu archivo .env');
  process.exit(1);
}

const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0/tracks/';

// Límite máximo de resultados por página que permite la API de Jamendo.
const RESULTADOS_POR_PAGINA = 200;

// Duración mínima aceptada para Soul Station: 3 minutos (180 segundos).
const DURACION_MINIMA_SEGUNDOS = 180;

// Distribución acordada: 180 pistas totales (pool grande para rotación diaria futura)
const CATEGORIAS = [
  { nombre: 'post-punk-dark-wave', tag: 'darkwave gothic newwave synthpop postpunk', cantidadDeseada: 34, paginasMaximas: 8 },
  { nombre: 'funk', tag: 'funk soul groove disco boogie fusion', cantidadDeseada: 30, paginasMaximas: 8 },
  { nombre: 'psicodelico-experimental', tag: 'psychedelic experimental', cantidadDeseada: 32, paginasMaximas: 8 },
  { nombre: 'rock', tag: 'rock alternative indierock hardrock classicrock', cantidadDeseada: 32, paginasMaximas: 8 },
  { nombre: 'hip-hop-old-school', tag: 'hiphop oldschool', cantidadDeseada: 26, paginasMaximas: 8 },
  { nombre: 'city-pop-andino', tag: 'citypop andean world', cantidadDeseada: 26, paginasMaximas: 8 },
];

function permiteUsoComercial(licenseCcurl) {
  if (!licenseCcurl) return false;
  return !licenseCcurl.includes('nc');
}

function duracionAceptable(duracionSegundos) {
  return duracionSegundos >= DURACION_MINIMA_SEGUNDOS;
}

async function pedirPagina(categoria, offset) {
  const params = {
    client_id: CLIENT_ID,
    format: 'json',
    limit: RESULTADOS_POR_PAGINA,
    offset,
    fuzzytags: categoria.tag,
    include: 'musicinfo',
    audioformat: 'mp32',
  };

  const respuesta = await axios.get(JAMENDO_BASE_URL, { params });
  return respuesta.data.results || [];
}

async function buscarPorGenero(categoria) {
  const encontrados = [];
  const idsVistos = new Set();
  let totalEscaneados = 0;
  let pagina = 0;

  while (encontrados.length < categoria.cantidadDeseada && pagina < categoria.paginasMaximas) {
    const offset = pagina * RESULTADOS_POR_PAGINA;
    let resultados;

    try {
      resultados = await pedirPagina(categoria, offset);
    } catch (error) {
      console.error(`Error consultando "${categoria.nombre}" (página ${pagina + 1}):`, error.message);
      break;
    }

    totalEscaneados += resultados.length;

    if (resultados.length === 0) break;

    for (const track of resultados) {
      if (idsVistos.has(track.id)) continue;
      idsVistos.add(track.id);

      if (!permiteUsoComercial(track.license_ccurl)) continue;
      if (!duracionAceptable(track.duration)) continue;

      encontrados.push({
        titulo: track.name,
        artista: track.artist_name,
        duracionSegundos: track.duration,
        url: track.audiodownload || track.audio,
        licencia: track.license_ccurl,
        paginaJamendo: track.shareurl,
      });

      if (encontrados.length >= categoria.cantidadDeseada) break;
    }

    pagina += 1;
  }

  console.log(
    `[${categoria.nombre}] ${totalEscaneados} tracks escaneados en ${pagina} página(s), ${encontrados.length} con licencia comercial + duración válida (se necesitan ${categoria.cantidadDeseada})`
  );

  return {
    categoria: categoria.nombre,
    cantidadDeseada: categoria.cantidadDeseada,
    candidatos: encontrados,
  };
}

async function main() {
  console.log('Consultando la API de Jamendo por categoría (con paginación)...\n');

  const resultadosPorCategoria = [];

  for (const categoria of CATEGORIAS) {
    const resultado = await buscarPorGenero(categoria);
    resultadosPorCategoria.push(resultado);
  }

  const outputPath = path.join(__dirname, 'candidatos-soul-station.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultadosPorCategoria, null, 2), 'utf-8');

  const totalFinal = resultadosPorCategoria.reduce((acc, r) => acc + r.candidatos.length, 0);

  console.log(`\nListo. ${totalFinal} candidatos guardados en: ${outputPath}`);
  console.log('Abrí ese archivo, escuchá los links de "paginaJamendo" y elegí cuáles quedan.');

  resultadosPorCategoria.forEach((r) => {
    if (r.candidatos.length < r.cantidadDeseada) {
      console.warn(
        `ATENCIÓN: la categoría "${r.categoria}" solo tiene ${r.candidatos.length} candidatos válidos, se necesitan ${r.cantidadDeseada}. Considerá ampliar el tag de búsqueda o subir paginasMaximas.`
      );
    }
  });
}

main();