const express = require('express');
const router = express.Router();
const userCtrl = require('../controller/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Rutas: /api/users
// Protegemos la ruta de usuarios: requiere autenticación
router.get('/', verifyToken, requireRole('Admin','Gerente'), userCtrl.obtenerUsuarios);
router.post('/', verifyToken, requireRole('Admin','Gerente'), userCtrl.crearUsuario);
router.get('/:id', verifyToken, requireRole('Admin','Gerente'), userCtrl.obtenerUsuarioPorId);
router.patch('/:id', verifyToken, requireRole('Admin','Gerente'), userCtrl.actualizarUsuario);
router.delete('/:id', verifyToken, requireRole('Admin'), userCtrl.eliminarUsuario);

module.exports = router;
