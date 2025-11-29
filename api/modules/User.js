const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxlength: [50, 'El apellido no puede exceder los 50 caracteres']
    },
    edad: {
        type: Number,
        required: [true, 'La edad es requerida'],
        min: [0, 'La edad no puede ser negativa'],
        max: [120, 'Edad inválida']
    },
    numeroTelefono: {
        type: String,
        required: [true, 'El número de teléfono es requerido'],
        trim: true,
        validate: {
            validator: function(v) {
                // Permitir distintos formatos; usar validator con locale 'any'
                return validator.isMobilePhone(v + '', 'any');
            },
            message: 'Número de teléfono inválido'
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
            values: ['Cajero', 'Usuario', 'Admin', 'Gerente'],
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
