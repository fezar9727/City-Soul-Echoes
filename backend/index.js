require('dotenv').config();

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');


const conectarDB  = require('./config/db');
const authRoutes  = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');

const obraRoutes = require('./routes/obra.routes');
const eventoRoutes = require('./routes/evento.routes');
const cursoRoutes = require('./routes/curso.routes');
const productoRoutes = require('./routes/producto.routes');
const publicacionRoutes = require('./routes/publicacion.routes');
const soulstationRoutes = require('./routes/soulstation.routes');

const app = express();

conectarDB();

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$')) delete obj[key];
                else sanitize(obj[key]);
            });
        }
    };
    sanitize(req.body);
    sanitize(req.query);
    next();
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, mensaje: 'Demasiadas solicitudes — intenta de nuevo en 15 minutos' }
});
app.use('/api', limiter);

app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: '🎵 API de City Soul Echoes funcionando correctamente',
        version: '1.0.0',
        entorno: process.env.NODE_ENV
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// y aqui lo nuevo tambien ??

app.use('/api/obras', obraRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/soul-station', soulstationRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err.stack);
    res.status(500).json({ ok: false, mensaje: 'Error interno del servidor', detalle: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend permitido: ${process.env.CLIENT_URL}`);
});