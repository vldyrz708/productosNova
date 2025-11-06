const mongoose = require('mongoose');

// Validar que el ID sea un ObjectId válido de MongoDB
const validarObjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID de álbum no válido'
        });
    }
    
    next();
};

// Validar campos requeridos para crear álbum
const validarCrearAlbum = (req, res, next) => {
    const camposRequeridos = [
        'nombreAlbum',
        'artista',
        'versionAlbum',
        'fechaLanzamiento',
        'idioma',
        'duracion',
        'pesoGramos',
        'precio',
        'stock',
        'categoria',
        'descripcion',
        'fechaAdquisicion',
        'fechaLimiteVenta'
    ];

    const errores = [];

    // Verificar campos requeridos
    camposRequeridos.forEach(campo => {
        if (!req.body[campo]) {
            errores.push(`El campo '${campo}' es requerido`);
        }
    });

    // Validaciones específicas
    if (req.body.precio && (isNaN(req.body.precio) || req.body.precio < 0)) {
        errores.push('El precio debe ser un número positivo');
    }

    if (req.body.stock && (isNaN(req.body.stock) || req.body.stock < 0)) {
        errores.push('El stock debe ser un número no negativo');
    }

    if (req.body.pesoGramos && (isNaN(req.body.pesoGramos) || req.body.pesoGramos <= 0)) {
        errores.push('El peso debe ser un número positivo');
    }

    // Validar formato de duración
    if (req.body.duracion && !/^([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]$/.test(req.body.duracion)) {
        errores.push('La duración debe estar en formato MM:SS o HH:MM:SS');
    }

    // Validar fechas
    if (req.body.fechaLanzamiento && isNaN(Date.parse(req.body.fechaLanzamiento))) {
        errores.push('La fecha de lanzamiento no es válida');
    }

    if (req.body.fechaAdquisicion && isNaN(Date.parse(req.body.fechaAdquisicion))) {
        errores.push('La fecha de adquisición no es válida');
    }

    if (req.body.fechaLimiteVenta && isNaN(Date.parse(req.body.fechaLimiteVenta))) {
        errores.push('La fecha límite de venta no es válida');
    }

    // Validar que la fecha límite sea posterior a la fecha de adquisición
    if (req.body.fechaLimiteVenta && req.body.fechaAdquisicion) {
        const fechaAdq = new Date(req.body.fechaAdquisicion);
        const fechaLim = new Date(req.body.fechaLimiteVenta);
        
        if (fechaLim <= fechaAdq) {
            errores.push('La fecha límite de venta debe ser posterior a la fecha de adquisición');
        }
    }

    // Validar arrays
    if (req.body.idioma) {
        if (typeof req.body.idioma === 'string') {
            req.body.idioma = [req.body.idioma];
        }
        if (!Array.isArray(req.body.idioma) || req.body.idioma.length === 0) {
            errores.push('Debe especificar al menos un idioma');
        }
    }

    if (req.body.categoria) {
        if (typeof req.body.categoria === 'string') {
            req.body.categoria = [req.body.categoria];
        }
        if (!Array.isArray(req.body.categoria) || req.body.categoria.length === 0) {
            errores.push('Debe especificar al menos una categoría');
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errores: errores
        });
    }

    next();
};

// Validar campos para actualizar álbum (todos los campos permitidos)
const validarActualizarAlbum = (req, res, next) => {
    const errores = [];
    const camposPermitidos = [
        'nombreAlbum',
        'artista', 
        'versionAlbum',
        'fechaLanzamiento',
        'idioma',
        'duracion',
        'pesoGramos',
        'precio',
        'stock',
        'categoria',
        'descripcion',
        'fotoAlbum',
        'fechaAdquisicion',
        'fechaLimiteVenta'
    ];

    // Verificar que solo se envíen campos permitidos
    const camposRecibidos = Object.keys(req.body);
    const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));
    
    if (camposInvalidos.length > 0) {
        errores.push(`Campos no permitidos: ${camposInvalidos.join(', ')}`);
    }

    // Validar nombreAlbum si está presente
    if (req.body.nombreAlbum !== undefined) {
        if (!req.body.nombreAlbum || req.body.nombreAlbum.trim() === '') {
            errores.push('El nombre del álbum no puede estar vacío');
        } else if (req.body.nombreAlbum.length > 100) {
            errores.push('El nombre del álbum no puede exceder los 100 caracteres');
        }
    }

    // Validar artista si está presente
    if (req.body.artista !== undefined) {
        if (!req.body.artista || req.body.artista.trim() === '') {
            errores.push('El artista/grupo no puede estar vacío');
        } else if (req.body.artista.length > 80) {
            errores.push('El nombre del artista no puede exceder los 80 caracteres');
        }
    }

    // Validar versionAlbum si está presente
    if (req.body.versionAlbum !== undefined) {
        const versionesValidas = ['Standard', 'Deluxe', 'Limited Edition', 'Special Edition', 'Repackage', 'Mini Album', 'Single'];
        if (!versionesValidas.includes(req.body.versionAlbum)) {
            errores.push('La versión debe ser: Standard, Deluxe, Limited Edition, Special Edition, Repackage, Mini Album o Single');
        }
    }

    // Validar fechaLanzamiento si está presente
    if (req.body.fechaLanzamiento !== undefined) {
        if (isNaN(Date.parse(req.body.fechaLanzamiento))) {
            errores.push('La fecha de lanzamiento no es válida');
        } else {
            const fechaLanzamiento = new Date(req.body.fechaLanzamiento);
            if (fechaLanzamiento > new Date()) {
                errores.push('La fecha de lanzamiento no puede ser futura');
            }
        }
    }

    // Validar idioma si está presente
    if (req.body.idioma !== undefined) {
        const idiomasValidos = ['Coreano', 'Japonés', 'Inglés', 'Chino', 'Tailandés', 'Español', 'Otro'];
        if (typeof req.body.idioma === 'string') {
            req.body.idioma = req.body.idioma.split(',').map(i => i.trim());
        }
        if (!Array.isArray(req.body.idioma) || req.body.idioma.length === 0) {
            errores.push('Debe especificar al menos un idioma');
        } else {
            const idiomasInvalidos = req.body.idioma.filter(idioma => !idiomasValidos.includes(idioma));
            if (idiomasInvalidos.length > 0) {
                errores.push(`Idiomas no válidos: ${idiomasInvalidos.join(', ')}`);
            }
        }
    }

    // Validar duración si está presente
    if (req.body.duracion !== undefined) {
        if (!/^([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]$/.test(req.body.duracion)) {
            errores.push('La duración debe estar en formato MM:SS o HH:MM:SS');
        }
    }

    // Validar pesoGramos si está presente
    if (req.body.pesoGramos !== undefined) {
        if (isNaN(req.body.pesoGramos) || req.body.pesoGramos <= 0 || req.body.pesoGramos > 2000) {
            errores.push('El peso debe ser un número entre 1 y 2000 gramos');
        }
    }

    // Validar precio si está presente
    if (req.body.precio !== undefined) {
        if (isNaN(req.body.precio) || req.body.precio < 0) {
            errores.push('El precio debe ser un número positivo o cero');
        }
    }

    // Validar stock si está presente
    if (req.body.stock !== undefined) {
        if (isNaN(req.body.stock) || req.body.stock < 0) {
            errores.push('El stock debe ser un número no negativo');
        }
    }

    // Validar categoría si está presente
    if (req.body.categoria !== undefined) {
        const categoriasValidas = ['K-Pop', 'J-Pop', 'Boy Group', 'Girl Group', 'Solista', 'Ballad', 'Dance', 'R&B', 'Hip-Hop', 'Rock', 'Indie'];
        if (typeof req.body.categoria === 'string') {
            req.body.categoria = req.body.categoria.split(',').map(c => c.trim());
        }
        if (!Array.isArray(req.body.categoria) || req.body.categoria.length === 0) {
            errores.push('Debe especificar al menos una categoría');
        } else {
            const categoriasInvalidas = req.body.categoria.filter(cat => !categoriasValidas.includes(cat));
            if (categoriasInvalidas.length > 0) {
                errores.push(`Categorías no válidas: ${categoriasInvalidas.join(', ')}`);
            }
        }
    }

    // Validar descripción si está presente
    if (req.body.descripcion !== undefined) {
        if (!req.body.descripcion || req.body.descripcion.trim() === '') {
            errores.push('La descripción no puede estar vacía');
        } else if (req.body.descripcion.length > 1000) {
            errores.push('La descripción no puede exceder los 1000 caracteres');
        }
    }

    // Validar fechaAdquisicion si está presente
    if (req.body.fechaAdquisicion !== undefined) {
        if (isNaN(Date.parse(req.body.fechaAdquisicion))) {
            errores.push('La fecha de adquisición no es válida');
        } else {
            const fechaAdquisicion = new Date(req.body.fechaAdquisicion);
            if (fechaAdquisicion > new Date()) {
                errores.push('La fecha de adquisición no puede ser futura');
            }
        }
    }

    // Validar fechaLimiteVenta si está presente
    if (req.body.fechaLimiteVenta !== undefined) {
        if (isNaN(Date.parse(req.body.fechaLimiteVenta))) {
            errores.push('La fecha límite de venta no es válida');
        } else {
            const fechaLimite = new Date(req.body.fechaLimiteVenta);
            if (fechaLimite <= new Date()) {
                errores.push('La fecha límite de venta debe ser futura');
            }
        }
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errores: errores
        });
    }

    next();
};

// Validar parámetros de paginación
const validarPaginacion = (req, res, next) => {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
        return res.status(400).json({
            success: false,
            message: 'El número de página debe ser un entero positivo'
        });
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        return res.status(400).json({
            success: false,
            message: 'El límite debe estar entre 1 y 100'
        });
    }

    next();
};

// Validar parámetros de filtros de precio
const validarFiltrosPrecio = (req, res, next) => {
    const { precioMin, precioMax } = req.query;

    if (precioMin && (isNaN(precioMin) || parseFloat(precioMin) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'El precio mínimo debe ser un número positivo'
        });
    }

    if (precioMax && (isNaN(precioMax) || parseFloat(precioMax) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'El precio máximo debe ser un número positivo'
        });
    }

    if (precioMin && precioMax && parseFloat(precioMin) > parseFloat(precioMax)) {
        return res.status(400).json({
            success: false,
            message: 'El precio mínimo no puede ser mayor al precio máximo'
        });
    }

    next();
};

module.exports = {
    validarObjectId,
    validarCrearAlbum,
    validarActualizarAlbum,
    validarPaginacion,
    validarFiltrosPrecio
};