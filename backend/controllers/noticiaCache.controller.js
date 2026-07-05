const axios = require('axios');
const NoticiaCache = require('../models/NoticiaCache');

// Duración del caché antes de considerarse vencido — 2 horas en milisegundos
const DURACION_CACHE_MS = 2 * 60 * 60 * 1000;

const NEWSDATA_BASE_URL = 'https://newsdata.io/api/1/news';

// Configuración de cada categoría — su query específica para NewsData.io
const CONFIG_CATEGORIAS = {
    noticias: {
        params: { language: 'es', category: 'top' }
    },
    cultura: {
        params: { country: 'co', language: 'es', category: 'entertainment', q: 'arte OR cultura' }
    },
    videojuegos: {
        params: {
            language: 'es',
            category: 'technology',
            qInTitle: 'videojuego OR gaming OR PlayStation OR Xbox OR Nintendo OR "GTA 6" OR Switch'
        }
    }
};

// Normaliza la respuesta de NewsData.io hacia el formato de nuestro articuloSchema
const normalizarArticulos = (resultados) => {
    const articulos = resultados.map((articulo) => ({
        titulo: articulo.title,
        descripcion: articulo.description,
        url: articulo.link,
        urlImagen: articulo.image_url,
        fuente: articulo.source_id,
        fechaPublicacion: articulo.pubDate
    }));

    // Elimina duplicados — se queda con el primero que aparece por cada título repetido
    const titulosVistos = new Set();
    return articulos.filter((articulo) => {
        if (titulosVistos.has(articulo.titulo)) return false;
        titulosVistos.add(articulo.titulo);
        return true;
    });
};

// Golpea NewsData.io para una categoría específica y devuelve los artículos normalizados
const consultarNewsData = async (categoria) => {
    const config = CONFIG_CATEGORIAS[categoria];

    const respuesta = await axios.get(NEWSDATA_BASE_URL, {
        params: {
            apikey: process.env.NEWS_API_KEY,
            ...config.params
        }
    });

    return normalizarArticulos(respuesta.data.results || []);
};

// Lógica central de cache-aside — reutilizable para las 3 categorías
const obtenerNoticiasPorCategoria = async (categoria) => {
    const cacheExistente = await NoticiaCache.findOne({ categoria });

    const cacheVencido = !cacheExistente ||
        (Date.now() - cacheExistente.fechaActualizacion.getTime() > DURACION_CACHE_MS);

    if (!cacheVencido) {
        return cacheExistente;
    }

    try {
        const articulosFrescos = await consultarNewsData(categoria);

        const cacheActualizado = await NoticiaCache.findOneAndUpdate(
            { categoria },
            {
                categoria,
                articulos: articulosFrescos,
                fechaActualizacion: Date.now()
            },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        return cacheActualizado;
    } catch (error) {
        // Si NewsData.io falla pero ya teníamos caché (aunque vencido), lo servimos igual
        // en vez de dejar la sección vacía — mejor mostrar algo desactualizado que nada
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