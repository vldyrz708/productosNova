const User = require('../modules/User');
const bcrypt = require('bcryptjs');

// Crear usuario
async function crearUsuario(req, res, next) {
    try {
        // Aceptar tanto 'contrasena' como 'password' desde el frontend
        const { nombre, apellido, edad, numeroTelefono, rol, correo } = req.body;
        let password = req.body.contrasena || req.body.password;
        if (!password) return res.status(400).json({ success: false, message: 'La contraseña es requerida' });

        const nuevo = new User({ nombre, apellido, edad, numeroTelefono, rol, correo, password });
        const guardado = await nuevo.save();
        const obj = guardado.toObject();
        delete obj.password;
        res.status(201).json({ success: true, user: obj });
    } catch (error) {
        next(error);
    }
}

// Obtener todos los usuarios
async function obtenerUsuarios(req, res, next) {
    try {
        const usuarios = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users: usuarios });
    } catch (error) {
        next(error);
    }
}

// Obtener usuario por id
async function obtenerUsuarioPorId(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
}

// Actualizar usuario (patch)
async function actualizarUsuario(req, res, next) {
    try {
        const { id } = req.params;
        const cambios = { ...req.body };
        // Si vienen contrasena o password, hashearla antes de actualizar
        let plain = cambios.contrasena || cambios.password;
        if (plain) {
            const salt = await bcrypt.genSalt(10);
            cambios.password = await bcrypt.hash(plain, salt);
            delete cambios.contrasena;
        }
        const actualizado = await User.findByIdAndUpdate(id, cambios, { new: true, runValidators: true }).select('-password');
        if (!actualizado) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, user: actualizado });
    } catch (error) {
        next(error);
    }
}

// Eliminar usuario
async function eliminarUsuario(req, res, next) {
    try {
        const { id } = req.params;
        const eliminado = await User.findByIdAndDelete(id);
        if (!eliminado) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
};
