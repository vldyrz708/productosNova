const User = require('../modules/User');

// Crear usuario
async function crearUsuario(req, res, next) {
    try {
        const { nombre, apellido, edad, numeroTelefono, rol } = req.body;
        const nuevo = new User({ nombre, apellido, edad, numeroTelefono, rol });
        const guardado = await nuevo.save();
        res.status(201).json({ success: true, user: guardado });
    } catch (error) {
        next(error);
    }
}

// Obtener todos los usuarios
async function obtenerUsuarios(req, res, next) {
    try {
        const usuarios = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, users: usuarios });
    } catch (error) {
        next(error);
    }
}

// Obtener usuario por id
async function obtenerUsuarioPorId(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
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
        const cambios = req.body;
        const actualizado = await User.findByIdAndUpdate(id, cambios, { new: true, runValidators: true });
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
