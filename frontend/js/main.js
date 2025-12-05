const LOGIN_REDIRECT_PATH = '/index.html';
const SESSION_CHECK_INTERVAL_MS = 1_000; // 30 segundos para detectar expiraciones sin interacción
const SOLO_LETRAS_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
const TELEFONO_REGEX = /^\d{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EDAD_MIN = 16;
const EDAD_MAX = 99;

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

function generarHtmlErrores(errores = []) {
    if (!errores.length) return '';
    return `<ul class="text-start mb-0">${errores.map(err => `<li>${err}</li>`).join('')}</ul>`;
}

function configurarFormularioRegistro() {
    const form = document.getElementById('formAgregarUsuario');
    if (!form) return;

    const campos = {
        nombre: form.querySelector('#nombre'),
        apellido: form.querySelector('#apellido'),
        edad: form.querySelector('#edad'),
        numeroTelefono: form.querySelector('#numeroTelefono'),
        correo: form.querySelector('#correo'),
        contrasena: form.querySelector('#contrasena')
    };

    Object.values(campos).forEach(campo => {
        if (!campo) return;
        campo.addEventListener('input', () => campo.classList.remove('is-invalid'));
    });

    if (campos.numeroTelefono) {
        campos.numeroTelefono.addEventListener('input', () => {
            campos.numeroTelefono.value = campos.numeroTelefono.value.replace(/[^0-9]/g, '');
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valores = {
            nombre: campos.nombre?.value.trim() || '',
            apellido: campos.apellido?.value.trim() || '',
            edad: campos.edad?.value.trim() || '',
            numeroTelefono: campos.numeroTelefono?.value.trim() || '',
            correo: campos.correo?.value.trim() || '',
            contrasena: campos.contrasena?.value || ''
        };

        const errores = [];

        const chequeos = [
            { campo: campos.nombre, valido: valores.nombre && SOLO_LETRAS_REGEX.test(valores.nombre), mensaje: 'El nombre sólo puede contener letras y espacios.' },
            { campo: campos.apellido, valido: valores.apellido && SOLO_LETRAS_REGEX.test(valores.apellido), mensaje: 'El apellido sólo puede contener letras y espacios.' },
            { campo: campos.edad, valido: valores.edad && Number.isInteger(Number(valores.edad)) && Number(valores.edad) >= EDAD_MIN && Number(valores.edad) <= EDAD_MAX, mensaje: `La edad debe estar entre ${EDAD_MIN} y ${EDAD_MAX} años.` },
            { campo: campos.numeroTelefono, valido: valores.numeroTelefono && TELEFONO_REGEX.test(valores.numeroTelefono), mensaje: 'El teléfono debe tener entre 7 y 15 dígitos.' },
            { campo: campos.correo, valido: valores.correo && EMAIL_REGEX.test(valores.correo), mensaje: 'Ingresa un correo válido.' },
            { campo: campos.contrasena, valido: valores.contrasena && valores.contrasena.length >= 6, mensaje: 'La contraseña debe tener al menos 6 caracteres.' }
        ];

        chequeos.forEach(({ campo, valido, mensaje }) => {
            if (!campo) return;
            if (!valido) {
                campo.classList.add('is-invalid');
                errores.push(mensaje);
            } else {
                campo.classList.remove('is-invalid');
            }
        });

        if (errores.length) {
            Swal.fire({
                icon: 'error',
                title: 'Corrige los campos marcados',
                html: generarHtmlErrores(errores),
                confirmButtonColor: '#222'
            });
            return;
        }

        try {
            const resp = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: valores.nombre,
                    apellido: valores.apellido,
                    edad: Number(valores.edad),
                    numeroTelefono: valores.numeroTelefono,
                    correo: valores.correo,
                    password: valores.contrasena
                })
            });
            const data = await resp.json();
            if (!resp.ok) {
                throw new Error(data.message || 'No pudimos registrar al usuario.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Usuario registrado',
                text: 'Tu cuenta se creó correctamente. Ahora puedes iniciar sesión.',
                confirmButtonColor: '#222'
            }).then(() => {
                form.reset();
                Object.values(campos).forEach(campo => campo && campo.classList.remove('is-invalid'));
                const modalEl = document.getElementById('modalRegistroUsuario');
                if (modalEl) {
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    modal?.hide();
                }
            });
        } catch (err) {
            const mensaje = err.message || 'Error inesperado al registrar.';
            if (campos.correo && mensaje.toLowerCase().includes('correo')) {
                campos.correo.classList.add('is-invalid');
            }
            Swal.fire({
                icon: 'error',
                title: 'No pudimos registrar al usuario',
                text: mensaje,
                confirmButtonColor: '#222'
            });
        }
    });
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
    configurarFormularioRegistro();
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

                const irARegistro = document.getElementById('mostrarRegistroDesdeLogin');
                if (irARegistro) {
                    irARegistro.addEventListener('click', (e) => {
                        e.preventDefault();
                        const loginModalEl = document.getElementById('loginModal');
                        if (!loginModalEl) return;

                        const abrirRegistro = () => {
                            loginModalEl.removeEventListener('hidden.bs.modal', abrirRegistro);
                            const trigger = document.getElementById('abrirRegistro');
                            if (trigger) {
                                trigger.click();
                                return;
                            }
                            const registroModalEl = document.getElementById('modalRegistroUsuario');
                            if (registroModalEl) {
                                const registroModal = bootstrap.Modal.getOrCreateInstance(registroModalEl);
                                registroModal.show();
                            }
                        };

                        loginModalEl.addEventListener('hidden.bs.modal', abrirRegistro, { once: true });
                        modal.hide();
                    });
                }
            }
        })
        .catch(err => console.error("Error cargando modalogin.html:", err));
});