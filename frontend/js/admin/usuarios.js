// JS limpio para Admin - Usuarios: listar, crear, editar, eliminar
const API_USERS = '/api/users';
const USUARIOS_CHANNEL_NAME = 'usuarios-sync';
const USUARIOS_ADMIN_SYNC_ID = typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `admin-usuarios-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const usuariosAdminChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(USUARIOS_CHANNEL_NAME) : null;

function notificarCambioUsuarios(tipo, payload = null) {
  if (window.usuariosSync?.notificar) {
    window.usuariosSync.notificar(tipo, payload);
  } else if (usuariosAdminChannel) {
    usuariosAdminChannel.postMessage({ tipo, payload, emisor: USUARIOS_ADMIN_SYNC_ID });
  }
}

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

  function suscribirActualizacionesTiempoReal() {
    if (!usuariosAdminChannel) return;
    usuariosAdminChannel.addEventListener('message', (event) => {
      const { tipo, emisor } = event.data || {};
      if (!tipo || emisor === USUARIOS_ADMIN_SYNC_ID) return;
      if (['usuario-creado', 'usuario-actualizado', 'usuario-eliminado'].includes(tipo)) {
        fetchUsuarios();
      }
    });
  }

  // ------------------ Validación de formularios ------------------
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,}$/;

  function validateName(value) {
    return nameRegex.test(value.trim());
  }

  function validateEdad(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 16 && n <= 99;
  }

  function validateTelefono(value) {
    return /^[0-9]{7,15}$/.test(value.trim());
  }

  function validateEmail(value) {
    // aprovechamos la validación nativa del input
    try {
      return Boolean(value) && /.+@.+\..+/.test(value);
    } catch { return false; }
  }

  function validatePassword(value, required) {
    if (!value) return !required; // si no es requerido y vacío -> válido
    return value.length >= 6;
  }

  function setFieldInvalid(input, message) {
    input.classList.add('is-invalid');
    input.setCustomValidity(message || '');
  }

  function clearFieldInvalid(input) {
    input.classList.remove('is-invalid');
    input.setCustomValidity('');
  }

  function validateForm(form, isEdit = false) {
    let valid = true;
    const errors = [];
    const nombre = form.querySelector(isEdit ? '#nombreEditar' : '#nombre');
    const apellido = form.querySelector(isEdit ? '#apellidoEditar' : '#apellido');
    const edad = form.querySelector(isEdit ? '#edadEditar' : '#edad');
    const telefono = form.querySelector(isEdit ? '#numeroTelefonoEditar' : '#numeroTelefono');
    const correo = form.querySelector(isEdit ? '#correoEditar' : '#correo');
    const pass = form.querySelector(isEdit ? '#contrasenaEditar' : '#contrasena');
    const rol = form.querySelector(isEdit ? '#rolEditar' : '#rol');

    // Nombre
    if (!validateName(nombre.value)) {
      setFieldInvalid(nombre, 'Nombre inválido. Sólo letras y espacios, mínimo 2 caracteres.');
      errors.push('Nombre: usa sólo letras y espacios (mínimo 2 caracteres).');
      valid = false;
    } else clearFieldInvalid(nombre);

    // Apellido
    if (!validateName(apellido.value)) {
      setFieldInvalid(apellido, 'Apellido inválido. Sólo letras y espacios, mínimo 2 caracteres.');
      errors.push('Apellidos: usa sólo letras y espacios (mínimo 2 caracteres).');
      valid = false;
    } else clearFieldInvalid(apellido);

    // Edad
    if (!validateEdad(edad.value)) {
      setFieldInvalid(edad, 'Edad fuera de rango. Ingrese 16-99.');
      errors.push('Edad: debe estar entre 16 y 99 años, sólo números enteros.');
      valid = false;
    } else clearFieldInvalid(edad);

    // Teléfono
    if (!validateTelefono(telefono.value)) {
      setFieldInvalid(telefono, 'Teléfono inválido. Sólo dígitos (7-15).');
      errors.push('Teléfono: ingresa sólo números (7 a 15 dígitos) sin espacios ni símbolos.');
      valid = false;
    } else clearFieldInvalid(telefono);

    // Correo
    if (!validateEmail(correo.value)) {
      setFieldInvalid(correo, 'Correo inválido. Ej: usuario@dominio.com');
      errors.push('Correo: formato válido requerido (ejemplo@dominio.com).');
      valid = false;
    } else clearFieldInvalid(correo);

    // Rol
    if (!rol.value) {
      setFieldInvalid(rol, 'Seleccione un rol.');
      errors.push('Rol: selecciona una opción (Usuario, Gerente o Admin).');
      valid = false;
    } else clearFieldInvalid(rol);

    // Password
    const passRequired = !isEdit; // en editar no es obligatorio
    if (!validatePassword(pass.value, passRequired)) {
      setFieldInvalid(pass, 'Contraseña inválida. Mínimo 6 caracteres.');
      errors.push('Contraseña: mínimo 6 caracteres alfanuméricos.');
      valid = false;
    } else clearFieldInvalid(pass);

    if (!valid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
    }
    return { valid, errors };
  }

  // listeners en tiempo real para limpiar mensajes
  function attachRealtimeValidation() {
    const inputs = document.querySelectorAll('#formAgregarUsuario input, #formAgregarUsuario select, #formEditarUsuario input, #formEditarUsuario select');
    inputs.forEach(inp => {
      inp.addEventListener('input', () => {
        // limpiar clase y customValidity
        if (inp.classList.contains('is-invalid')) clearFieldInvalid(inp);
      });
    });
  }

  attachRealtimeValidation();
  suscribirActualizacionesTiempoReal();

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
      // validación previa
      const { valid, errors } = validateForm(formAgregar, false);
      if (!valid) {
        const htmlList = errors.length
          ? `<ul class="text-start mb-0">${errors.map(err => `<li>${err}</li>`).join('')}</ul>`
          : 'Corrige los campos marcados en rojo.';
        Swal.fire({ icon: 'error', title: 'Datos inválidos', html: htmlList });
        return;
      }
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
        notificarCambioUsuarios('usuario-creado');
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
          notificarCambioUsuarios('usuario-eliminado', { id });
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
      // validación previa (en editar la contraseña es opcional)
      const { valid, errors } = validateForm(formEditar, true);
      if (!valid) {
        const htmlList = errors.length
          ? `<ul class="text-start mb-0">${errors.map(err => `<li>${err}</li>`).join('')}</ul>`
          : 'Corrige los campos marcados en rojo.';
        Swal.fire({ icon: 'error', title: 'Datos inválidos', html: htmlList });
        return;
      }
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
        notificarCambioUsuarios('usuario-actualizado', { id: usuarioEditandoId });
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
