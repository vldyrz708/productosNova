const express = require('express');
const router = express.Router();
const userCtrl = require('../controller/userController');

// Rutas: /api/users
router.get('/', userCtrl.obtenerUsuarios);
router.post('/', userCtrl.crearUsuario);
router.get('/:id', userCtrl.obtenerUsuarioPorId);
router.patch('/:id', userCtrl.actualizarUsuario);
router.delete('/:id', userCtrl.eliminarUsuario);

module.exports = router;
