// Simulación de datos de productos (reemplaza esto con tu lógica de base de datos)
const productos = [
    { id: 1, nombre: 'Producto 1', precio: 100, stock: 50 },
    { id: 2, nombre: 'Producto 2', precio: 200, stock: 30 },
    { id: 3, nombre: 'Producto 3', precio: 300, stock: 20 },
];

// Controlador para obtener la lista de productos
exports.getProductos = (req, res) => {
    res.json(productos);
};
