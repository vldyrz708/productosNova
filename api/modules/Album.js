const mongoose = require('mongoose');
const validator = require('validator');

const albumSchema = new mongoose.Schema({
    nombreAlbum: {
        type: String,
        required: [true, 'El nombre del álbum es requerido'],
        trim: true,
        maxlength: [100, 'El nombre del álbum no puede exceder los 100 caracteres']
    },
    artista: {
        type: String,
        required: [true, 'El artista/grupo es requerido'],
        trim: true,
        maxlength: [80, 'El nombre del artista no puede exceder los 80 caracteres']
    },
    versionAlbum: {
        type: String,
        required: [true, 'La versión del álbum es requerida'],
        trim: true,
        enum: {
            values: ['Standard', 'Deluxe', 'Limited Edition', 'Special Edition', 'Repackage', 'Mini Album', 'Single'],
            message: 'La versión debe ser: Standard, Deluxe, Limited Edition, Special Edition, Repackage, Mini Album o Single'
        }
    },
    fechaLanzamiento: {
        type: Date,
        required: [true, 'La fecha de lanzamiento es requerida']
    },
    idioma: {
        type: [String],
        required: [true, 'Al menos un idioma es requerido'],
        enum: {
            values: ['Coreano', 'Japonés', 'Inglés', 'Chino', 'Tailandés', 'Español', 'Otro'],
            message: 'Los idiomas válidos son: Coreano, Japonés, Inglés, Chino, Tailandés, Español, Otro'
        }
    },
    duracion: {
        type: String,
        required: [true, 'La duración del álbum es requerida'],
        validate: {
            validator: function(v) {
                // Formato: HH:MM:SS o MM:SS
                return /^([0-9]{1,2}:)?[0-5]?[0-9]:[0-5][0-9]$/.test(v);
            },
            message: 'La duración debe estar en formato MM:SS o HH:MM:SS'
        }
    },
    pesoGramos: {
        type: Number,
        required: [true, 'El peso en gramos es requerido'],
        min: [1, 'El peso debe ser mayor a 0 gramos'],
        max: [2000, 'El peso no puede exceder los 2000 gramos']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es requerido'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    categoria: {
        type: [String],
        required: [true, 'Al menos una categoría es requerida'],
        enum: {
            values: ['K-Pop', 'J-Pop', 'Boy Group', 'Girl Group', 'Solista', 'Ballad', 'Dance', 'R&B', 'Hip-Hop', 'Rock', 'Indie'],
            message: 'Las categorías válidas son: K-Pop, J-Pop, Boy Group, Girl Group, Solista, Ballad, Dance, R&B, Hip-Hop, Rock, Indie'
        }
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del álbum es requerida'],
        trim: true,
        maxlength: [1000, 'La descripción no puede exceder los 1000 caracteres']
    },
    fotoAlbum: {
        type: String,
        required: [true, 'La foto del álbum es requerida']
        
    },
    fechaAdquisicion: {
        type: Date,
        required: [true, 'La fecha de adquisición es requerida'],
        default: Date.now
    },
    fechaLimiteVenta: {
        type: Date,
        required: [true, 'La fecha límite de venta es requerida'],
        validate: {
            validator: function(v) {
                return v > this.fechaAdquisicion;
            },
            message: 'La fecha límite de venta debe ser posterior a la fecha de adquisición'
        }
    },
    // Campos adicionales para búsqueda y filtrado
    palabrasClave: {
        type: [String],
        default: function() {
            // Generar palabras clave automáticamente
            return [
                this.nombreAlbum.toLowerCase(),
                this.artista.toLowerCase(),
                ...this.categoria.map(cat => cat.toLowerCase())
            ];
        }
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para optimizar búsquedas
albumSchema.index({ nombreAlbum: 'text', artista: 'text', descripcion: 'text' });
albumSchema.index({ artista: 1 });
albumSchema.index({ categoria: 1 });
albumSchema.index({ precio: 1 });
albumSchema.index({ fechaLanzamiento: 1 });
albumSchema.index({ stock: 1 });

// Virtual para verificar si está disponible para la venta
albumSchema.virtual('disponibleVenta').get(function() {
    const ahora = new Date();
    return this.stock > 0 && 
           ahora <= this.fechaLimiteVenta;
});

// Virtual para calcular días restantes de venta
albumSchema.virtual('diasRestantesVenta').get(function() {
    const ahora = new Date();
    const diferencia = this.fechaLimiteVenta - ahora;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
});

// Middleware pre-save para actualizar palabras clave
albumSchema.pre('save', function(next) {
    if (this.isModified('nombreAlbum') || this.isModified('artista') || this.isModified('categoria')) {
        this.palabrasClave = [
            this.nombreAlbum.toLowerCase(),
            this.artista.toLowerCase(),
            ...this.categoria.map(cat => cat.toLowerCase())
        ];
    }
    next();
});

module.exports = mongoose.model('Album', albumSchema);