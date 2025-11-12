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
        // Restaurar todos los inputs a spans si el modal estaba en modo edición
        const inputs = modalElement.querySelectorAll('input[data-id-campo]');
        if (inputs.length > 0) {
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.id = input.dataset.idCampo;
                span.textContent = input.value.trim() || '—';
                input.replaceWith(span);
            });
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
        
        // Convertir los campos en inputs editables
        campos.forEach(span => {
            const valor = span.textContent.trim();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = valor !== '—' ? valor : '';
            input.classList.add('form-control', 'form-control-sm', 'mb-1');
            input.dataset.idCampo = span.id;
            
            // Guardar el valor original
            valoresOriginales.set(span.id, valor);
            
            span.replaceWith(input);
        });

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
            
            // Construir objeto con los cambios - Mapear campos del modal al backend
            const cambios = {};
            inputs.forEach(input => {
                const modalId = input.dataset.idCampo; // ej: "modalNombre", "modalArtista"
                const valor = input.value.trim();
                
                // Mapear IDs del modal a campos del backend
                const mapaCampos = {
                    'modalNombre': 'nombreAlbum',
                    'modalArtista': 'artistaGrupo',
                    'modalVersion': 'version',
                    'modalFechaLanzamiento': 'fechaLanzamiento',
                    'modalIdioma': 'idioma',
                    'modalDuracion': 'duracion',
                    'modalPeso': 'peso',
                    'modalStock': 'stock',
                    'modalCategoria': 'categoria',
                    'modalDescripcion': 'descripcion',
                    'modalFechaCompra': 'fechaCompra',
                    'modalFechaCaducidad': 'fechaCaducidad'
                };
                
                const nombreCampo = mapaCampos[modalId];
                if (nombreCampo && valor) {
                    cambios[nombreCampo] = valor;
                }
            });
            
            // Validar duplicados antes de actualizar (si se cambió nombre o artista)
            if (cambios.nombreAlbum || cambios.artistaGrupo) {
                const nombreAlbumEditar = (cambios.nombreAlbum || document.getElementById('modalNombre').textContent.trim()).toLowerCase();
                const artistaGrupoEditar = (cambios.artistaGrupo || document.getElementById('modalArtista').textContent.trim()).toLowerCase();
                
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
            
            // Convertir valores numéricos
            if (cambios.stock) cambios.stock = parseInt(cambios.stock);
            if (cambios.peso) cambios.peso = parseInt(cambios.peso);
            
            // Enviar PATCH a la API
            fetch(`${API_URL}/${productoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cambios)
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al actualizar el producto');
                return response.json();
            })
            .then(data => {
                console.log('Producto actualizado:', data);
                
                // Restaurar vista de spans con los valores actualizados
                inputs.forEach(input => {
                    const span = document.createElement('span');
                    span.id = input.dataset.idCampo;
                    span.textContent = input.value.trim() || '—';
                    input.replaceWith(span);
                });

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
                    text: 'No se pudieron guardar los cambios. Verifica que el servidor esté corriendo.',
                    confirmButtonColor: '#212529'
                });
            });
        });

        // --- CANCELAR EDICIÓN ---
        btnCancelar.addEventListener('click', () => {
            const inputs = modalElement.querySelectorAll('input[data-id-campo]');
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.id = input.dataset.idCampo;
                // Restaurar el valor original guardado
                span.textContent = valoresOriginales.get(input.dataset.idCampo) || '—';
                input.replaceWith(span);
            });

            contenedorBotones.remove();
            btnEditar.style.display = 'inline-block';
            btnEliminar.style.display = 'inline-block';
        });
    });
}, 300);