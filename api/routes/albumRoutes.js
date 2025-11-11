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

// Middleware para manejar archivos subidos y mapear campos del frontend
const procesarFotoAlbum = (req, res, next) => {
    // console.log('🔍 Datos recibidos antes del mapeo:', req.body);
    // console.log('📸 Archivo recibido:', req.file ? req.file.filename : 'ninguno');
    
    if (req.file) {
        // Guardar la ruta relativa del archivo
        req.body.fotoAlbum = `uploads/${req.file.filename}`;
    }
    
    // Mapear campos del frontend al modelo de backend
    if (req.body.artistaGrupo) {
        req.body.artista = req.body.artistaGrupo;
        delete req.body.artistaGrupo;
    }
    
    if (req.body.version) {
        req.body.versionAlbum = req.body.version;
        delete req.body.version;
    }
    
    if (req.body.peso) {
        req.body.pesoGramos = parseInt(req.body.peso);
        delete req.body.peso;
    }
    
    if (req.body.fechaCompra) {
        req.body.fechaAdquisicion = req.body.fechaCompra;
        delete req.body.fechaCompra;
    }
    
    if (req.body.fechaCaducidad) {
        req.body.fechaLimiteVenta = req.body.fechaCaducidad;
        delete req.body.fechaCaducidad;
    }
    
    // Convertir idioma a array si viene como string
    if (req.body.idioma && typeof req.body.idioma === 'string') {
        req.body.idioma = [req.body.idioma];
    }
    
    // Convertir categoria a array si viene como string
    if (req.body.categoria && typeof req.body.categoria === 'string') {
        req.body.categoria = [req.body.categoria];
    }
    
    // Agregar precio por defecto si no viene
    if (!req.body.precio) {
        req.body.precio = 0;
    }
    
    // console.log('✅ Datos después del mapeo:', req.body);
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

// Middleware para procesar datos JSON en PATCH (sin archivo)
const procesarCambiosJSON = (req, res, next) => {
    // Si no hay archivo, solo mapear campos del JSON
    if (!req.file && req.body) {
        // console.log('🔄 PATCH - Datos JSON recibidos:', req.body);
        
        // Mapear campos del frontend al backend
        if (req.body.artistaGrupo) {
            req.body.artista = req.body.artistaGrupo;
            delete req.body.artistaGrupo;
        }
        
        if (req.body.version) {
            req.body.versionAlbum = req.body.version;
            delete req.body.version;
        }
        
        if (req.body.peso) {
            req.body.pesoGramos = parseInt(req.body.peso);
            delete req.body.peso;
        }
        
        if (req.body.fechaCompra) {
            req.body.fechaAdquisicion = req.body.fechaCompra;
            delete req.body.fechaCompra;
        }
        
        if (req.body.fechaCaducidad) {
            req.body.fechaLimiteVenta = req.body.fechaCaducidad;
            delete req.body.fechaCaducidad;
        }
        
        // Convertir a array si es necesario
        if (req.body.idioma && typeof req.body.idioma === 'string') {
            req.body.idioma = [req.body.idioma];
        }
        
        if (req.body.categoria && typeof req.body.categoria === 'string') {
            req.body.categoria = [req.body.categoria];
        }
        
        // console.log('✅ PATCH - Datos después del mapeo:', req.body);
    }
    next();
};

// @route   PATCH /api/albums/:id
// @desc    Actualizar cualquier campo de un álbum
// @access  Private
router.patch('/:id', validarObjectId, procesarCambiosJSON, actualizarAlbum);

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