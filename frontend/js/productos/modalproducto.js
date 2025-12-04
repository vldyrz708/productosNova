// Esperar a que el DOM esté listo
setTimeout(() => {
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const modalElement = document.getElementById('modalProducto');

    if (!btnEditar || !btnEliminar || !modalElement) {
        console.error('⚠️ No se encontraron los elementos del modal');
        return;
    }

    // Restaurar estado del modal cuando se cierra
    modalElement.addEventListener('hidden.bs.modal', () => {
        // Restaurar todos los inputs y selects a spans si el modal estaba en modo edición
        const campos = modalElement.querySelectorAll('input[data-id-campo], select[data-id-campo]');
        if (campos.length > 0) {
            campos.forEach(campo => {
                const span = document.createElement('span');
                span.id = campo.dataset.idCampo;
                span.textContent = campo.value.trim() || '—';
                campo.replaceWith(span);
            });
        }

        // Eliminar label e input de imagen si existen
        const contenedorImagen = document.getElementById('contenedorImagen');
        if (contenedorImagen) {
            const labelImagen = contenedorImagen.querySelector('label');
            const inputImagen = document.getElementById('inputEditarImagen');
            
            if (labelImagen) labelImagen.remove();
            if (inputImagen) inputImagen.remove();
        }

        // Eliminar botones de Guardar/Cancelar si existen
        const contenedorBotones = modalElement.querySelector('.d-flex.justify-content-center.gap-3.mt-3');
        if (contenedorBotones) {
            contenedorBotones.remove();
        }

        // Asegurar que los botones Editar y Eliminar estén visibles
        btnEditar.style.display = 'inline-block';
        btnEliminar.style.display = 'inline-block';
    });

    // --- ELIMINAR PRODUCTO ---
    btnEliminar.addEventListener('click', () => {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
            const productoId = modalElement.dataset.productoId;
            
            fetch(`${API_URL}/${productoId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al eliminar el producto');
                return response.json();
            })
            .then(data => {
                console.log('Producto eliminado:', data);
                
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                
                // Recargar productos
                cargarProductos();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Producto eliminado',
                    text: 'El producto se ha eliminado correctamente',
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
                    text: 'No se pudo eliminar el producto. Verifica que el servidor esté corriendo.',
                    confirmButtonColor: '#212529'
                });
            });
            }
        });
    });

    // --- EDITAR PRODUCTO ---
    btnEditar.addEventListener('click', () => {
        const campos = modalElement.querySelectorAll('span[id^="modal"]');

        // Guardar valores originales antes de editar
        const valoresOriginales = new Map();
        
        // Agregar input de archivo para cambiar la imagen
        const contenedorImagen = document.getElementById('contenedorImagen');
        const imagenActual = document.getElementById('modalImagen');
        
        // Crear label y input de archivo
        const labelImagen = document.createElement('label');
        labelImagen.textContent = 'Cambiar imagen (opcional):';
        labelImagen.id = 'labelEditarImagen';
        labelImagen.classList.add('form-label', 'text-center', 'd-block', 'mt-2', 'mb-1');
        labelImagen.style.fontSize = '0.9rem';
        
        const inputImagen = document.createElement('input');
        inputImagen.type = 'file';
        inputImagen.accept = 'image/*';
        inputImagen.id = 'inputEditarImagen';
        inputImagen.classList.add('form-control', 'form-control-sm', 'mb-2');
        inputImagen.style.maxWidth = '300px';
        inputImagen.style.margin = '0 auto';
        
        // Preview de la nueva imagen
        inputImagen.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                // Validar tamaño
                if (archivo.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Imagen muy grande',
                        text: 'La imagen no debe superar los 5MB',
                        confirmButtonColor: '#212529'
                    });
                    inputImagen.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagenActual.src = event.target.result;
                };
                reader.readAsDataURL(archivo);
            }
        });
        
        contenedorImagen.appendChild(labelImagen);
        contenedorImagen.appendChild(inputImagen);
        
        // Guardar la ruta original de la imagen
        valoresOriginales.set('imagenOriginal', imagenActual.src);
        
        // Convertir los campos en inputs editables
        campos.forEach(span => {
            const valor = span.textContent.trim();
            let elemento;
            
            // Identificar campos de fecha y configurarlos correctamente
            const camposFecha = ['modalFechaLanzamiento', 'modalFechaCompra', 'modalFechaCaducidad'];
            const camposEnum = ['modalVersion', 'modalIdioma', 'modalCategoria'];
            
            if (camposFecha.includes(span.id)) {
                elemento = document.createElement('input');
                elemento.type = 'date';
                elemento.value = valor !== '—' ? valor : '';
            } else if (camposEnum.includes(span.id)) {
                // Crear select para campos enum
                elemento = document.createElement('select');
                
                // Configurar opciones según el campo
                if (span.id === 'modalVersion') {
                    elemento.innerHTML = `
                        <option value="">Selecciona una versión</option>
                        <option value="Standard" ${valor === 'Standard' ? 'selected' : ''}>Standard</option>
                        <option value="Deluxe" ${valor === 'Deluxe' ? 'selected' : ''}>Deluxe</option>
                        <option value="Limited Edition" ${valor === 'Limited Edition' ? 'selected' : ''}>Limited Edition</option>
                        <option value="Special Edition" ${valor === 'Special Edition' ? 'selected' : ''}>Special Edition</option>
                        <option value="Repackage" ${valor === 'Repackage' ? 'selected' : ''}>Repackage</option>
                        <option value="Mini Album" ${valor === 'Mini Album' ? 'selected' : ''}>Mini Album</option>
                        <option value="Single" ${valor === 'Single' ? 'selected' : ''}>Single</option>
                    `;
                } else if (span.id === 'modalIdioma') {
                    elemento.innerHTML = `
                        <option value="">Selecciona un idioma</option>
                        <option value="Coreano" ${valor === 'Coreano' ? 'selected' : ''}>Coreano</option>
                        <option value="Japonés" ${valor === 'Japonés' ? 'selected' : ''}>Japonés</option>
                        <option value="Inglés" ${valor === 'Inglés' ? 'selected' : ''}>Inglés</option>
                        <option value="Chino" ${valor === 'Chino' ? 'selected' : ''}>Chino</option>
                        <option value="Tailandés" ${valor === 'Tailandés' ? 'selected' : ''}>Tailandés</option>
                        <option value="Español" ${valor === 'Español' ? 'selected' : ''}>Español</option>
                        <option value="Otro" ${valor === 'Otro' ? 'selected' : ''}>Otro</option>
                    `;
                } else if (span.id === 'modalCategoria') {
                    elemento.innerHTML = `
                        <option value="">Selecciona una categoría</option>
                        <option value="K-Pop" ${valor === 'K-Pop' ? 'selected' : ''}>K-Pop</option>
                        <option value="J-Pop" ${valor === 'J-Pop' ? 'selected' : ''}>J-Pop</option>
                        <option value="Boy Group" ${valor === 'Boy Group' ? 'selected' : ''}>Boy Group</option>
                        <option value="Girl Group" ${valor === 'Girl Group' ? 'selected' : ''}>Girl Group</option>
                        <option value="Solista" ${valor === 'Solista' ? 'selected' : ''}>Solista</option>
                        <option value="Ballad" ${valor === 'Ballad' ? 'selected' : ''}>Ballad</option>
                        <option value="Dance" ${valor === 'Dance' ? 'selected' : ''}>Dance</option>
                        <option value="R&B" ${valor === 'R&B' ? 'selected' : ''}>R&B</option>
                        <option value="Hip-Hop" ${valor === 'Hip-Hop' ? 'selected' : ''}>Hip-Hop</option>
                        <option value="Rock" ${valor === 'Rock' ? 'selected' : ''}>Rock</option>
                        <option value="Indie" ${valor === 'Indie' ? 'selected' : ''}>Indie</option>
                    `;
                }
            } else {
                elemento = document.createElement('input');
                elemento.type = 'text';
                elemento.value = valor !== '—' ? valor : '';
            }
            
            elemento.classList.add('form-control', 'form-control-sm', 'mb-1');
            elemento.dataset.idCampo = span.id;
            
            // Guardar el valor original
            valoresOriginales.set(span.id, valor);
            
            span.replaceWith(elemento);
        });
        
        // Configurar validaciones de fechas
        const fechaLanzamientoInput = modalElement.querySelector('input[data-id-campo="modalFechaLanzamiento"]');
        const fechaCompraInput = modalElement.querySelector('input[data-id-campo="modalFechaCompra"]');
        const fechaCaducidadInput = modalElement.querySelector('input[data-id-campo="modalFechaCaducidad"]');
        
        if (fechaLanzamientoInput) {
            // Fecha de lanzamiento: máximo hoy
            const hoy = new Date().toISOString().split('T')[0];
            fechaLanzamientoInput.setAttribute('max', hoy);
            
            // Cuando cambia fecha de lanzamiento, actualizar mínimo de fecha de compra
            fechaLanzamientoInput.addEventListener('change', (e) => {
                if (e.target.value && fechaCompraInput) {
                    fechaCompraInput.setAttribute('min', e.target.value);
                }
            });
        }
        
        if (fechaCompraInput) {
            // Fecha de compra: máximo hoy, mínimo fecha de lanzamiento
            const hoy = new Date().toISOString().split('T')[0];
            fechaCompraInput.setAttribute('max', hoy);
            
            if (fechaLanzamientoInput && fechaLanzamientoInput.value) {
                fechaCompraInput.setAttribute('min', fechaLanzamientoInput.value);
            }
            
            // Cuando cambia fecha de compra, actualizar mínimo de fecha de caducidad
            fechaCompraInput.addEventListener('change', (e) => {
                if (e.target.value && fechaCaducidadInput) {
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
            
            // Si hay fecha de compra, actualizar mínimo
            if (fechaCompraInput && fechaCompraInput.value) {
                const fechaCompra = new Date(fechaCompraInput.value);
                fechaCompra.setDate(fechaCompra.getDate() + 1);
                const minCaducidad = fechaCompra.toISOString().split('T')[0];
                fechaCaducidadInput.setAttribute('min', minCaducidad);
            }
        }

        // Crear botones Guardar y Cancelar
        const contenedorBotones = document.createElement('div');
        contenedorBotones.classList.add('d-flex', 'justify-content-center', 'gap-3', 'mt-3');

        const btnGuardar = document.createElement('button');
        btnGuardar.textContent = 'Guardar';
        btnGuardar.classList.add('btn', 'btn-success');

        const btnCancelar = document.createElement('button');
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.classList.add('btn', 'btn-secondary');

        contenedorBotones.appendChild(btnGuardar);
        contenedorBotones.appendChild(btnCancelar);
        modalElement.querySelector('.text-start').appendChild(contenedorBotones);

        // Ocultar botones originales
        btnEditar.style.display = 'none';
        btnEliminar.style.display = 'none';

        // --- GUARDAR CAMBIOS ---
        btnGuardar.addEventListener('click', () => {
            const productoId = modalElement.dataset.productoId;
            const inputs = modalElement.querySelectorAll('input[data-id-campo]');
            
            // Validar fechas antes de guardar
            const fechaLanzamientoInput = modalElement.querySelector('input[data-id-campo="modalFechaLanzamiento"]');
            const fechaCompraInput = modalElement.querySelector('input[data-id-campo="modalFechaCompra"]');
            const fechaCaducidadInput = modalElement.querySelector('input[data-id-campo="modalFechaCaducidad"]');
            
            if (fechaLanzamientoInput && fechaLanzamientoInput.value) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaLanzamiento = new Date(fechaLanzamientoInput.value + 'T00:00:00');
                
                if (fechaLanzamiento > hoy) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Fecha inválida',
                        text: 'La fecha de lanzamiento debe ser menor o igual a hoy',
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
            }
            
            if (fechaCompraInput && fechaCompraInput.value && fechaLanzamientoInput && fechaLanzamientoInput.value) {
                const fechaLanzamiento = new Date(fechaLanzamientoInput.value + 'T00:00:00');
                const fechaCompra = new Date(fechaCompraInput.value + 'T00:00:00');
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                
                if (fechaCompra < fechaLanzamiento) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Fecha inválida',
                        text: 'La fecha de compra debe ser mayor o igual a la fecha de lanzamiento',
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
                
                if (fechaCompra > hoy) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Fecha inválida',
                        text: 'La fecha de compra debe ser menor o igual a hoy',
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
            }
            
            if (fechaCaducidadInput && fechaCaducidadInput.value && fechaCompraInput && fechaCompraInput.value) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaCompra = new Date(fechaCompraInput.value + 'T00:00:00');
                const fechaCaducidad = new Date(fechaCaducidadInput.value + 'T00:00:00');
                
                if (fechaCaducidad <= fechaCompra) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Fecha inválida',
                        text: 'La fecha de caducidad debe ser mayor a la fecha de compra',
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
                
                if (fechaCaducidad <= hoy) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Fecha inválida',
                        text: 'La fecha de caducidad debe ser mayor a hoy',
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
            }
            
            // Construir objeto con los cambios - Mapear campos del modal al backend
            const cambios = {};
            // Obtener tanto inputs como selects
            const todosLosCampos = modalElement.querySelectorAll('input[data-id-campo], select[data-id-campo]');
            
            todosLosCampos.forEach(campo => {
                const modalId = campo.dataset.idCampo; // ej: "modalNombre", "modalArtista"
                let valor = campo.value.trim();
                
                // Limpiar el símbolo $ del precio si existe
                if (modalId === 'modalPrecio' && valor.startsWith('$')) {
                    valor = valor.substring(1).trim();
                }
                
                // Mapear IDs del modal a campos del backend
                const mapaCampos = {
                    'modalNombre': 'nombreAlbum',
                    'modalArtista': 'artistaGrupo',
                    'modalVersion': 'version',
                    'modalFechaLanzamiento': 'fechaLanzamiento',
                    'modalIdioma': 'idioma',
                    'modalDuracion': 'duracion',
                    'modalPeso': 'peso',
                    'modalPrecio': 'precio',
                    'modalStock': 'stock',
                    'modalCategoria': 'categoria',
                    'modalDescripcion': 'descripcion',
                    'modalFechaCompra': 'fechaCompra',
                    'modalFechaCaducidad': 'fechaCaducidad'
                };
                
                const nombreCampo = mapaCampos[modalId];
                // Solo agregar si hay un valor válido y no es "—"
                if (nombreCampo && valor && valor !== '—') {
                    cambios[nombreCampo] = valor;
                }
            });
            
            // Validar duplicados antes de actualizar (si se cambió nombre o artista)
            if (cambios.nombreAlbum || cambios.artistaGrupo) {
                // Obtener el elemento actual (puede ser input o span según el estado)
                const elementoNombre = modalElement.querySelector('[data-id-campo="modalNombre"]') || document.getElementById('modalNombre');
                const elementoArtista = modalElement.querySelector('[data-id-campo="modalArtista"]') || document.getElementById('modalArtista');
                
                const nombreAlbumEditar = (cambios.nombreAlbum || (elementoNombre ? (elementoNombre.value || elementoNombre.textContent).trim() : '')).toLowerCase();
                const artistaGrupoEditar = (cambios.artistaGrupo || (elementoArtista ? (elementoArtista.value || elementoArtista.textContent).trim() : '')).toLowerCase();
                
                const productoExistente = productosEnMemoria.find(p => 
                    p._id !== productoId &&
                    p.nombreAlbum.toLowerCase() === nombreAlbumEditar && 
                    p.artistaGrupo.toLowerCase() === artistaGrupoEditar
                );
                
                if (productoExistente) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Producto duplicado',
                        text: `Ya existe otro producto con el nombre "${nombreAlbumEditar}" del artista/grupo "${artistaGrupoEditar}"`,
                        confirmButtonColor: '#212529'
                    });
                    return;
                }
            }
            
            // Convertir valores numéricos y validar que no sean NaN
            if (Object.prototype.hasOwnProperty.call(cambios, 'stock')) {
                const stockNum = parseInt(cambios.stock);
                if (!isNaN(stockNum)) {
                    cambios.stock = stockNum;
                } else {
                    delete cambios.stock;
                }
            }
            
            if (Object.prototype.hasOwnProperty.call(cambios, 'peso')) {
                const pesoNum = parseInt(cambios.peso);
                if (!isNaN(pesoNum)) {
                    cambios.peso = pesoNum;
                } else {
                    delete cambios.peso;
                }
            }
            
            if (Object.prototype.hasOwnProperty.call(cambios, 'precio')) {
                const precioNum = parseFloat(cambios.precio);
                if (!isNaN(precioNum)) {
                    cambios.precio = precioNum;
                } else {
                    delete cambios.precio;
                }
            }
            
            // Verificar si hay una nueva imagen
            const inputImagen = document.getElementById('inputEditarImagen');
            const tieneNuevaImagen = inputImagen && inputImagen.files && inputImagen.files.length > 0;
            
            // Si hay nueva imagen, usar FormData; si no, usar JSON
            let requestBody, headers;
            
            if (tieneNuevaImagen) {
                // Usar FormData para enviar imagen
                const formData = new FormData();
                Object.keys(cambios).forEach(key => {
                    formData.append(key, cambios[key]);
                });
                formData.append('fotoAlbum', inputImagen.files[0]);
                
                requestBody = formData;
                headers = {}; // No enviar Content-Type, el navegador lo configurará automáticamente
            } else {
                // Usar JSON para cambios sin imagen
                requestBody = JSON.stringify(cambios);
                headers = { 'Content-Type': 'application/json' };
            }
            
            // Enviar PATCH a la API
            fetch(`${API_URL}/${productoId}`, {
                method: 'PATCH',
                headers: headers,
                body: requestBody
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al actualizar el producto');
                return response.json();
            })
            .then(data => {
                console.log('Producto actualizado:', data);
                
                // Restaurar vista de spans con los valores actualizados
                todosLosCampos.forEach(campo => {
                    const span = document.createElement('span');
                    span.id = campo.dataset.idCampo;
                    span.textContent = campo.value.trim() || '—';
                    campo.replaceWith(span);
                });

                // Eliminar label e input de imagen
                const labelImagen = document.getElementById('labelEditarImagen');
                const inputImagenEliminar = document.getElementById('inputEditarImagen');
                if (labelImagen) labelImagen.remove();
                if (inputImagenEliminar) inputImagenEliminar.remove();

                contenedorBotones.remove();
                btnEditar.style.display = 'inline-block';
                btnEliminar.style.display = 'inline-block';
                
                // Recargar productos
                cargarProductos();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Cambios guardados',
                    text: 'El producto se ha actualizado correctamente',
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
                    text: 'Campos incorrectos, verifica nuevamente',
                    confirmButtonColor: '#212529'
                });
            });
        });

        // --- CANCELAR EDICIÓN ---
        btnCancelar.addEventListener('click', () => {
            const todosLosCampos = modalElement.querySelectorAll('input[data-id-campo], select[data-id-campo]');
            todosLosCampos.forEach(campo => {
                const span = document.createElement('span');
                span.id = campo.dataset.idCampo;
                // Restaurar el valor original guardado
                span.textContent = valoresOriginales.get(campo.dataset.idCampo) || '—';
                campo.replaceWith(span);
            });

            // Restaurar imagen original
            const imagenActual = document.getElementById('modalImagen');
            if (valoresOriginales.has('imagenOriginal')) {
                imagenActual.src = valoresOriginales.get('imagenOriginal');
            }
            
            // Eliminar label e input de imagen
            const contenedorImagen = document.getElementById('contenedorImagen');
            const labelImagen = contenedorImagen.querySelector('label');
            const inputImagen = document.getElementById('inputEditarImagen');
            
            if (labelImagen) labelImagen.remove();
            if (inputImagen) inputImagen.remove();

            contenedorBotones.remove();
            btnEditar.style.display = 'inline-block';
            btnEliminar.style.display = 'inline-block';
        });
    });
});