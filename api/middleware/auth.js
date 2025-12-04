let jwt;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';

function wantsHtmlRedirect(req) {
    const accept = req.headers.accept || '';
    const isHtml = accept.includes('text/html');
    const isPageRequest = req.method === 'GET' && !req.path.startsWith('/api');
    return isHtml && isPageRequest;
}

function sendUnauthorized(req, res, message, statusCode = 401) {
    if (wantsHtmlRedirect(req)) {
        return res.redirect(302, '/index.html');
    }
    return res.status(statusCode).json({ success: false, message });
}

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
        if (!token) return sendUnauthorized(req, res, 'No autorizado');
        const jwtlib = ensureJwtLib(res);
        if (!jwtlib) return; // ensureJwtLib already responded
        const payload = jwtlib.verify(token, JWT_SECRET);
        req.user = payload; // contains id, role, correo
        next();
    } catch (err) {
        return sendUnauthorized(req, res, 'Token inválido o expirado');
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return sendUnauthorized(req, res, 'No autorizado');
        if (!roles.includes(req.user.role) && !roles.includes(req.user.rol)) {
            return wantsHtmlRedirect(req)
                ? res.redirect(302, '/index.html')
                : res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole, getTokenFromReq };
