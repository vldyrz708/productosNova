// Validaciones para nombre y apellido
function soloLetrasKeydown(e) {
    const code = e.keyCode || e.which;
    if (
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        [8, 9, 32, 186, 192, 222].includes(code)
    ) {
        // permitido
    } else {
        e.preventDefault();
    }
}

function soloLetrasInput(e) {
    e.target.value = e.target.value.replace(/[0-9]/g, '');
    if (e.target.value.length > 10) {
        e.target.value = e.target.value.slice(0, 10);
    }
}

const nombreInput = document.getElementById('editarNombre');
const apellidoInput = document.getElementById('editarApellido');
if (nombreInput) {
    nombreInput.addEventListener('keydown', soloLetrasKeydown);
    nombreInput.addEventListener('input', soloLetrasInput);
}
if (apellidoInput) {
    apellidoInput.addEventListener('keydown', soloLetrasKeydown);
    apellidoInput.addEventListener('input', soloLetrasInput);
}

// Validaciones para edad
const edadInput = document.getElementById('editarEdad');
if (edadInput) {
    edadInput.addEventListener('input', function(e) {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 3) val = val.slice(0, 3);
        if (parseInt(val) > 100) val = '100';
        e.target.value = val;
    });
}

function validarFormularioUsuarioEditar() {
    let valido = true;
    if (nombreInput && (!nombreInput.value.trim() || nombreInput.value.length > 10)) {
        valido = false;
    }
    if (apellidoInput && (!apellidoInput.value.trim() || apellidoInput.value.length > 10)) {
        valido = false;
    }
    if (edadInput && (edadInput.value === '' || isNaN(edadInput.value) || parseInt(edadInput.value) > 100)) {
        valido = false;
    }
    return valido;
}
