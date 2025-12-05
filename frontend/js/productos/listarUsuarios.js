const USUARIOS_SYNC_CHANNEL = 'usuarios-sync';
const USUARIOS_SYNC_ID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const usuariosChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(USUARIOS_SYNC_CHANNEL) : null;

if (usuariosChannel) {
    usuariosChannel.addEventListener('message', (event) => {
        const { tipo, emisor } = event.data || {};
        if (!tipo || emisor === USUARIOS_SYNC_ID) return;
        if (['usuario-creado', 'usuario-actualizado', 'usuario-eliminado'].includes(tipo)) {
            cargarUsuarios();
        }
    });
}

window.usuariosSync = Object.assign({}, window.usuariosSync, {
    notificar: (tipo, payload = null) => {
        if (!usuariosChannel) return;
        usuariosChannel.postMessage({ tipo, payload, emisor: USUARIOS_SYNC_ID });
    }
});

// Cargar usuarios reales desde la API y renderizar en la tabla
async function cargarUsuarios() {
    const tbody = document.getElementById('cuerpoTablaUsuarios');
    if (!tbody) return;

    // Mostrar fila de carga
    tbody.innerHTML = `<tr><td colspan="6">Cargando usuarios...</td></tr>`;

    try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // la API devuelve { success: true, users: [...] } o directamente un array
        const usuarios = Array.isArray(data) ? data : (data.users || []);
        if (!Array.isArray(usuarios) || usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">No se encontraron usuarios registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        usuarios.forEach(u => {
            const fila = document.createElement('tr');

            const nombre = u.nombre || u.firstName || '—';
            const apellido = u.apellido || u.lastName || '—';
            const edad = u.edad ?? '—';
            const telefono = u.numeroTelefono || u.telefono || u.phone || '—';
            const rol = u.rol || u.role || '—';
            const correo = u.correo || u.email || '—';

            fila.innerHTML = `
                <td>${nombre}</td>
                <td>${apellido}</td>
                <td>${edad}</td>
                <td>${telefono}</td>
                <td>${rol}</td>
                <td>${correo}</td>
            `;

            tbody.appendChild(fila);
        });
    } catch (err) {
        console.error('Error cargando usuarios:', err);
        tbody.innerHTML = `<tr><td colspan="6">Error al cargar usuarios. Ver consola para más detalles.</td></tr>`;
    }
}

window.addEventListener('DOMContentLoaded', cargarUsuarios);