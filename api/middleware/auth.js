let jwt;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';

function getTokenFromReq(req) {
    // Authorization header
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.split(' ')[1];

    // Cookie header (simple parse)
    const cookie = req.headers.cookie;
    if (cookie) {
        const match = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('token='));
        if (match) return match.split('=')[1];
    }
    return null;
}

function ensureJwtLib(res) {
    if (!jwt) {
        try { jwt = require('jsonwebtoken'); } catch (e) {
            res.status(500).json({ success: false, message: 'jsonwebtoken missing on server' });
            return null;
        }
    }
    return jwt;
}

async function verifyToken(req, res, next) {
    try {
        const token = getTokenFromReq(req);
        if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });
        const jwtlib = ensureJwtLib(res);
        if (!jwtlib) return; // ensureJwtLib already responded
        const payload = jwtlib.verify(token, JWT_SECRET);
        req.user = payload; // contains id, role, correo
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' });
        if (!roles.includes(req.user.role) && !roles.includes(req.user.rol)) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole, getTokenFromReq };
