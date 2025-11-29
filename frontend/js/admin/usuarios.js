document.addEventListener('DOMContentLoaded', async () => {
    const tabla = document.getElementById('usuariosTabla');
    const formAgregarUsuario = document.getElementById('formAgregarUsuario');
    const formEditarUsuario = document.getElementById('formEditarUsuario');
    let usuarioEditando = null;

    // ========= CARGAR USUARIOS ==========
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar la lista de usuarios`);
        }

        const usuarios = await response.json();

        if (!Array.isArray(usuarios)) {
            throw new TypeError('La respuesta no es un array');
        }

        tabla.innerHTML = '';

        if (usuarios.length === 0) {
            tabla.innerHTML = '<tr><td colspan="8" class="text-center">No hay usuarios registrados.</td></tr>';
        }

        usuarios.forEach(u => agregarFilaUsuario(u));

    } catch (error) {
        console.error(error);
        tabla.innerHTML = '<tr><td colspan="8" class="text-danger text-center">Error al cargar los datos</td></tr>';
    }

    // ========= AGREGAR USUARIO ==========
    formAgregarUsuario.addEventListener('submit', e => {
        e.preventDefault();

        const nuevoUsuario = {
            nombre: document.getElementById('nombre').value,
            apellidos: document.getElementById('apellidos').value,
            edad: document.getElementById('edad').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            rol: document.getElementById('rol').value,
            contrasena: document.getElementById('contrasena').value,
        };

        // Cierra el modal antes de mostrar la alerta
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario')).hide();

        Swal.fire({
            icon: 'success',
            title: 'Usuario agregado',
            text: 'El usuario se registró correctamente',
            timer: 2000, // Duración de la alerta en milisegundos
            timerProgressBar: true, // Barra de progreso para el temporizador
        });

        agregarFilaUsuario(nuevoUsuario);
        formAgregarUsuario.reset();
    });

    // ========= FUNCIÓN PARA AGREGAR FILAS ==========
    function agregarFilaUsuario(usuario) {
        const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${usuario.nombre}</td>
            <td>${usuario.apellidos}</td>
            <td>${usuario.edad}</td>
            <td>${usuario.telefono}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.contrasena}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        // Guardar info en la fila
        fila.usuarioData = usuario;

        tabla.appendChild(fila);
    }

    // ========= EVENTOS DE EDITAR / ELIMINAR ==========
    tabla.addEventListener('click', e => {
        const fila = e.target.closest('tr');
        if (!fila) return;

        const usuario = fila.usuarioData;

        // ---- EDITAR ----
        if (e.target.closest('.btn-editar')) {
            usuarioEditando = fila;

            document.getElementById('nombreEditar').value = usuario.nombre;
            document.getElementById('apellidosEditar').value = usuario.apellidos;
            document.getElementById('edadEditar').value = usuario.edad;
            document.getElementById('telefonoEditar').value = usuario.telefono;
            document.getElementById('correoEditar').value = usuario.correo;
            document.getElementById('rolEditar').value = usuario.rol;
            document.getElementById('contrasenaEditar').value = usuario.contrasena;

            new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
        }

        // ---- ELIMINAR ----
        if (e.target.closest('.btn-eliminar')) {
            Swal.fire({
                title: '¿Eliminar usuario?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(result => {
                if (result.isConfirmed) {
                    fila.remove();
                    Swal.fire('Eliminado', 'El usuario fue eliminado', 'success');
                }
            });
        }
    });

    // ========= GUARDAR CAMBIOS EN EDICIÓN ==========
    formEditarUsuario.addEventListener('submit', e => {
        e.preventDefault();

        if (!usuarioEditando) return;

        const u = usuarioEditando.usuarioData;

        u.nombre = document.getElementById('nombreEditar').value;
        u.apellidos = document.getElementById('apellidosEditar').value;
        u.edad = document.getElementById('edadEditar').value;
        u.telefono = document.getElementById('telefonoEditar').value;
        u.correo = document.getElementById('correoEditar').value;
        u.rol = document.getElementById('rolEditar').value;
        u.contrasena = document.getElementById('contrasenaEditar').value;

        usuarioEditando.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.apellidos}</td>
            <td>${u.edad}</td>
            <td>${u.telefono}</td>
            <td>${u.correo}</td>
            <td>${u.rol}</td>
            <td>${u.contrasena}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm btn-editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm btn-eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        Swal.fire('Actualizado', 'Los cambios fueron guardados', 'success');

        bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
    });
});
