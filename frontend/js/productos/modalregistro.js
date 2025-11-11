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
    if (!nombreAlbumInput.value.trim() || nombreAlbumInput.value.trim().length < 2) {
        marcarError(nombreAlbumInput, 'Nombre inválido (mínimo 2 caracteres)');
        valido = false;
    } else {
        marcarExito(nombreAlbumInput);
    }

    if (!artistaGrupoInput.value.trim() || artistaGrupoInput.value.trim().length < 2) {
        marcarError(artistaGrupoInput, 'Artista inválido (mínimo 2 caracteres)');
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

    if (!fechaLanzamientoInput.value) {
        marcarError(fechaLanzamientoInput, 'Fecha de lanzamiento requerida');
        valido = false;
    } else {
        marcarExito(fechaLanzamientoInput);
    }

    if (!idiomaInput.value.trim()) {
        marcarError(idiomaInput, 'Idioma requerido');
        valido = false;
    } else {
        marcarExito(idiomaInput);
    }

    if (!duracionInput.value.trim()) {
        marcarError(duracionInput, 'Duración requerida');
        valido = false;
    } else {
        marcarExito(duracionInput);
    }

    if (!pesoInput.value.trim()) {
        marcarError(pesoInput, 'Peso requerido');
        valido = false;
    } else {
        marcarExito(pesoInput);
    }

    if (!stockInput.value || isNaN(stockInput.value) || parseInt(stockInput.value) < 0) {
        marcarError(stockInput, 'Stock inválido (número >=0)');
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

    if (!descripcionInput.value.trim() || descripcionInput.value.trim().length < 10) {
        marcarError(descripcionInput, 'Descripción inválida (mínimo 10 caracteres)');
        valido = false;
    } else {
        marcarExito(descripcionInput);
    }

    if (!fechaCompraInput.value) {
        marcarError(fechaCompraInput, 'Fecha de compra requerida');
        valido = false;
    } else {
        marcarExito(fechaCompraInput);
    }

    if (!fechaCaducidadInput.value) {
        marcarError(fechaCaducidadInput, 'Fecha de caducidad requerida');
        valido = false;
    } else {
        marcarExito(fechaCaducidadInput);
    }

    // Validar orden de fechas
    if (fechaLanzamientoInput.value && fechaCompraInput.value &&
        new Date(fechaLanzamientoInput.value) > new Date(fechaCompraInput.value)) {
        marcarError(fechaCompraInput, 'La fecha de compra debe ser después del lanzamiento');
        valido = false;
    }

    if (fechaCompraInput.value && fechaCaducidadInput.value &&
        new Date(fechaCompraInput.value) > new Date(fechaCaducidadInput.value)) {
        marcarError(fechaCaducidadInput, 'La fecha de caducidad debe ser posterior a la compra');
        valido = false;
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

    // Si todo es válido, agregar producto
    const reader = new FileReader();
    reader.onload = function(e) {
        const producto = {
            nombreAlbum: nombreAlbumInput.value.trim(),
            artistaGrupo: artistaGrupoInput.value.trim(),
            version: versionInput.value.trim(),
            fechaLanzamiento: fechaLanzamientoInput.value,
            idioma: idiomaInput.value.trim(),
            duracion: duracionInput.value.trim(),
            peso: pesoInput.value.trim(),
            stock: parseInt(stockInput.value),
            categoria: categoriaInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            fechaCompra: fechaCompraInput.value,
            fechaCaducidad: fechaCaducidadInput.value,
            imagen: e.target.result
        };

        agregarProducto(producto);

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistro'));
        modal.hide();
        document.getElementById('formRegistroProducto').reset();

        // Limpiar validaciones
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
            input.classList.remove('is-valid');
        });
    };
    reader.readAsDataURL(archivoImagen);
});