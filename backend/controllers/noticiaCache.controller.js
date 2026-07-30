const axios = require('axios');
const NoticiaCache = require('../models/NoticiaCache');

// Duración del caché antes de considerarse vencido — 2 horas en milisegundos
const DURACION_CACHE_MS = 2 * 60 * 60 * 1000;

const NEWSDATA_BASE_URL = 'https://newsdata.io/api/1/news';

// Configuración de cada categoría — su query específica para NewsData.io
const CONFIG_CATEGORIAS = {
    noticias: {
        variantes: [
            { language: 'es', category: 'top' },
            { language: 'es', category: 'world' }
        ]
    },
    cultura: {
        variantes: [
            { country: 'co', language: 'es', category: 'entertainment', q: 'arte OR cultura' },
            { language: 'es', category: 'entertainment', q: 'música OR cine OR literatura' }
        ]
    },
    videojuegos: {
        variantes: [
            { language: 'es', category: 'technology', qInTitle: 'videojuego OR gaming OR "PlayStation" OR "Xbox" OR "Nintendo Switch"' },
            { language: 'es', category: 'technology', qInTitle: '"GTA 6" OR "Resident Evil" OR "Final Fantasy" OR "Call of Duty" OR esports' },
            { language: 'es', category: 'technology', qInTitle: '"Steam" OR "PC gaming" OR "juego indie" OR eSports' }
        ]
    }
};

// Normaliza la respuesta de NewsData.io hacia el formato de nuestro articuloSchema
// Reduce un título a una forma "esqueleto" para comparar similitud real:
// minúsculas, sin comillas/tildes de puntuación, sin espacios dobles.
// Así "decirle no" y "contradecir" en el mismo titular no engañan al
// deduplicador — solo cambia lo accesorio, la estructura de fondo es igual.
const normalizarTituloParaComparar = (titulo) => {
    return titulo
        .toLowerCase()
        .replace(/["'"]/g, '')
        .replace(/[¿?¡!.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const normalizarArticulos = (resultados) => {
    const articulos = resultados.map((articulo) => ({
        titulo: articulo.title,
        descripcion: articulo.description,
        url: articulo.link,
        urlImagen: articulo.image_url,
        fuente: articulo.source_id,
        fechaPublicacion: articulo.pubDate
    }));

    // Elimina duplicados comparando la versión normalizada del título,
    // no el texto exacto — así detecta variantes del mismo titular
    // (mismo medio republicando con una palabra distinta).
    const titulosVistos = new Set();
    return articulos.filter((articulo) => {
        const clave = normalizarTituloParaComparar(articulo.titulo);
        if (titulosVistos.has(clave)) return false;
        titulosVistos.add(clave);
        return true;
    });
};

// Golpea NewsData.io para una categoría específica y devuelve los artículos normalizados
const consultarNewsData = async (categoria) => {
    const config = CONFIG_CATEGORIAS[categoria];

    // Ejecuta todas las variantes de consulta en paralelo. Si una falla
    // (por ejemplo, por límite de la API), se ignora esa sola llamada
    // en vez de tumbar la categoría entera.
    const resultadosPorVariante = await Promise.all(
        config.variantes.map((params) =>
            axios.get(NEWSDATA_BASE_URL, {
                params: { apikey: process.env.NEWS_API_KEY, ...params }
            })
                .then((respuesta) => respuesta.data.results || [])
                .catch(() => [])
        )
    );

    const articulosCombinados = resultadosPorVariante.flat();
    return normalizarArticulos(articulosCombinados);
};

// Lógica central de cache-aside — reutilizable para las 3 categorías
// Evita que un mismo artículo (por título) aparezca en dos categorías
// distintas a la vez — por ejemplo, una noticia sobre Nintendo Switch
// que ya salió en "videojuegos" no debería repetirse en "cultura".
const filtrarRepetidosDeOtrasCategorias = async (categoriaActual, articulos) => {
    const otrasCategorias = Object.keys(CONFIG_CATEGORIAS).filter((c) => c !== categoriaActual);
    const cachesDeOtras = await NoticiaCache.find({ categoria: { $in: otrasCategorias } });

    const titulosEnOtrasCategorias = new Set();
    cachesDeOtras.forEach((cache) => {
        cache.articulos.forEach((articulo) => titulosEnOtrasCategorias.add(articulo.titulo));
    });

    return articulos.filter((articulo) => !titulosEnOtrasCategorias.has(articulo.titulo));
};

const obtenerNoticiasPorCategoria = async (categoria) => {
    const cacheExistente = await NoticiaCache.findOne({ categoria });
    const cacheVencido = !cacheExistente ||
        (Date.now() - cacheExistente.fechaActualizacion.getTime() > DURACION_CACHE_MS);
    if (!cacheVencido) {
        return cacheExistente;
    }
    try {
        const articulosFrescos = await consultarNewsData(categoria);
        const articulosSinRepetir = await filtrarRepetidosDeOtrasCategorias(categoria, articulosFrescos);
        const cacheActualizado = await NoticiaCache.findOneAndUpdate(
            { categoria },
            {
                categoria,
                articulos: articulosSinRepetir,
                fechaActualizacion: Date.now()
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );
        return cacheActualizado;
    } catch (error) {
        if (cacheExistente) {
            return cacheExistente;
        }
        throw error;
    }
};

// GET /api/noticias?categoria=noticias|cultura|videojuegos
const obtenerNoticias = async (req, res) => {
    try {
        const { categoria } = req.query;

        if (!categoria || !CONFIG_CATEGORIAS[categoria]) {
            return res.status(400).json({
                mensaje: 'La categoría debe ser: noticias, cultura o videojuegos'
            });
        }

        const resultado = await obtenerNoticiasPorCategoria(categoria);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las noticias',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { obtenerNoticias };