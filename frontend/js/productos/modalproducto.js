setTimeout(() => {
    const btnEditar = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const modalElement = document.getElementById('modalProducto');

    if (!btnEditar || !btnEliminar || !modalElement) {
        console.error('⚠️ No se encontraron los elementos del modal');
        return;
    }

    // --- ELIMINAR PRODUCTO ---
    btnEliminar.addEventListener('click', () => {
        const confirmar = confirm('¿Estás seguro de que deseas eliminar este producto?');
        if (confirmar) {
            alert('✅ Producto eliminado con éxito (aquí iría la lógica real de eliminación).');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        }
    });

    // --- EDITAR PRODUCTO ---
    btnEditar.addEventListener('click', () => {
        const campos = modalElement.querySelectorAll('span[id^="modal"]');

        // Convertir los campos en inputs editables
        campos.forEach(span => {
            const valor = span.textContent.trim();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = valor !== '—' ? valor : '';
            input.classList.add('form-control', 'form-control-sm', 'mb-1');
            input.dataset.idCampo = span.id;
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
            const inputs = modalElement.querySelectorAll('input[data-id-campo]');
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.id = input.dataset.idCampo;
                span.textContent = input.value.trim() || '—';
                input.replaceWith(span);
            });

            contenedorBotones.remove();
            btnEditar.style.display = 'inline-block';
            btnEliminar.style.display = 'inline-block';
            alert('Cambios guardados (No se guardan el el archivo .json).');
        });

        // --- CANCELAR EDICIÓN ---
        btnCancelar.addEventListener('click', () => {
            const inputs = modalElement.querySelectorAll('input[data-id-campo]');
            inputs.forEach(input => {
                const span = document.createElement('span');
                span.id = input.dataset.idCampo;
                span.textContent = input.value.trim() || '—';
                input.replaceWith(span);
            });

            contenedorBotones.remove();
            btnEditar.style.display = 'inline-block';
            btnEliminar.style.display = 'inline-block';
        });
    });
}, 300);
ok