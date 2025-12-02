// Este script no es estrictamente necesario porque Bootstrap ya maneja el menú hamburguesa.
// Pero lo dejamos para posibles animaciones personalizadas.
document.addEventListener('DOMContentLoaded', () => {
    console.log('K-Bias Merch loaded');
});


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