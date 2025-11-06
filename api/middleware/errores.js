// Middleware para manejo centralizado de errores
const manejoErrores = (error, req, res, next) => {
    console.error('Error:', error);

    let respuestaError = {
        success: false,
        message: 'Error interno del servidor'
    };

    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
        const errores = Object.values(error.errors).map(e => e.message);
        respuestaError = {
            success: false,
            message: 'Errores de validación',
            errores: errores
        };
        return res.status(400).json(respuestaError);
    }

    // Error de duplicado (índice único)
    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue)[0];
        respuestaError = {
            success: false,
            message: `Ya existe un álbum con ese ${campo}`
        };
        return res.status(400).json(respuestaError);
    }

    // Error de casting (ID inválido)
    if (error.name === 'CastError') {
        respuestaError = {
            success: false,
            message: 'ID de álbum no válido'
        };
        return res.status(400).json(respuestaError);
    }

    // Error de conexión a la base de datos
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
        respuestaError = {
            success: false,
            message: 'Error de conexión a la base de datos'
        };
        return res.status(503).json(respuestaError);
    }

    // Error de archivo muy grande
    if (error.code === 'LIMIT_FILE_SIZE') {
        respuestaError = {
            success: false,
            message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
        };
        return res.status(400).json(respuestaError);
    }

    // Error de tipo de archivo no permitido
    if (error.message && error.message.includes('Solo se permiten archivos de imagen')) {
        respuestaError = {
            success: false,
            message: error.message
        };
        return res.status(400).json(respuestaError);
    }

    // Error genérico del servidor
    res.status(500).json(respuestaError);
};

// Middleware para capturar rutas no encontradas
const rutaNoEncontrada = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        endpoints_disponibles: {
            albums: '/api/albums',
            search: '/api/albums/search',
            stats: '/api/albums/stats'
        }
    });
};

// Middleware para logging de requests
const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
};

// Middleware para sanitizar entrada
const sanitizarEntrada = (req, res, next) => {
    // Limpiar strings de caracteres peligrosos
    const limpiarString = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, '');
    };

    // Sanitizar req.body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = limpiarString(req.body[key]);
            }
        });
    }

    // Sanitizar req.query
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = limpiarString(req.query[key]);
            }
        });
    }

    next();
};

module.exports = {
    manejoErrores,
    rutaNoEncontrada,
    logRequest,
    sanitizarEntrada
};