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
        const confirmar = confirm('¿Estás seguro de que deseas eliminar este producto?');
        if (confirmar) {
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
                alert('Producto eliminado con éxito');
                
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();
                
                // Recargar productos
                cargarProductos();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el producto. Verifica que el servidor esté corriendo.');
            });
        }
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
                
                alert('Cambios guardados exitosamente');
                
                // Recargar productos
                cargarProductos();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al guardar los cambios. Verifica que el servidor esté corriendo.');
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