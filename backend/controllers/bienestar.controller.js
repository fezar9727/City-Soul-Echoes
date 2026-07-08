const axios = require('axios');
const BienestarCache = require('../models/BienestarCache');

// Mismo patrón de caché de 2 horas usado en noticiaCache.controller.js
const DURACION_CACHE_MS = 2 * 60 * 60 * 1000;

// ============================================
// DATOS FIJOS — Moda Inclusiva (sin API externa)
// Curado manualmente, con datos reales verificados.
// ============================================
const PERFILES_MODA_INCLUSIVA = [
    {
        titulo: 'Adriana Convers ("Fat Pandora")',
        descripcion: 'Bloguera y activista contra la gordofobia desde 2012. Lideró colecciones plus size con Falabella Colombia.',
        pais: 'Colombia',
        enlaceOficial: 'https://www.instagram.com/fatpandora'
    },
    {
        titulo: 'Guío Domínguez',
        descripcion: 'Diseñador que creó la primera agencia de modelos con discapacidad de Latinoamérica.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Andrea Saieh',
        descripcion: 'Presentó en la New York Fashion Week una colección para personas con atrofia muscular espinal.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Genesis Webb',
        descripcion: 'Stylist con estética glam punk y vintage, expresión libre sin encajar en un solo molde.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Dealer Bra',
        descripcion: 'Rapero y stylist urbano, deconstrucción de prendas y siluetas no convencionales.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Tokiostyling',
        descripcion: 'Estética cyberpunk y retro-futurista; ha vestido a Villano Antillano, ícono trans de la música urbana latina.',
        pais: 'Colombia',
        enlaceOficial: 'https://www.instagram.com/tokiostyling'
    },
    {
        titulo: 'KONTRA*',
        descripcion: 'Marca bogotana nacida del grafiti en 2011, moda como voz de la cultura callejera.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Jerfo',
        descripcion: 'Diseño futurista que experimenta con reasignación de materiales.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Pepa Pombo',
        descripcion: 'Marca colombiana presente en pasarelas inclusivas internacionales.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Vivienne Westwood',
        descripcion: 'La "Reina del Punk" — legitimó lo alternativo como lenguaje de moda serio y respetado mundialmente.',
        pais: 'Reino Unido',
        enlaceOficial: ''
    },
    {
        titulo: 'Winnie Harlow',
        descripcion: 'Supermodelo con vitiligo, primera en llegar a pasarelas de alta costura y al Victoria\'s Secret Fashion Show.',
        pais: 'Canadá',
        enlaceOficial: 'https://www.instagram.com/winnieharlow'
    },
    {
        titulo: 'Perla del Caribe González Ipuana',
        descripcion: 'Diseñadora indígena wayuu, fundadora de Akumajaa, ganadora del premio "Hilo Dorado" en Miami.',
        pais: 'Colombia (Wayuu)',
        enlaceOficial: ''
    },
    {
        titulo: 'Hernán Zajar',
        descripcion: 'Fusiona artesanía wayuu con alta costura internacional; ha vestido a Shakira y Gloria Estefan.',
        pais: 'Colombia',
        enlaceOficial: ''
    },
    {
        titulo: 'Andy Warhol',
        descripcion: 'Referencia cultural y artística (no fue diseñador de moda) — su obra pop art influyó profundamente la forma en que arte, moda y fama se entrelazan.',
        pais: 'Estados Unidos',
        enlaceOficial: ''
    }
];

// ============================================
// FUNCIONES POR CATEGORÍA — cada una sabe cómo obtener sus propios datos
// ============================================

async function obtenerRutaVegana() {
    const respuesta = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegan');
    const comidas = respuesta.data.meals || [];

    return comidas.slice(0, 6).map((comida) => ({
        titulo: comida.strMeal,
        descripcion: 'Receta vegana',
        imagenUrl: comida.strMealThumb,
        enlaceOficial: `https://www.themealdb.com/meal/${comida.idMeal}`,
        pais: ''
    }));
}

async function obtenerSaludMental() {
    const respuesta = await axios.get('https://zenquotes.io/api/quotes');
    const citas = respuesta.data || [];

    return citas.slice(0, 6).map((cita) => ({
        titulo: cita.q,
        descripcion: cita.a,
        imagenUrl: '',
        enlaceOficial: '',
        pais: ''
    }));
}

function obtenerModaInclusiva() {
    return PERFILES_MODA_INCLUSIVA;
}

// Mapa de categoría → función que la resuelve.
const RESOLVERES_POR_CATEGORIA = {
    'vegana': obtenerRutaVegana,
    'salud-mental': obtenerSaludMental,
    'moda-inclusiva': obtenerModaInclusiva
};

// ============================================
// CONTROLLER PRINCIPAL — patrón cache-aside, igual que noticias
// ============================================
const obtenerBienestarPorCategoria = async (req, res) => {
    try {
        const { categoria } = req.query;

        if (!categoria || !RESOLVERES_POR_CATEGORIA[categoria]) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Categoría inválida. Usa: vegana, salud-mental o moda-inclusiva'
            });
        }

        const cacheExistente = await BienestarCache.findOne({ categoria });
        const ahora = Date.now();
        const cacheVigente = cacheExistente &&
            (ahora - cacheExistente.fechaActualizacion.getTime() < DURACION_CACHE_MS);

        if (cacheVigente) {
            return res.status(200).json({
                ok: true,
                categoria,
                items: cacheExistente.items,
                fuente: 'cache'
            });
        }

        try {
            const resolver = RESOLVERES_POR_CATEGORIA[categoria];
            const items = await resolver();

            const actualizado = await BienestarCache.findOneAndUpdate(
                { categoria },
                { items, fechaActualizacion: new Date() },
                { new: true, upsert: true, runValidators: true }
            );

            return res.status(200).json({
                ok: true,
                categoria,
                items: actualizado.items,
                fuente: 'api'
            });

        } catch (errorApi) {
            if (cacheExistente) {
                return res.status(200).json({
                    ok: true,
                    categoria,
                    items: cacheExistente.items,
                    fuente: 'cache-vencido'
                });
            }
            throw errorApi;
        }

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener contenido de bienestar',
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { obtenerBienestarPorCategoria };