const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar conexión a la base de datos
const conection = require('./database/conection');

// Importar rutas
const albumRoutes = require('./routes/albumRoutes');

const app = express();
const PORT = 3001;

// CORS básico (suficiente para Scalar)
app.use(cors());
app.use(express.json());

// Conectar a Mongo
conection();

// Rutas principales solo para pruebas de Scalar
app.use('/api/albums', albumRoutes);

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor 3001 funcionando para pruebas de Scalar'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de pruebas corriendo en http://localhost:${PORT}/api`);
});
