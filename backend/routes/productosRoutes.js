const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

// Ruta para obtener la lista de productos
router.get('/', productosController.getProductos);

module.exports = router;
