const LOGIN_REDIRECT_PATH = '/index.html';
const SESSION_CHECK_INTERVAL_MS = 1_000; // 30 segundos para detectar expiraciones sin interacción

function normalizarDestino(path = LOGIN_REDIRECT_PATH) {
    if (!path) return LOGIN_REDIRECT_PATH;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return path.startsWith('/') ? path : `/${path}`;
}

//quitar datos de sesión en sessionStorage

function limpiarSesionEnStorage() {
    try {
        sessionStorage.removeItem('usuarioActivo');
    } catch (err) {
        console.warn('No se pudo limpiar sessionStorage', err);
    }
}

function redirigir(destino = LOGIN_REDIRECT_PATH) {
    if (window.__redireccionando) return;
    window.__redireccionando = true;
    limpiarSesionEnStorage();
    const ruta = normalizarDestino(destino);
    setTimeout(() => {
        window.location.href = ruta;
    }, 50);
}

function iniciarVigilanteSesion(allowedRoles = [], redirectTo = LOGIN_REDIRECT_PATH) {
    if (window.__sessionWatcherTimeout) {
        clearTimeout(window.__sessionWatcherTimeout);
    }

    const destino = normalizarDestino(redirectTo);

    async function revisarSesion() {
        try {
            const resp = await fetch('/api/auth/me', { credentials: 'include' });
            if (!resp.ok) throw new Error('unauthorized');
            const data = await resp.json();
            const role = data.user && (data.user.rol || data.user.role);
            if (allowedRoles.length && !allowedRoles.includes(role)) {
                redirigir(destino);
                return;
            }
        } catch (err) {
            redirigir(destino);
            return;
        }
        window.__sessionWatcherTimeout = setTimeout(revisarSesion, SESSION_CHECK_INTERVAL_MS);
    }

    revisarSesion();
}
window.startSessionWatch = iniciarVigilanteSesion;

// Hook global fetch para detectar expiración de token y redirigir automáticamente
(function instalarGuardiaToken() {
    if (window.__tokenGuardInstalled) return;
    window.__tokenGuardInstalled = true;

    const originalFetch = window.fetch.bind(window);
    const skipRedirectFor = ['/api/auth/login'];

    window.fetch = async (...args) => {
        const respuesta = await originalFetch(...args);
        const solicitud = args[0];
        const urlSolicitud = typeof solicitud === 'string'
            ? solicitud
            : (solicitud && solicitud.url) || '';

        const debeOmitir = skipRedirectFor.some(endpoint => urlSolicitud.includes(endpoint));

        if (!debeOmitir && respuesta.status === 401) {
            redirigir();
        }

        return respuesta;
    };
})();

// Este script no es estrictamente necesario porque Bootstrap ya maneja el menú hamburguesa.
// Pero lo dejamos para posibles animaciones personalizadas.
document.addEventListener('DOMContentLoaded', () => {
    console.log('K-Bias Merch loaded');
    // Attach global logout handlers for elements with class .btn-logout
    document.querySelectorAll('.btn-logout').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } catch (err) {
                console.error('Logout error', err);
            }
            limpiarSesionEnStorage();
            window.location.href = '/';
        });
    });
});

// Helper para que páginas protejan su acceso por rol
window.ensureRole = async function(allowedRoles = [], redirectTo = '/') {
    const destino = normalizarDestino(redirectTo);
    try {
        const resp = await fetch('/api/auth/me', { credentials: 'include' });
        if (!resp.ok) {
            redirigir(destino);
            return false;
        }
        const data = await resp.json();
        const role = data.user && (data.user.rol || data.user.role);
        if (allowedRoles.length && !allowedRoles.includes(role)) {
            redirigir(destino);
            return false;
        }
        iniciarVigilanteSesion(allowedRoles, destino);
        return true;
    } catch (err) {
        redirigir(destino);
        return false;
    }
};


// Abrir modal login
document.getElementById("abrirLogin").addEventListener("click", function() {

    fetch("modalogin.html")
        .then(resp => resp.text())
        .then(html => {

            document.getElementById("loginModalContent").innerHTML = html;

            let modal = new bootstrap.Modal(document.getElementById("loginModal"));
            modal.show();
            document.getElementById("closeLoginModal").addEventListener("click", () => {
                modal.hide();
            });

            // Attach login form handler (modal content is dynamic)
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value.trim();
                    const password = document.getElementById('password').value;
                    try {
                        const resp = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ correo: email, password })
                        });
                        const data = await resp.json();
                        if (!resp.ok) {
                            alert(data.message || 'Error al iniciar sesión');
                            return;
                        }

                        // Guardar datos no sensibles en sessionStorage para visibilidad en DevTools
                        sessionStorage.setItem('usuarioActivo', JSON.stringify({
                            id: data.user?._id,
                            nombre: data.user?.nombre,
                            apellido: data.user?.apellido,
                            rol: data.user?.rol,
                            correo: data.user?.correo,
                            expiresIn: data.expiresIn
                        }));

                        const role = data.user && data.user.rol ? data.user.rol : (data.role || 'Usuario');
                        modal.hide();
                        // Redirigir según rol
                        if (role === 'Admin') window.location.href = '/admin/admin.html';
                        else if (role === 'Gerente') window.location.href = '/gerente/gerente.html';
                        else window.location.href = '/cashier/cajero.html';
                    } catch (err) {
                        console.error('Login error', err);
                        alert('Error en la conexión');
                    }
                });
            }
        })
        .catch(err => console.error("Error cargando modalogin.html:", err));
});