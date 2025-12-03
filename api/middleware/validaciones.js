const mongoose = require('mongoose');
const Album = require('../modules/Album');

const VERSIONES_VALIDAS = ['Standard', 'Deluxe', 'Limited Edition', 'Special Edition', 'Repackage', 'Mini Album', 'Single'];
const IDIOMAS_VALIDOS = ['Coreano', 'Japonés', 'Inglés', 'Chino', 'Tailandés', 'Español', 'Otro'];
const CATEGORIAS_VALIDAS = ['K-Pop', 'J-Pop', 'Boy Group', 'Girl Group', 'Solista', 'Ballad', 'Dance', 'R&B', 'Hip-Hop', 'Rock', 'Indie'];
const DURACION_REGEX = /^([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]$/;

const trimValue = (valor) => typeof valor === 'string' ? valor.trim() : valor;

const parseNumber = (valor) => {
    if (valor === undefined || valor === null) return null;
    if (typeof valor === 'string' && valor.trim() === '') return null;
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
};

const parseInteger = (valor) => {
    const numero = parseNumber(valor);
    return numero !== null && Number.isInteger(numero) ? numero : null;
};

const normalizeDate = (valor) => {
    if (!valor && valor !== 0) return null;
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return null;
    fecha.setHours(0, 0, 0, 0);
    return fecha;
};

const today = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy;
};

const ensureArray = (valor) => {
    if (Array.isArray(valor)) {
        return valor.map(v => typeof v === 'string' ? v.trim() : v).filter(Boolean);
    }
    if (valor === undefined || valor === null) return [];
    if (typeof valor === 'string') {
        return valor.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
};

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
        'fechaLimiteVenta',
        'fotoAlbum'
    ];

    const errores = [];

    camposRequeridos.forEach(campo => {
        if (!req.body[campo]) {
            errores.push(`El campo '${campo}' es requerido`);
        }
    });

    const nombreAlbum = trimValue(req.body.nombreAlbum || '');
    if (!nombreAlbum || nombreAlbum.length < 2 || nombreAlbum.length > 100) {
        errores.push('El nombre del álbum debe tener entre 2 y 100 caracteres');
    } else {
        req.body.nombreAlbum = nombreAlbum;
    }

    const artista = trimValue(req.body.artista || '');
    if (!artista || artista.length < 2 || artista.length > 80) {
        errores.push('El artista/grupo debe tener entre 2 y 80 caracteres');
    } else {
        req.body.artista = artista;
    }

    if (!req.body.versionAlbum || !VERSIONES_VALIDAS.includes(req.body.versionAlbum)) {
        errores.push('La versión debe ser una opción válida');
    }

    const duracion = trimValue(req.body.duracion || '');
    if (!duracion || !DURACION_REGEX.test(duracion)) {
        errores.push('La duración debe estar en formato MM:SS o HH:MM:SS');
    } else {
        req.body.duracion = duracion;
    }

    const peso = parseInteger(req.body.pesoGramos);
    if (peso === null || peso < 1 || peso > 2000) {
        errores.push('El peso debe ser un entero entre 1 y 2000 gramos');
    } else {
        req.body.pesoGramos = peso;
    }

    const precio = parseNumber(req.body.precio);
    if (precio === null || precio <= 0) {
        errores.push('El precio debe ser un número mayor a 0');
    } else {
        req.body.precio = precio;
    }

    const stock = parseInteger(req.body.stock);
    if (stock === null || stock < 0 || stock > 10000) {
        errores.push('El stock debe ser un entero entre 0 y 10000');
    } else {
        req.body.stock = stock;
    }

    const descripcion = trimValue(req.body.descripcion || '');
    if (!descripcion || descripcion.length < 10 || descripcion.length > 500) {
        errores.push('La descripción debe tener entre 10 y 500 caracteres');
    } else {
        req.body.descripcion = descripcion;
    }

    const idiomas = ensureArray(req.body.idioma);
    if (!idiomas.length) {
        errores.push('Debe especificar al menos un idioma');
    } else {
        const invalidos = idiomas.filter(idioma => !IDIOMAS_VALIDOS.includes(idioma));
        if (invalidos.length) {
            errores.push(`Idiomas no válidos: ${invalidos.join(', ')}`);
        }
        req.body.idioma = idiomas;
    }

    const categorias = ensureArray(req.body.categoria);
    if (!categorias.length) {
        errores.push('Debe especificar al menos una categoría');
    } else {
        const categoriasInvalidas = categorias.filter(cat => !CATEGORIAS_VALIDAS.includes(cat));
        if (categoriasInvalidas.length) {
            errores.push(`Categorías no válidas: ${categoriasInvalidas.join(', ')}`);
        }
        req.body.categoria = categorias;
    }

    const fechaLanzamiento = normalizeDate(req.body.fechaLanzamiento);
    if (!fechaLanzamiento) {
        errores.push('La fecha de lanzamiento no es válida');
    } else if (fechaLanzamiento > today()) {
        errores.push('La fecha de lanzamiento debe ser menor o igual a hoy');
    } else {
        req.body.fechaLanzamiento = fechaLanzamiento;
    }

    const fechaAdquisicion = normalizeDate(req.body.fechaAdquisicion);
    let fechaAdquisicionValida = true;
    if (!fechaAdquisicion) {
        errores.push('La fecha de compra no es válida');
        fechaAdquisicionValida = false;
    } else {
        if (fechaLanzamiento && fechaAdquisicion < fechaLanzamiento) {
            errores.push('La fecha de compra debe ser mayor o igual a la fecha de lanzamiento');
            fechaAdquisicionValida = false;
        }
        if (fechaAdquisicion > today()) {
            errores.push('La fecha de compra debe ser menor o igual a hoy');
            fechaAdquisicionValida = false;
        }
    }
    if (fechaAdquisicionValida) {
        req.body.fechaAdquisicion = fechaAdquisicion;
    }

    const fechaLimiteVenta = normalizeDate(req.body.fechaLimiteVenta);
    let fechaLimiteValida = true;
    if (!fechaLimiteVenta) {
        errores.push('La fecha límite de venta no es válida');
        fechaLimiteValida = false;
    } else {
        if (fechaAdquisicion && fechaLimiteVenta <= fechaAdquisicion) {
            errores.push('La fecha límite de venta debe ser mayor a la fecha de compra');
            fechaLimiteValida = false;
        }
        if (fechaLimiteVenta <= today()) {
            errores.push('La fecha límite de venta debe ser mayor a hoy');
            fechaLimiteValida = false;
        }
    }
    if (fechaLimiteValida) {
        req.body.fechaLimiteVenta = fechaLimiteVenta;
    }

    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errores
        });
    }

    next();
};

// Validar campos para actualizar álbum (todos los campos permitidos)
const validarActualizarAlbum = async (req, res, next) => {
    try {
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

        const camposRecibidos = Object.keys(req.body || {});
        const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));
        if (camposInvalidos.length > 0) {
            errores.push(`Campos no permitidos: ${camposInvalidos.join(', ')}`);
        }

        let albumActual = null;
        if (req.params && req.params.id) {
            albumActual = await Album.findById(req.params.id).lean();
        }

        const hoy = today();

        const nombreAlbum = req.body.nombreAlbum;
        if (nombreAlbum !== undefined) {
            const nombre = trimValue(nombreAlbum || '');
            if (!nombre || nombre.length < 2 || nombre.length > 100) {
                errores.push('El nombre del álbum debe tener entre 2 y 100 caracteres');
            } else {
                req.body.nombreAlbum = nombre;
            }
        }

        const artista = req.body.artista;
        if (artista !== undefined) {
            const valor = trimValue(artista || '');
            if (!valor || valor.length < 2 || valor.length > 80) {
                errores.push('El artista/grupo debe tener entre 2 y 80 caracteres');
            } else {
                req.body.artista = valor;
            }
        }

        if (req.body.versionAlbum !== undefined && !VERSIONES_VALIDAS.includes(req.body.versionAlbum)) {
            errores.push('La versión debe ser una opción válida');
        }

        if (req.body.idioma !== undefined) {
            const idiomas = ensureArray(req.body.idioma);
            if (!idiomas.length) {
                errores.push('Debe especificar al menos un idioma');
            } else {
                const invalidos = idiomas.filter(idioma => !IDIOMAS_VALIDOS.includes(idioma));
                if (invalidos.length) {
                    errores.push(`Idiomas no válidos: ${invalidos.join(', ')}`);
                }
                req.body.idioma = idiomas;
            }
        }

        if (req.body.duracion !== undefined) {
            const duracion = trimValue(req.body.duracion || '');
            if (!duracion || !DURACION_REGEX.test(duracion)) {
                errores.push('La duración debe estar en formato MM:SS o HH:MM:SS');
            } else {
                req.body.duracion = duracion;
            }
        }

        if (req.body.pesoGramos !== undefined) {
            const peso = parseInteger(req.body.pesoGramos);
            if (peso === null || peso < 1 || peso > 2000) {
                errores.push('El peso debe ser un entero entre 1 y 2000 gramos');
            } else {
                req.body.pesoGramos = peso;
            }
        }

        if (req.body.precio !== undefined) {
            const precio = parseNumber(req.body.precio);
            if (precio === null || precio <= 0) {
                errores.push('El precio debe ser un número mayor a 0');
            } else {
                req.body.precio = precio;
            }
        }

        if (req.body.stock !== undefined) {
            const stock = parseInteger(req.body.stock);
            if (stock === null || stock < 0 || stock > 10000) {
                errores.push('El stock debe ser un entero entre 0 y 10000');
            } else {
                req.body.stock = stock;
            }
        }

        if (req.body.categoria !== undefined) {
            const categorias = ensureArray(req.body.categoria);
            if (!categorias.length) {
                errores.push('Debe especificar al menos una categoría');
            } else {
                const categoriasInvalidas = categorias.filter(cat => !CATEGORIAS_VALIDAS.includes(cat));
                if (categoriasInvalidas.length) {
                    errores.push(`Categorías no válidas: ${categoriasInvalidas.join(', ')}`);
                }
                req.body.categoria = categorias;
            }
        }

        if (req.body.descripcion !== undefined) {
            const descripcion = trimValue(req.body.descripcion || '');
            if (!descripcion || descripcion.length < 10 || descripcion.length > 500) {
                errores.push('La descripción debe tener entre 10 y 500 caracteres');
            } else {
                req.body.descripcion = descripcion;
            }
        }

        let fechaLanzamientoRef = albumActual ? normalizeDate(albumActual.fechaLanzamiento) : null;
        if (req.body.fechaLanzamiento !== undefined) {
            const fecha = normalizeDate(req.body.fechaLanzamiento);
            if (!fecha) {
                errores.push('La fecha de lanzamiento no es válida');
            } else if (fecha > hoy) {
                errores.push('La fecha de lanzamiento debe ser menor o igual a hoy');
            } else {
                req.body.fechaLanzamiento = fecha;
                fechaLanzamientoRef = fecha;
            }
        }

        let fechaAdquisicionRef = albumActual ? normalizeDate(albumActual.fechaAdquisicion) : null;
        if (req.body.fechaAdquisicion !== undefined) {
            const fecha = normalizeDate(req.body.fechaAdquisicion);
            let fechaValida = true;
            if (!fecha) {
                errores.push('La fecha de compra no es válida');
                fechaValida = false;
            } else {
                if (fechaLanzamientoRef && fecha < fechaLanzamientoRef) {
                    errores.push('La fecha de compra debe ser mayor o igual a la fecha de lanzamiento');
                    fechaValida = false;
                }
                if (fecha > hoy) {
                    errores.push('La fecha de compra debe ser menor o igual a hoy');
                    fechaValida = false;
                }
            }
            if (fechaValida) {
                req.body.fechaAdquisicion = fecha;
                fechaAdquisicionRef = fecha;
            }
        }

        if (req.body.fechaLimiteVenta !== undefined) {
            const fecha = normalizeDate(req.body.fechaLimiteVenta);
            let fechaValida = true;
            if (!fecha) {
                errores.push('La fecha límite de venta no es válida');
                fechaValida = false;
            } else {
                const referenciaCompra = fechaAdquisicionRef || (albumActual ? normalizeDate(albumActual.fechaAdquisicion) : null);
                if (referenciaCompra && fecha <= referenciaCompra) {
                    errores.push('La fecha límite de venta debe ser mayor a la fecha de compra');
                    fechaValida = false;
                }
                if (fecha <= hoy) {
                    errores.push('La fecha límite de venta debe ser mayor a hoy');
                    fechaValida = false;
                }
            }
            if (fechaValida) {
                req.body.fechaLimiteVenta = fecha;
            }
        }

        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errores
            });
        }

        next();
    } catch (error) {
        next(error);
    }
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