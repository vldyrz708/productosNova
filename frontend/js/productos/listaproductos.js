// Array global para mantener todos los productos en memoria
let productosEnMemoria = [];

// Buscador en tiempo real
const searchBox = document.getElementById('buscadorInput');

if (searchBox) {
    // Búsqueda en tiempo real
    searchBox.addEventListener('input', (e) => {
        const terminoBusqueda = e.target.value.toLowerCase().trim();
        filtrarProductos(terminoBusqueda);
    });
}

// Función para filtrar productos en tiempo real
function filtrarProductos(termino) {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = ''; // Limpiar lista
    
    if (!termino) {
        // Si no hay término de búsqueda, mostrar todos
        productosEnMemoria.forEach(prod => renderizarProducto(prod));
        return;
    }
    
    // Filtrar productos que coincidan con el término
    const productosFiltrados = productosEnMemoria.filter(prod => {
        const nombreAlbum = (prod.nombreAlbum || '').toLowerCase();
        const artistaGrupo = (prod.artistaGrupo || '').toLowerCase();
        const categoria = (prod.categoria || '').toString().toLowerCase();
        const version = (prod.version || '').toLowerCase();
        
        return nombreAlbum.includes(termino) || 
               artistaGrupo.includes(termino) || 
               categoria.includes(termino) ||
               version.includes(termino);
    });
    
    // Mostrar mensaje si no hay resultados
    if (productosFiltrados.length === 0) {
        lista.innerHTML = `
            <div class="col-12 text-center py-5">
                <h5 class="text-muted">No se encontraron productos con "${termino}"</h5>
            </div>
        `;
        return;
    }
    
    // Renderizar productos filtrados
    productosFiltrados.forEach(prod => renderizarProducto(prod));
}

// Función para renderizar un producto en la pantalla
function renderizarProducto(prod) {
    const lista = document.getElementById('listaProductos');
    const card = document.createElement('div');
    card.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

    // Construir URL de imagen desde el servidor
    const imagenUrl = prod.fotoAlbum ? `http://localhost:3000/${prod.fotoAlbum}` : '../images/logo.png';

    card.innerHTML = `
        <div class="card shadow-sm border-0 text-center p-2 producto-card">
            <img src="${imagenUrl}"
                 class="card-img-top mx-auto mt-2 rounded"
                 alt="${prod.nombreAlbum || 'Sin nombre'}"
                 style="width: 120px; height: auto;">
            <div class="card-body">
                <h6 class="fw-bold">${prod.nombreAlbum || 'Sin título'}</h6>
                <p class="mb-1"><strong>Artista/Grupo:</strong> ${prod.artistaGrupo || '—'}</p>
                <p class="mb-1"><strong>Categoría:</strong> ${prod.categoria || '—'}</p>
                <p class="mb-1"><strong>Versión:</strong> ${prod.version || '—'}</p>
                <p class="mb-1"><strong>Fecha de lanzamiento:</strong> ${formatearFecha(prod.fechaLanzamiento)}</p>
                <button class="btn btn-dark btn-sm mt-2 btn-detalle" data-id="${prod._id}">Ver detalles</button>
            </div>
        </div>
    `;
    lista.appendChild(card);

    // Agregar evento al botón "Ver detalles"
    card.querySelector('.btn-detalle').addEventListener('click', () => {
        mostrarModalProducto(prod);
    });
}

// Función para cargar los productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar los productos');

        const data = await response.json();
        productosEnMemoria = data.albums || [];

        // Limpiar lista antes de renderizar
        document.getElementById('listaProductos').innerHTML = '';

        // Renderizar cada producto
        productosEnMemoria.forEach(prod => renderizarProducto(prod));

    } catch (error) {
        console.error('Error al cargar productos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar productos',
            text: 'No se pudieron cargar los productos. Verifica que el servidor esté corriendo en el puerto 3000.',
            confirmButtonColor: '#212529'
        });
    }
}

// Función auxiliar para formatear fecha (eliminar hora)
function formatearFecha(fecha) {
    if (!fecha) return '—';
    // Si la fecha viene con formato ISO (2025-09-01T00:00:00.000Z), extraer solo la fecha
    return fecha.split('T')[0];
}

// Función para mostrar el modal del producto
function mostrarModalProducto(producto) {
    const imagenUrl = producto.fotoAlbum ? `http://localhost:3000/${producto.fotoAlbum}` : '../images/logo.png';
    
    document.getElementById('modalImagen').src = imagenUrl;
    document.getElementById('modalNombre').textContent = producto.nombreAlbum || '—';
    document.getElementById('modalArtista').textContent = producto.artistaGrupo || '—';
    document.getElementById('modalVersion').textContent = producto.version || '—';
    document.getElementById('modalFechaLanzamiento').textContent = formatearFecha(producto.fechaLanzamiento);
    document.getElementById('modalIdioma').textContent = producto.idioma || '—';
    document.getElementById('modalDuracion').textContent = producto.duracion || '—';
    document.getElementById('modalPeso').textContent = producto.peso || '—';
    document.getElementById('modalStock').textContent = producto.stock || '—';
    document.getElementById('modalCategoria').textContent = producto.categoria || '—';
    document.getElementById('modalDescripcion').textContent = producto.descripcion || '—';
    document.getElementById('modalFechaCompra').textContent = formatearFecha(producto.fechaCompra);
    document.getElementById('modalFechaCaducidad').textContent = formatearFecha(producto.fechaCaducidad);

    // Guardar el ID del producto actual en el modal para usarlo al editar/eliminar
    document.getElementById('modalProducto').dataset.productoId = producto._id;

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

// Función para agregar un nuevo producto desde el modalRegistro (ahora recarga productos)
function agregarProducto(producto) {
    productosEnMemoria.push(producto);
    renderizarProducto(producto);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);