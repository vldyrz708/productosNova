const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede exceder los 50 caracteres'],
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        match: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, 'El nombre sólo puede contener letras y espacios']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxlength: [50, 'El apellido no puede exceder los 50 caracteres'],
        minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
        match: [/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/, 'El apellido sólo puede contener letras y espacios']
    },
    edad: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [16, 'La edad mínima permitida es 16 años'],
        max: [99, 'La edad máxima permitida es 99 años'],
        validate: {
            validator: Number.isInteger,
            message: 'La edad debe ser un número entero'
        }
    },
    numeroTelefono: {
        type: String,
        required: [true, 'El número de teléfono es requerido'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{7,15}$/.test((v || '').trim());
            },
            message: 'El teléfono debe contener sólo dígitos (7 a 15 caracteres)'
        }
    },
    correo: {
        type: String,
        required: [true, 'El correo es requerido'],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v + '');
            },
            message: 'Correo inválido'
        }
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    rol: {
        type: String,
        enum: {
            values: ['Usuario', 'Admin', 'Gerente'],
            message: 'Rol inválido. Debe ser Cajero, Usuario, Admin o Gerente'
        },
        default: 'Usuario',
        required: [true, 'El rol es requerido']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para búsqueda rápida
userSchema.index({ nombre: 1, apellido: 1 });

// Hashear contraseña antes de guardar si fue modificada
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);
