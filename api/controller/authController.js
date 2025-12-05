const User = require('../modules/User');
const bcrypt = require('bcryptjs');
const validator = require('validator');
let jwt;
const { getTokenFromReq } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const COOKIE_NAME = 'token';
const SESSION_TTL_MS = parseInt(process.env.SESSION_TTL_MS || (60 * 60 * 1000), 10);
const SESSION_TTL_SECONDS = Math.max(1, Math.floor(SESSION_TTL_MS / 1000));
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS
};
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
const PHONE_REGEX = /^\d{7,15}$/;
const EDAD_MIN = 16;
const EDAD_MAX = 99;

function normalizarCorreo(correo = '') {
    return (correo || '').trim().toLowerCase();
}

function validarDatosRegistro({ nombre, apellido, edad, numeroTelefono, correo, password }) {
    if (!nombre || !NAME_REGEX.test(nombre)) return 'El nombre sólo puede contener letras y espacios';
    if (!apellido || !NAME_REGEX.test(apellido)) return 'El apellido sólo puede contener letras y espacios';

    if (edad === undefined || edad === null || edad === '') return 'La edad es requerida';
    if (!Number.isInteger(Number(edad))) return 'La edad debe ser un número entero';
    const edadNumero = Number(edad);
    if (edadNumero < EDAD_MIN || edadNumero > EDAD_MAX) {
        return `La edad debe estar entre ${EDAD_MIN} y ${EDAD_MAX} años`;
    }

    if (!numeroTelefono || !PHONE_REGEX.test(numeroTelefono)) {
        return 'El teléfono sólo puede contener dígitos (7 a 15 caracteres)';
    }

    if (!correo || !validator.isEmail(correo)) {
        return 'Ingresa un correo válido';
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres';
    }

    return null;
}

async function login(req, res, next) {
    try {
        // load jsonwebtoken lazily so server can start even if dep not yet installed
        if (!jwt) {
            try {
                jwt = require('jsonwebtoken');
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Dependencia missing: run `npm install jsonwebtoken`' });
            }
        }
        const { correo, password } = req.body;
        if (!correo || !password) return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });

        // Recuperar usuario incluyendo la contraseña
        const user = await User.findOne({ correo }).select('+password');
        if (!user) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

        const payload = { id: user._id, role: user.rol, correo: user.correo };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });

        // Limpiar password antes de enviar user
        const userObj = user.toObject();
        delete userObj.password;

        // Enviar token en cookie httpOnly y en cuerpo 
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        res.json({ success: true, token, user: userObj, expiresIn: SESSION_TTL_SECONDS });
    } catch (err) {
        next(err);
    }
}

function logout(req, res) {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, message: 'Sesión cerrada' });
}

async function register(req, res, next) {
    try {
        const payload = {
            nombre: (req.body.nombre || '').trim(),
            apellido: (req.body.apellido || '').trim(),
            edad: req.body.edad,
            numeroTelefono: (req.body.numeroTelefono || '').trim(),
            correo: normalizarCorreo(req.body.correo),
            password: req.body.contrasena || req.body.password
        };

        const error = validarDatosRegistro(payload);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }

        const correoExistente = await User.findOne({ correo: payload.correo });
        if (correoExistente) {
            return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
        }

        const nuevoUsuario = new User({
            nombre: payload.nombre,
            apellido: payload.apellido,
            edad: Number(payload.edad),
            numeroTelefono: payload.numeroTelefono,
            correo: payload.correo,
            password: payload.password,
            rol: 'Usuario'
        });

        const guardado = await nuevoUsuario.save();
        const userObj = guardado.toObject();
        delete userObj.password;

        return res.status(201).json({ success: true, message: 'Registro exitoso', user: userObj });
    } catch (err) {
        if (err && err.code === 11000 && err.keyPattern && err.keyPattern.correo) {
            return res.status(409).json({ success: false, message: 'El correo ya está registrado' });
        }
        if (err && err.name === 'ValidationError') {
            const mensaje = Object.values(err.errors)[0]?.message || 'Datos inválidos';
            return res.status(400).json({ success: false, message: mensaje });
        }
        next(err);
    }
}

async function me(req, res) {
    try {
        // Obtener token desde cookie o header
        const token = getTokenFromReq(req);
        if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
        if (!jwt) jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, JWT_SECRET);
        // Buscar usuario y devolver sin password
        const user = await User.findById(payload.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, user });
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}

module.exports = { login, logout, me, register };
