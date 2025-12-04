const User = require('../modules/User');
const bcrypt = require('bcryptjs');
let jwt;
const { getTokenFromReq } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const COOKIE_NAME = 'token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000 // 1 hour in ms
};

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
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Limpiar password antes de enviar user
        const userObj = user.toObject();
        delete userObj.password;

        // Enviar token en cookie httpOnly y en cuerpo (opcional)
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
        res.json({ success: true, token, user: userObj });
    } catch (err) {
        next(err);
    }
}

function logout(req, res) {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, message: 'Sesión cerrada' });
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

module.exports = { login, logout, me };
