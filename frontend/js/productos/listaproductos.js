// Animación del buscador expandible
const searchIcon = document.querySelector('.search-icon');
const searchBox = document.querySelector('.buscador input');

if (searchIcon && searchBox) {
    searchIcon.addEventListener('click', () => {
        searchBox.classList.toggle('active');
        if (searchBox.classList.contains('active')) {
            searchBox.focus();
        } else {
            searchBox.value = '';
        }
    });
}

// Array global para mantener todos los productos en memoria
let productosEnMemoria = [];

let siguienteId = 1005; // Ajusta según tu último ID

// Función para renderizar un producto en la pantalla
function renderizarProducto(prod) {
    const lista = document.getElementById('listaProductos');
    const card = document.createElement('div');
    card.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

    card.innerHTML = `
        <div class="card shadow-sm border-0 text-center p-2 producto-card">
            <img src="${prod.imagen || '../images/default.jpg'}"
                 class="card-img-top mx-auto mt-2 rounded"
                 alt="${prod.nombreAlbum || 'Sin nombre'}"
                 style="width: 120px; height: auto;">
            <div class="card-body">
                <h6 class="fw-bold">${prod.nombreAlbum || 'Sin título'}</h6>
                <p class="mb-1"><strong>Artista/Grupo:</strong> ${prod.artistaGrupo || '—'}</p>
                <p class="mb-1"><strong>Categoría:</strong> ${prod.categoria || '—'}</p>
                <p class="mb-1"><strong>Versión:</strong> ${prod.version || '—'}</p>
                <p class="mb-1"><strong>Fecha de lanzamiento:</strong> ${prod.fechaLanzamiento || '—'}</p>
                <button class="btn btn-dark btn-sm mt-2 btn-detalle" data-id="${prod.id}">Ver detalles</button>
            </div>
        </div>
    `;
    lista.appendChild(card);

    // Agregar evento al botón "Ver detalles"
    card.querySelector('.btn-detalle').addEventListener('click', () => {
        mostrarModalProducto(prod);
    });
}

// Función para cargar los productos desde el JSON
async function cargarProductos() {
    try {
        const response = await fetch('../data/productoguardado.json');
        if (!response.ok) throw new Error('Error al cargar los productos');

        productosEnMemoria = await response.json();

        // Renderizar cada producto
        productosEnMemoria.forEach(prod => renderizarProducto(prod));

        // Ajustar siguienteId según el último producto del JSON
        if (productosEnMemoria.length > 0) {
            const maxId = Math.max(...productosEnMemoria.map(p => p.id));
            siguienteId = maxId + 1;
        }

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Función para mostrar el modal del producto
function mostrarModalProducto(producto) {
    document.getElementById('modalImagen').src = producto.imagen || '../images/default.jpg';
    document.getElementById('modalNombre').textContent = producto.nombreAlbum || '—';
    document.getElementById('modalArtista').textContent = producto.artistaGrupo || '—';
    document.getElementById('modalVersion').textContent = producto.version || '—';
    document.getElementById('modalFechaLanzamiento').textContent = producto.fechaLanzamiento || '—';
    document.getElementById('modalIdioma').textContent = producto.idioma || '—';
    document.getElementById('modalDuracion').textContent = producto.duracion || '—';
    document.getElementById('modalPeso').textContent = producto.peso || '—';
    document.getElementById('modalStock').textContent = producto.stock || '—';
    document.getElementById('modalCategoria').textContent = producto.categoria || '—';
    document.getElementById('modalDescripcion').textContent = producto.descripcion || '—';
    document.getElementById('modalFechaCompra').textContent = producto.fechaCompra || '—';
    document.getElementById('modalFechaCaducidad').textContent = producto.fechaCaducidad || '—';

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
}

// Función para agregar un nuevo producto desde el modalRegistro
function agregarProducto(producto) {
    producto.id = siguienteId++;
    productosEnMemoria.push(producto);
    renderizarProducto(producto);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarProductos);