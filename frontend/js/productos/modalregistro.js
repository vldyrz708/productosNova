// Configurar límites de fechas
const fechaLanzamientoInput = document.getElementById('fechaLanzamiento');
const fechaCompraInput = document.getElementById('fechaCompra');
const fechaCaducidadInput = document.getElementById('fechaCaducidad');

if (fechaLanzamientoInput) {
    // Fecha de lanzamiento: máximo hoy
    const hoy = new Date().toISOString().split('T')[0];
    fechaLanzamientoInput.setAttribute('max', hoy);
    
    // Cuando cambia fecha de lanzamiento, actualizar mínimo de fecha de compra
    fechaLanzamientoInput.addEventListener('change', (e) => {
        if (e.target.value) {
            // La fecha de compra puede ser igual a la fecha de lanzamiento
            fechaCompraInput.setAttribute('min', e.target.value);
        }
    });
}

if (fechaCompraInput) {
    // Fecha de compra: máximo hoy
    const hoy = new Date().toISOString().split('T')[0];
    fechaCompraInput.setAttribute('max', hoy);
    
    // Cuando cambia fecha de compra, actualizar mínimo de fecha de caducidad
    fechaCompraInput.addEventListener('change', (e) => {
        if (e.target.value) {
            const fechaCompra = new Date(e.target.value);
            fechaCompra.setDate(fechaCompra.getDate() + 1);
            const minCaducidad = fechaCompra.toISOString().split('T')[0];
            fechaCaducidadInput.setAttribute('min', minCaducidad);
        }
    });
}

if (fechaCaducidadInput) {
    // Fecha de caducidad: mínimo mañana
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    fechaCaducidadInput.setAttribute('min', manana.toISOString().split('T')[0]);
}

// Formatear duración automáticamente mientras se escribe
const duracionInput = document.getElementById('duracion');
if (duracionInput) {
    duracionInput.addEventListener('input', (e) => {
        // Solo permitir números
        let valor = e.target.value.replace(/\D/g, '');
        
        // Limitar a 4 dígitos
        if (valor.length > 4) {
            valor = valor.slice(0, 4);
        }
        
        e.target.value = valor;
    });
    
    duracionInput.addEventListener('blur', (e) => {
        // Al salir del campo, agregar ceros si es necesario y formatear
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 0) {
            // Rellenar con ceros a la izquierda si es necesario
            valor = valor.padStart(4, '0');
            
            // Formatear como MM:SS
            const minutos = valor.slice(0, 2);
            const segundos = valor.slice(2, 4);
            
            // Validar que los segundos no sean mayores a 59
            if (parseInt(segundos) > 59) {
                e.target.value = minutos + '59';
            } else {
                e.target.value = minutos + segundos;
            }
        }
    });
}

document.getElementById('guardarProducto').addEventListener('click', () => {
    // Función helper para marcar un input
    function marcarError(input, mensaje) {
        input.classList.add('is-invalid');
        input.nextElementSibling.textContent = mensaje;
    }

    function marcarExito(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    // Obtener inputs
    const nombreAlbumInput = document.getElementById('nombreAlbum');
    const artistaGrupoInput = document.getElementById('artistaGrupo');
    const versionInput = document.getElementById('version');
    const fechaLanzamientoInput = document.getElementById('fechaLanzamiento');
    const idiomaInput = document.getElementById('idioma');
    const duracionInput = document.getElementById('duracion');
    const pesoInput = document.getElementById('peso');
    const precioInput = document.getElementById('precio');
    const stockInput = document.getElementById('stock');
    const categoriaInput = document.getElementById('categoria');
    const descripcionInput = document.getElementById('descripcion');
    const fechaCompraInput = document.getElementById('fechaCompra');
    const fechaCaducidadInput = document.getElementById('fechaCaducidad');
    const imagenInput = document.getElementById('imagen');

    // Limpiar validaciones anteriores
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
    });

    let valido = true;

    // Validaciones
    if (!nombreAlbumInput.value.trim() || nombreAlbumInput.value.trim().length < 2 || nombreAlbumInput.value.trim().length > 100) {
        marcarError(nombreAlbumInput, 'Nombre inválido (2-100 caracteres)');
        valido = false;
    } else {
        marcarExito(nombreAlbumInput);
    }

    if (!artistaGrupoInput.value.trim() || artistaGrupoInput.value.trim().length < 2 || artistaGrupoInput.value.trim().length > 100) {
        marcarError(artistaGrupoInput, 'Artista inválido (2-100 caracteres)');
        valido = false;
    } else {
        marcarExito(artistaGrupoInput);
    }

    if (!versionInput.value.trim()) {
        marcarError(versionInput, 'Versión requerida');
        valido = false;
    } else {
        marcarExito(versionInput);
    }

    // Validar fecha de lanzamiento (debe ser menor o igual a hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (!fechaLanzamientoInput.value) {
        marcarError(fechaLanzamientoInput, 'Fecha de lanzamiento requerida');
        valido = false;
    } else {
        const fechaLanzamiento = new Date(fechaLanzamientoInput.value + 'T00:00:00');
        if (fechaLanzamiento > hoy) {
            marcarError(fechaLanzamientoInput, 'Fecha de lanzamiento debe ser menor o igual a hoy');
            valido = false;
        } else {
            marcarExito(fechaLanzamientoInput);
        }
    }

    if (!idiomaInput.value.trim()) {
        marcarError(idiomaInput, 'Idioma requerido');
        valido = false;
    } else {
        marcarExito(idiomaInput);
    }

    if (!duracionInput.value.trim() || duracionInput.value.length !== 4) {
        marcarError(duracionInput, 'Duración requerida (4 dígitos, ej: 0345)');
        valido = false;
    } else {
        marcarExito(duracionInput);
    }

    if (!pesoInput.value || isNaN(pesoInput.value) || parseInt(pesoInput.value) < 1 || parseInt(pesoInput.value) > 2000) {
        marcarError(pesoInput, 'Peso inválido (1-2000 gramos)');
        valido = false;
    } else {
        marcarExito(pesoInput);
    }

    if (!precioInput.value || isNaN(precioInput.value) || parseFloat(precioInput.value) < 0.01) {
        marcarError(precioInput, 'Precio inválido (debe ser mayor a 0)');
        valido = false;
    } else {
        marcarExito(precioInput);
    }

    if (!stockInput.value || isNaN(stockInput.value) || parseInt(stockInput.value) < 1 || parseInt(stockInput.value) > 10000) {
        marcarError(stockInput, 'Stock inválido (1-10000 unidades)');
        valido = false;
    } else {
        marcarExito(stockInput);
    }

    if (!categoriaInput.value.trim()) {
        marcarError(categoriaInput, 'Categoría requerida');
        valido = false;
    } else {
        marcarExito(categoriaInput);
    }

    if (!descripcionInput.value.trim() || descripcionInput.value.trim().length < 10 || descripcionInput.value.trim().length > 500) {
        marcarError(descripcionInput, 'Descripción inválida (10-500 caracteres)');
        valido = false;
    } else {
        marcarExito(descripcionInput);
    }

    // Validar fecha de compra (mayor o igual a lanzamiento y menor o igual a hoy)
    if (!fechaCompraInput.value) {
        marcarError(fechaCompraInput, 'Fecha de compra requerida');
        valido = false;
    } else {
        const fechaCompra = new Date(fechaCompraInput.value + 'T00:00:00');
        const fechaLanzamiento = new Date(fechaLanzamientoInput.value + 'T00:00:00');
        
        if (fechaCompra < fechaLanzamiento) {
            marcarError(fechaCompraInput, 'Fecha de compra debe ser mayor o igual a fecha de lanzamiento');
            valido = false;
        } else if (fechaCompra > hoy) {
            marcarError(fechaCompraInput, 'Fecha de compra debe ser menor o igual a hoy');
            valido = false;
        } else {
            marcarExito(fechaCompraInput);
        }
    }

    // Validar fecha de caducidad (mayor a compra y mayor a hoy)
    if (!fechaCaducidadInput.value) {
        marcarError(fechaCaducidadInput, 'Fecha de caducidad requerida');
        valido = false;
    } else {
        const fechaCaducidad = new Date(fechaCaducidadInput.value + 'T00:00:00');
        const fechaCompra = new Date(fechaCompraInput.value + 'T00:00:00');
        
        if (fechaCaducidad <= fechaCompra) {
            marcarError(fechaCaducidadInput, 'Fecha de caducidad debe ser mayor a fecha de compra');
            valido = false;
        } else if (fechaCaducidad <= hoy) {
            marcarError(fechaCaducidadInput, 'Fecha de caducidad debe ser mayor a hoy');
            valido = false;
        } else {
            marcarExito(fechaCaducidadInput);
        }
    }

    // Validar imagen
    const archivoImagen = imagenInput.files[0];
    if (!archivoImagen) {
        marcarError(imagenInput, 'Selecciona una imagen');
        valido = false;
    } else if (!archivoImagen.type.startsWith('image/')) {
        marcarError(imagenInput, 'Archivo no es imagen');
        valido = false;
    } else if (archivoImagen.size > 5 * 1024 * 1024) {
        marcarError(imagenInput, 'Imagen demasiado grande (máx 5MB)');
        valido = false;
    } else {
        marcarExito(imagenInput);
    }

    if (!valido) return;

    // Validar que no exista un producto con el mismo nombre y artista
    const nombreAlbum = nombreAlbumInput.value.trim().toLowerCase();
    const artistaGrupo = artistaGrupoInput.value.trim().toLowerCase();
    
    const productoExistente = productosEnMemoria.find(p => 
        p.nombreAlbum.toLowerCase() === nombreAlbum && 
        p.artistaGrupo.toLowerCase() === artistaGrupo
    );
    
    if (productoExistente) {
        Swal.fire({
            icon: 'warning',
            title: 'Producto duplicado',
            text: `Ya existe un producto con el nombre "${nombreAlbumInput.value.trim()}" del artista/grupo "${artistaGrupoInput.value.trim()}"`,
            confirmButtonColor: '#212529'
        });
        return;
    }

    // Si todo es válido, enviar producto a la API
    // Formatear duración con dos puntos (MMSS → MM:SS)
    const duracionFormateada = duracionInput.value.trim();
    const duracionConPuntos = duracionFormateada.slice(0, 2) + ':' + duracionFormateada.slice(2);
    
    const formData = new FormData();
    formData.append('nombreAlbum', nombreAlbumInput.value.trim());
    formData.append('artistaGrupo', artistaGrupoInput.value.trim());
    formData.append('version', versionInput.value.trim());
    formData.append('fechaLanzamiento', fechaLanzamientoInput.value);
    formData.append('idioma', idiomaInput.value.trim());
    formData.append('duracion', duracionConPuntos);
    formData.append('peso', parseInt(pesoInput.value));
    formData.append('precio', parseFloat(precioInput.value));
    formData.append('stock', parseInt(stockInput.value));
    formData.append('categoria', categoriaInput.value.trim());
    formData.append('descripcion', descripcionInput.value.trim());
    formData.append('fechaCompra', fechaCompraInput.value);
    formData.append('fechaCaducidad', fechaCaducidadInput.value);
    formData.append('fotoAlbum', archivoImagen);

    // Enviar a la API
    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al guardar el producto');
        return response.json();
    })
    .then(data => {
        console.log('Producto guardado:', data);
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistro'));
        modal.hide();
        
        // Resetear formulario
        document.getElementById('formRegistroProducto').reset();
        
        // Limpiar validaciones
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.remove('is-valid');
        });
        
        // Recargar productos
        cargarProductos();
        
        Swal.fire({
            icon: 'success',
            title: 'Producto agregado',
            text: 'El producto se ha registrado exitosamente',
            confirmButtonColor: '#212529',
            timer: 2000,
            timerProgressBar: true
        });
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo guardar el producto. Verifica que el servidor esté corriendo.',
            confirmButtonColor: '#212529'
        });
    });
});