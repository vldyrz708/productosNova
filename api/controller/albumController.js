const Album = require('../modules/Album');
const mongoose = require('mongoose');

// @desc    Obtener todos los álbumes con paginación y filtros
// @route   GET /api/albums
// @access  Public
const obtenerAlbumes = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtros opcionales
        const filtros = {};
        
        if (req.query.artista) {
            filtros.artista = { $regex: req.query.artista, $options: 'i' };
        }
        
        if (req.query.categoria) {
            filtros.categoria = { $in: req.query.categoria.split(',') };
        }
        
        if (req.query.disponible === 'true') {
            filtros.stock = { $gt: 0 };
            filtros.fechaLimiteVenta = { $gte: new Date() };
        }

        if (req.query.precioMin || req.query.precioMax) {
            filtros.precio = {};
            if (req.query.precioMin) filtros.precio.$gte = parseFloat(req.query.precioMin);
            if (req.query.precioMax) filtros.precio.$lte = parseFloat(req.query.precioMax);
        }

        const albums = await Album.find(filtros)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Album.countDocuments(filtros);

        res.status(200).json({
            success: true,
            data: albums,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Obtener un álbum por ID
// @route   GET /api/albums/:id
// @access  Public
const obtenerAlbumPorId = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Álbum no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el álbum',
            error: error.message
        });
    }
};

// @desc    Crear un nuevo álbum
// @route   POST /api/albums
// @access  Private
const crearAlbum = async (req, res, next) => {
    try {
        // Convertir strings a números para campos numéricos
        if (req.body.precio) req.body.precio = parseFloat(req.body.precio);
        if (req.body.stock) req.body.stock = parseInt(req.body.stock);
        if (req.body.pesoGramos) req.body.pesoGramos = parseFloat(req.body.pesoGramos);

        const album = await Album.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Álbum creado exitosamente',
            data: album
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Actualizar un álbum
// @route   PUT /api/albums/:id
// @access  Private
const actualizarAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Álbum no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Álbum actualizado exitosamente',
            data: album
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el álbum',
            error: error.message
        });
    }
};

// @desc    Eliminar un álbum permanentemente
// @route   DELETE /api/albums/:id
// @access  Private
const eliminarAlbum = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Buscar el álbum
        const album = await Album.findById(id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Álbum no encontrado'
            });
        }

        // Guardar información antes de eliminar
        const albumInfo = {
            id: album._id,
            nombreAlbum: album.nombreAlbum,
            artista: album.artista
        };

        // Eliminar permanentemente
        await Album.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Álbum eliminado permanentemente',
            data: albumInfo
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Búsqueda de álbumes por texto
// @route   GET /api/albums/search
// @access  Public
const buscarAlbumes = async (req, res) => {
    try {
        const { q, categoria, artista, precioMin, precioMax, disponible } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Construir query de búsqueda
        let query = {};

        // Búsqueda por texto
        if (q) {
            query.$text = { $search: q };
        }

        // Filtros adicionales
        if (categoria) {
            query.categoria = { $in: categoria.split(',') };
        }

        if (artista) {
            query.artista = { $regex: artista, $options: 'i' };
        }

        if (disponible === 'true') {
            query.stock = { $gt: 0 };
            query.fechaLimiteVenta = { $gte: new Date() };
        }

        if (precioMin || precioMax) {
            query.precio = {};
            if (precioMin) query.precio.$gte = parseFloat(precioMin);
            if (precioMax) query.precio.$lte = parseFloat(precioMax);
        }

        const albums = await Album.find(query)
            .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await Album.countDocuments(query);

        res.status(200).json({
            success: true,
            data: albums,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            searchQuery: q || 'Sin término de búsqueda'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en la búsqueda',
            error: error.message
        });
    }
};

// @desc    Obtener álbumes por artista
// @route   GET /api/albums/artista/:artista
// @access  Public
const obtenerAlbumesPorArtista = async (req, res) => {
    try {
        const artista = req.params.artista;
        const albums = await Album.find({
            artista: { $regex: artista, $options: 'i' }
        }).sort({ fechaLanzamiento: -1 });

        res.status(200).json({
            success: true,
            data: albums,
            count: albums.length,
            artista: artista
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener álbumes del artista',
            error: error.message
        });
    }
};

// @desc    Obtener álbumes por categoría
// @route   GET /api/albums/categoria/:categoria
// @access  Public
const obtenerAlbumesPorCategoria = async (req, res) => {
    try {
        const categoria = req.params.categoria;
        const albums = await Album.find({
            categoria: { $in: [categoria] }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: albums,
            count: albums.length,
            categoria: categoria
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener álbumes de la categoría',
            error: error.message
        });
    }
};

// @desc    Actualizar stock de un álbum
// @route   PATCH /api/albums/:id/stock
// @access  Private
const actualizarStock = async (req, res) => {
    try {
        const { cantidad } = req.body;
        
        if (typeof cantidad !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser un número'
            });
        }

        const album = await Album.findByIdAndUpdate(
            req.params.id,
            { $inc: { stock: cantidad } },
            { new: true, runValidators: true }
        );

        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Álbum no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: {
                id: album._id,
                nombreAlbum: album.nombreAlbum,
                stockAnterior: album.stock - cantidad,
                stockActual: album.stock
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el stock',
            error: error.message
        });
    }
};

// @desc    Obtener estadísticas de álbumes
// @route   GET /api/albums/stats
// @access  Public
const obtenerEstadisticas = async (req, res) => {
    try {
        const totalAlbumes = await Album.countDocuments({});
        const albumesDisponibles = await Album.countDocuments({
            stock: { $gt: 0 },
            fechaLimiteVenta: { $gte: new Date() }
        });
        
        const estadisticasPorCategoria = await Album.aggregate([
            { $unwind: '$categoria' },
            { $group: { _id: '$categoria', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const albumesMasCaros = await Album.find({})
            .sort({ precio: -1 })
            .limit(5)
            .select('nombreAlbum artista precio');

        res.status(200).json({
            success: true,
            data: {
                totalAlbumes,
                albumesDisponibles,
                albumesAgotados: totalAlbumes - albumesDisponibles,
                estadisticasPorCategoria,
                albumesMasCaros
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

module.exports = {
    obtenerAlbumes,
    obtenerAlbumPorId,
    crearAlbum,
    actualizarAlbum,
    eliminarAlbum,
    buscarAlbumes,
    obtenerAlbumesPorArtista,
    obtenerAlbumesPorCategoria,
    actualizarStock,
    obtenerEstadisticas
};