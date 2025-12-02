// Array global para mantener todos los productos en memoria
let productosEnMemoria = [];

// Configurar buscador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('buscadorInput');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            const terminoBusqueda = e.target.value.toLowerCase().trim();
            filtrarProductos(terminoBusqueda);
        });
    }
});

// Función para filtrar productos en tiempo real
function filtrarProductos(termino) {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '';

    if (!termino) {
        productosEnMemoria.forEach(prod => renderizarProducto(prod));
        return;
    }

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

    if (productosFiltrados.length === 0) {
        lista.innerHTML = `
            <div class="col-12 text-center py-5">
                <h5 class="text-muted">No se encontraron productos con "${termino}"</h5>
            </div>
        `;
        return;
    }

    productosFiltrados.forEach(prod => renderizarProducto(prod));
}

// =======================================================
//   🟦 NUEVA FUNCIÓN — CARDS CON DISEÑO UNIFORME
// =======================================================
function renderizarProducto(prod) {
    const lista = document.getElementById('listaProductos');
    const card = document.createElement('div');
    card.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

    const imagenUrl = prod.fotoAlbum ? `http://localhost:3000/${prod.fotoAlbum}` : '../images/logo.png';
    const stockValor = Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0;
    const stockDisponible = stockValor > 0;
    const stockEstadoClase = stockDisponible ? 'stock-available' : 'stock-out';
    const stockTexto = stockDisponible ? `${stockValor} en stock` : 'Sin stock';

    card.innerHTML = `
        <div class="producto-card">
            
            <!-- CONTENEDOR FIJO PARA LA IMAGEN -->
            <div class="img-container">
                <img src="${imagenUrl}" 
                     alt="${prod.nombreAlbum || 'Sin nombre'}">
            </div>

            <!-- CUERPO DEL CARD -->
            <div class="card-body">
                <h6 class="fw-bold">${prod.nombreAlbum || 'Sin título'}</h6>
                <p><strong>Artista:</strong> ${prod.artistaGrupo || '—'}</p>
                <p><strong>Categoría:</strong> ${prod.categoria || '—'}</p>
                <p><strong>Versión:</strong> ${prod.version || '—'}</p>
                <p><strong>Lanzamiento:</strong> ${formatearFecha(prod.fechaLanzamiento)}</p>

                <div class="mt-2">
                    <div class="stock-indicator">
                        <span class="stock-badge ${stockEstadoClase}"></span>
                        <span class="stock-label ${stockEstadoClase}">${stockTexto}</span>
                    </div>
                </div>

                <button class="btn mt-3 btn-detalle" data-id="${prod._id}">
                    Ver detalles
                </button>
            </div>
        </div>
    `;

    lista.appendChild(card);

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

        document.getElementById('listaProductos').innerHTML = '';
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

// Función auxiliar para formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '—';
    return fecha.split('T')[0];
}

// Mostrar modal
function mostrarModalProducto(producto) {
    // Seguridad: comprobar elementos del DOM antes de usarlos
    const imagenUrl = producto && producto.fotoAlbum ? `http://localhost:3000/${producto.fotoAlbum}` : '../images/logo.png';

    const elImagen = document.getElementById('modalImagen');
    if (elImagen) {
        elImagen.src = imagenUrl;
        elImagen.dataset.rutaOriginal = producto && producto.fotoAlbum ? producto.fotoAlbum : '';
    }

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('modalNombre', producto?.nombreAlbum || '—');
    setText('modalArtista', producto?.artistaGrupo || '—');
    setText('modalVersion', producto?.version || '—');
    setText('modalFechaLanzamiento', formatearFecha(producto?.fechaLanzamiento));
    setText('modalIdioma', Array.isArray(producto?.idioma) ? producto.idioma.join(', ') : (producto?.idioma || '—'));
    setText('modalDuracion', producto?.duracion || '—');
    setText('modalPeso', producto?.peso ?? '—');
    setText('modalPrecio', (producto?.precio !== undefined && producto?.precio !== null && producto?.precio !== '') ? `$${producto.precio}` : '—');

    const stockElemento = document.getElementById('modalStock');
    const stockNumerico = Number(producto?.stock);
    const tieneNumero = Number.isFinite(stockNumerico);
    const stockValorMostrar = tieneNumero ? stockNumerico : (producto && producto.stock !== undefined && producto.stock !== null ? producto.stock : '—');
    if (stockElemento) {
        stockElemento.textContent = stockValorMostrar;
        stockElemento.classList.remove('stock-text-available', 'stock-text-out');
        if (tieneNumero && stockNumerico > 0) stockElemento.classList.add('stock-text-available');
        else if (tieneNumero && stockNumerico === 0) stockElemento.classList.add('stock-text-out');
    }

    setText('modalCategoria', producto?.categoria || '—');
    setText('modalDescripcion', producto?.descripcion || '—');
    setText('modalFechaCompra', formatearFecha(producto?.fechaCompra));
    setText('modalFechaCaducidad', formatearFecha(producto?.fechaCaducidad));

    const modalProductoEl = document.getElementById('modalProducto');
    if (modalProductoEl) {
        modalProductoEl.dataset.productoId = producto?._id || '';
        const modal = new bootstrap.Modal(modalProductoEl);
        modal.show();
    }
}

function agregarProducto(producto) {
    productosEnMemoria.push(producto);
    renderizarProducto(producto);
}

document.addEventListener('DOMContentLoaded', cargarProductos);