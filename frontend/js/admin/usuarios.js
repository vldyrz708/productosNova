// JS limpio para Admin - Usuarios: listar, crear, editar, eliminar
const API_USERS = '/api/users';

document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById('usuariosTabla'); // tbody
  const formAgregar = document.getElementById('formAgregarUsuario');
  const formEditar = document.getElementById('formEditarUsuario');
  let usuariosCache = [];
  let usuarioEditandoId = null;

  async function fetchUsuarios() {
    try {
      const res = await fetch(API_USERS);
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      usuariosCache = data.users || [];
      renderTabla(usuariosCache);
    } catch (err) {
      console.error(err);
      tabla.innerHTML = '<tr><td colspan="8" class="text-danger text-center">Error al cargar los datos</td></tr>';
    }
  }

  function renderTabla(users) {
    tabla.innerHTML = '';
    if (!users || users.length === 0) {
      tabla.innerHTML = '<tr><td colspan="8" class="text-center">No hay usuarios registrados.</td></tr>';
      return;
    }
    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.dataset.id = u._id;
      tr.innerHTML = `
        <td>${u.nombre || ''}</td>
        <td>${u.apellido || ''}</td>
        <td>${u.edad ?? ''}</td>
        <td>${u.numeroTelefono || ''}</td>
        <td>${u.correo || ''}</td>
        <td>${u.rol || ''}</td>
        <td>••••••</td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-editar"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-eliminar"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  async function crearUsuario(payload) {
    const res = await fetch(API_USERS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear usuario');
    return data.user;
  }

  async function actualizarUsuario(id, cambios) {
    const res = await fetch(`${API_USERS}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario');
    return data.user;
  }

  async function eliminarUsuario(id) {
    const res = await fetch(`${API_USERS}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(()=>({}));
      throw new Error(data.message || 'Error al eliminar usuario');
    }
    return true;
  }

  // Manejo del formulario agregar
  if (formAgregar) {
    formAgregar.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        edad: Number(document.getElementById('edad').value),
        numeroTelefono: document.getElementById('numeroTelefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        contrasena: document.getElementById('contrasena').value,
        rol: document.getElementById('rol').value
      };
      try {
        await crearUsuario(payload);
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarUsuario')).hide();
        await fetchUsuarios();
        Swal.fire('Creado', 'Usuario creado correctamente', 'success');
        formAgregar.reset();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo crear el usuario', 'error');
      }
    });
  }

  // Delegación de eventos en la tabla
  tabla.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.dataset.id;

    if (e.target.closest('.btn-eliminar')) {
      const res = await Swal.fire({
        title: 'Eliminar usuario?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar'
      });
      if (res.isConfirmed) {
        try {
          await eliminarUsuario(id);
          await fetchUsuarios();
          Swal.fire('Eliminado', 'Usuario eliminado', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('Error', err.message || 'No se pudo eliminar', 'error');
        }
      }
    }

    if (e.target.closest('.btn-editar')) {
      const usuario = usuariosCache.find(u => u._id === id);
      if (!usuario) return;
      usuarioEditandoId = id;
      // rellenar formulario editar
      document.getElementById('nombreEditar').value = usuario.nombre || '';
      document.getElementById('apellidoEditar').value = usuario.apellido || '';
      document.getElementById('edadEditar').value = usuario.edad || '';
      document.getElementById('numeroTelefonoEditar').value = usuario.numeroTelefono || '';
      document.getElementById('correoEditar').value = usuario.correo || '';
      document.getElementById('rolEditar').value = usuario.rol || '';
      document.getElementById('contrasenaEditar').value = '';
      new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
    }
  });

  // Guardar edición
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!usuarioEditandoId) return;
      const cambios = {
        nombre: document.getElementById('nombreEditar').value.trim(),
        apellido: document.getElementById('apellidoEditar').value.trim(),
        edad: Number(document.getElementById('edadEditar').value),
        numeroTelefono: document.getElementById('numeroTelefonoEditar').value.trim(),
        correo: document.getElementById('correoEditar').value.trim(),
        rol: document.getElementById('rolEditar').value
      };
      const pass = document.getElementById('contrasenaEditar').value;
      if (pass) cambios.contrasena = pass;
      try {
        await actualizarUsuario(usuarioEditandoId, cambios);
        bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
        await fetchUsuarios();
        Swal.fire('Actualizado', 'Usuario actualizado', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'No se pudo actualizar', 'error');
      }
    });
  }

  // Inicializar
  fetchUsuarios();
});
