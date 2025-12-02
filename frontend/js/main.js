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
        })
        .catch(err => console.error("Error cargando modalogin.html:", err));
});