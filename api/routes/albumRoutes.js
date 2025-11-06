const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Importar middlewares de validación
const {
    validarObjectId,
    validarCrearAlbum,
    validarActualizarAlbum,
    validarPaginacion,
    validarFiltrosPrecio
} = require('../middleware/validaciones');

// Importar controlador
const {
    obtenerAlbumes,
    obtenerAlbumPorId,
    crearAlbum,
    actualizarAlbum,
    eliminarAlbum,
    buscarAlbumes,
    obtenerAlbumesPorArtista,
    obtenerAlbumesPorCategoria,
    obtenerEstadisticas
} = require('../controller/albumController');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueName = `album-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Permitir solo imágenes
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: fileFilter
});

// Middleware para manejar archivos subidos
const procesarFotoAlbum = (req, res, next) => {
    if (req.file) {
        // Guardar la ruta relativa del archivo
        req.body.fotoAlbum = `uploads/${req.file.filename}`;
    }
    next();
};

// ================================
// RUTAS PRINCIPALES
// ================================

// @route   GET /api/albums/stats
// @desc    Obtener estadísticas generales
// @access  Public
router.get('/stats', obtenerEstadisticas);

// @route   GET /api/albums/search
// @desc    Buscar álbumes por texto y filtros
// @access  Public
router.get('/search', validarPaginacion, validarFiltrosPrecio, buscarAlbumes);

// @route   GET /api/albums/artista/:artista
// @desc    Obtener álbumes por artista
// @access  Public
router.get('/artista/:artista', obtenerAlbumesPorArtista);

// @route   GET /api/albums/categoria/:categoria
// @desc    Obtener álbumes por categoría
// @access  Public
router.get('/categoria/:categoria', obtenerAlbumesPorCategoria);

// @route   GET /api/albums
// @desc    Obtener todos los álbumes con paginación y filtros
// @access  Public
router.get('/', validarPaginacion, validarFiltrosPrecio, obtenerAlbumes);

// @route   POST /api/albums
// @desc    Crear un nuevo álbum
// @access  Private
router.post('/', upload.single('fotoAlbum'), procesarFotoAlbum, validarCrearAlbum, crearAlbum);

// @route   GET /api/albums/:id
// @desc    Obtener un álbum por ID
// @access  Public
router.get('/:id', validarObjectId, obtenerAlbumPorId);

// @route   PATCH /api/albums/:id
// @desc    Actualizar cualquier campo de un álbum
// @access  Private
router.patch('/:id', validarObjectId, upload.single('fotoAlbum'), procesarFotoAlbum, validarActualizarAlbum, actualizarAlbum);

// @route   DELETE /api/albums/:id
// @desc    Eliminar un álbum permanentemente
// @access  Private
router.delete('/:id', validarObjectId, eliminarAlbum);

// ================================
// MANEJO DE ERRORES DE MULTER
// ================================
const { manejoErrores } = require('../middleware/errores');

// Aplicar middleware de manejo de errores a las rutas
router.use(manejoErrores);

module.exports = router;