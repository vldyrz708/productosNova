const usuarios = [{
        nombre: "Alyn",
        apellido: "Sanchez",
        edad: 20,
        telefono: "771-555-2311",
        rol: "Gerente",
        correo: "alyn@example.com",

    },
    {
        nombre: "Vladimir",
        apellido: "Alvarez",
        edad: 25,
        telefono: "552-881-9921",
        rol: "Admin",
        correo: "vlad@example.com",

    },
    {
        nombre: "Mia",
        apellido: "Flores",
        edad: 20,
        telefono: "558-772-4410",
        rol: "Cajero",
        correo: "mia@example.com",

    }
];

// Llenar tabla con usuarios
window.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("cuerpoTablaUsuarios");

    usuarios.forEach(u => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.apellido}</td>
            <td>${u.edad}</td>
            <td>${u.telefono}</td>
            <td>${u.rol}</td>
            <td>${u.correo}</td>
        `;

        tbody.appendChild(fila);
    });
});