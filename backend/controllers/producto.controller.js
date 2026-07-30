const Producto = require('../models/Producto');

const crearProducto = async (req, res) => {
    try {
        const { titulo, descripcion, precio, categoria, imagenes, stock } = req.body;

        const existe = await Producto.findOne({ titulo, vendedor: req.usuario._id });
        if (existe) {
            return res.status(409).json({ ok: false, mensaje: 'Ya tienes un producto con ese título' });
        }

        const producto = await Producto.create({
            titulo, descripcion, precio, categoria,
            imagenes, stock,
            vendedor: req.usuario._id
        });

        res.status(201).json({ ok: true, producto });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al crear el producto', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerProductos = async (req, res) => {
    try {
        const { categoria } = req.query;
        const filtro = { disponible: true };
        if (categoria) filtro.categoria = categoria;

        const productos = await Producto.find(filtro)
            .populate('vendedor', 'nombreCompleto perfilArtista.nombreArtistico')
            .sort({ createdAt: -1 });

        res.status(200).json({ ok: true, total: productos.length, productos });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los productos', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const obtenerProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id)
            .populate('vendedor', 'nombreCompleto perfilArtista.nombreArtistico');

        if (!producto) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
        }

        res.status(200).json({ ok: true, producto });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el producto', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
        }

        if (producto.vendedor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para editar este producto' });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        res.status(200).json({ ok: true, producto: productoActualizado });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el producto', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
        }

        if (producto.vendedor.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar este producto' });
        }

        await producto.deleteOne();

        res.status(200).json({ ok: true, mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el producto', detalle: process.env.NODE_ENV === 'development' ? error.message : undefined });
    }
};

module.exports = { crearProducto, obtenerProductos, obtenerProducto, actualizarProducto, eliminarProducto };